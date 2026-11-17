# Stratégie d'Audit de Sécurité, Souveraineté & Conformité RGPD — NuxiPro

Ce document définit l'architecture technique et juridique de la journalisation de sécurité (`audit_logs`), le cycle de vie des comptes compromis et le partage des responsabilités pour **NuxiPro**, selon une approche **KISS** et **Zéro-RGPD**.

---

## 1. Philosophie : « Qui fait quoi et quand » (Zéro Donnée Métier)

L'objectif des `audit_logs` est d'assurer la traçabilité des actions critiques liées à la sécurité d'un compte, sans jamais violer la confidentialité de l'utilisateur.

* **Approche événementielle :** Une ligne par événement (`INSERT` immuable), jamais une colonne fourre-tout écrasée.
* **Isolation stricte des contenus privés :** Aucun titre de tâche, description, note ou contenu de projet n'est jamais enregistré dans les logs.
* **Séparation Infra vs Sécurité :**
  * **PostgreSQL (UpCloud - UE) :** Stockage souverain et persistant des `audit_logs` de sécurité.
  * **OpenObserve Cloud (UE) :** Uniquement les logs techniques d'observabilité (latence API, erreurs serveur, CPU/RAM), strictement anonymisés (aucun e-mail ni contenu métier).
  * **Cloudflare (Transitoire) :** Utilisé temporairement comme proxy réseau/TLS et protection DDoS (DPA RGPD standard), sans stockage persistant des données au repos (cible : migration 100 % UE).

---

## 2. Structure de la Table `audit_logs` (PostgreSQL)

La table est hébergée directement dans la base PostgreSQL principale de NuxiPro (pas de service tiers externe).

| Colonne | Type SQL | Contraintes | Description & Rôle |
| :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | `PRIMARY KEY` | Identifiant unique et immuable **de l'événement**. Généré côté backend via le helper `uuid()` existant (UUID **v7**, triable dans le temps) — pattern du codebase, aucune infrastructure nouvelle. La v7 rend l'index `(user_id, created_at)` et les scans par plage temporelle efficaces, et permet une pagination par curseur sur `id` ≈ temps. |
| **`user_id`** | `UUID` | `NOT NULL`, `INDEX (user_id, created_at DESC)` | Référence l'utilisateur concerné. **Aucune clé étrangère** (ni `CASCADE` ni `RESTRICT`) : la trace survit au compte, et la purge à 2 ans est manuelle (§5). |
| **`action`** | `VARCHAR(50)` | `NOT NULL` | Type d'événement standardisé (ex: `LOGIN_SUCCESS`, `EMAIL_CHANGED`, `2FA_DISABLED`). |
| **`metadata`** | `JSONB` | `DEFAULT '{}'` | Contexte technique minimal de l'action (ex: ancien/nouvel e-mail, `projectId` + `projectName`, IP hashée en **HMAC-SHA256 avec un secret serveur** via `CF-Connecting-IP` — un hash simple d'une IPv4 est réversible par force brute). **Zéro donnée métier** (voir exception justifiée pour `PROJECT_DELETED`). |
| **`created_at`** | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Horodatage exact (UTC) de l'événement — **horloge serveur**, seule opposable en cas de litige. |

### Catalogue des Actions Enregistrées (`action`)
* `ACCOUNT_CREATED` : Création du compte et génération de l'`Account ID`.
* `LOGIN_SUCCESS` : Connexion validée (via Magic Link + 2FA si actif).
* `LOGIN_FAILED` : Tentative de connexion refusée. Prouve la vigilance de l'éditeur en cas de tentative d'intrusion.
* `EMAIL_CHANGE_REQUESTED` : Demande d'OTP pour changement d'adresse e-mail.
* `EMAIL_CHANGED` : Basculement effectif (`metadata: { "oldEmail": "...", "newEmail": "..." }`).
* `2FA_ENABLED` / `2FA_DISABLED` : Activation ou désactivation du TOTP.
* `PROJECT_DELETED` : Suppression définitive d'un projet. **Seule exception de minimisation assumée** : `metadata: { "projectId": "...", "projectName": "..." }`. Le nom est capturé **avant** la suppression en cascade ; sans lui, le projet disparaissant de la base, la preuve resterait un UUID sans signification lisible. La finalité (prouver l'action) est celle du présent document, la minimisation (art. 5.1.c) reste respectée — ni description, ni contenu, ni nombre de tâches.
* `ACCOUNT_DELETED` : Suppression volontaire du compte par l'utilisateur (voir §5, cas de la rétention).
* `ACCOUNT_BANNED` / `ACCOUNT_RESTORED` : Verrouillage manuel pour audit ou déblocage après vérification.

### Immuabilité Contrainte
La table est `INSERT only` par construction : `REVOKE UPDATE, DELETE ON audit_logs FROM <rôle applicatif>` côté PostgreSQL. Une piste d'audit modifiable ne vaut rien devant un juge ; la seule suppression possible est la purge programmée (§5), effectuée via le rôle d'administration.

---

## 3. Mécanisme d'Enregistrement ("Push")

Les logs sont insérés de manière synchrone ou transactionnelle depuis le backend **Hono** via un helper unique `logAuditEvent(userId, action, metadata)` :

1. **Via les `databaseHooks` de Better Auth :** Intercepte automatiquement les créations de sessions, mises à jour d'e-mail et modifications de statut 2FA.
2. **Via les routes Hono sensibles :** Appelé explicitement lors des opérations destructrices (ex: `DELETE /api/projects/:id`) — **dans la même transaction** que l'action : impossible d'avoir une suppression sans sa trace, ni une trace sans suppression. Les identifiants (`projectId`, `projectName`) sont **réutilisés tels quels** depuis les données existantes, capturés avant la cascade — aucun identifiant nouveau n'est créé.

---

## 4. Cadre Légal RGPD (Sans Bannière de Consentement)

La journalisation de sécurité **ne nécessite pas le consentement préalable (opt-in)** de l'utilisateur :

* **Base légale (Article 6.1.f du RGPD) :** *Intérêt légitime* de l'éditeur à sécuriser sa plateforme, prévenir la fraude et détecter les accès non autorisés.
* **Obligation de sécurité (Article 32 du RGPD) :** Mesure technique appropriée pour garantir l'intégrité et la traçabilité des accès aux comptes.
* **Minimisation (Article 5.1.c) :** Collecte limitée au strict nécessaire technique (pas de collecte de pièce d'identité, pas de tracking comportemental).
* **Transparence :** Mention claire dans la Politique de Confidentialité précisant la finalité sécuritaire et la durée de conservation.

---

## 5. Procédure de Compromission, Audit Manuel & Rétention (2 Ans)

Aucun verrouillage n'est déclenché automatiquement par un formulaire public (afin d'éviter tout déni de service). Toutes les interventions d'audit sont **manuelles et asynchrones** (traitement sous 24h à 72h ouvrées via accès SSH / `psql`).

### Étape 1 : Gel d'urgence (Kill-Switch manuel)
Dès prise en charge d'un signalement de piratage par l'administrateur :
1. Passage manuel du compte à `banned = true` et enregistrement de `banned_at = NOW()`.
2. Suppression immédiate de toutes les sessions actives en base (`DELETE FROM "session" WHERE user_id = '...'`).
3. Le hook Better Auth bloque toute nouvelle création de session ou envoi de Magic Link.

### Étape 2 : Vérification Hors-Bande (Zéro Pièce d'Identité)
L'utilisateur doit fournir **3 preuves croisées** vérifiables dans PostgreSQL et `audit_logs` :
1. Son **`Account ID`** immuable (`usr_nuxi_...`) remis lors de l'inscription.
2. Son **adresse e-mail d'origine** (corroborée par l'historique `EMAIL_CHANGED` dans `audit_logs`).
3. Le **nom exact d'au moins 1 ou 2 projets** présents sur le compte.

### Étape 3 : Issue de l'Audit
* **Cas A — Identité prouvée :** L'administrateur restaure l'adresse e-mail légitime, réinitialise le 2FA compromis, et repasse `banned = false` (`banned_at = NULL`).
* **Cas B — Preuve impossible (Perte totale des clés) :** L'accès est définitivement refusé. Le compte reste verrouillé (`banned = true`) en quarantaine pendant **2 ans** (délai légal de prescription / conservation sécurisée), puis l'intégralité du compte, des projets et des `audit_logs` associés est **purgée définitivement**.

### Rétention — Compte Supprimé Volontairement
En cas de suppression volontaire du compte (droit à l'effacement) : les données métier (projets, tâches, workspace) sont purgées immédiatement via la cascade. Les `audit_logs` de sécurité sont conservés **2 ans** (aligné sur la quarantaine, couvrant le délai de prescription contractuelle) sous base légale 6.1.f — c'est la trace qui permet à l'éditeur de prouver ce que le compte a fait de son vivant — puis purgés à leur tour.

---

## 6. Partage des Responsabilités

| Domaine | Responsabilité Éditeur (NuxiPro) | Responsabilité Utilisateur (Souveraineté) |
| :--- | :--- | :--- |
| **Authentification** | Fournir des Magic Links courts, OTP e-mail, alertes de changement et 2FA TOTP. | Protéger l'accès à sa boîte mail principale et activer le 2FA. |
| **Clés de secours** | Générer un `Account ID` unique à l'inscription et le rendre accessible dans les paramètres. | Sauvegarder son `Account ID` et ses *Recovery Codes* dans un gestionnaire (ex: Bitwarden). |
| **Audit & Support** | Maintenir les `audit_logs` sans contenu privé ; bloquer et auditer manuellement sous 24h-72h. | Signaler rapidement toute alerte suspecte en fournissant ses 3 preuves hors-bande. |
| **Cycle de vie RGPD** | Héberger les données en UE et purger les comptes bannis/orphelins au bout de **2 ans**. | Assumer la perte définitive du compte en cas de perte simultanée de l'e-mail, du 2FA et de l'`Account ID`. |
