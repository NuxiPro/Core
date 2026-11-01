# Stratégie d'Authentification & Récupération de Compte — NuxiPro

## 1. Principes Fondamentaux
* **Passwordless First :** Authentification principale via *Magic Link* (sans mot de passe).
* **Souveraineté & Responsabilité :** Données sécurisées, utilisateur responsable de la conservation de ses clés de secours.
* **Zéro-RGPD sur la Récupération :** Aucune collecte ni stockage de documents d'identité officiels (passeports, CNI). Seules les métadonnées internes existantes sont utilisées.

---

## 2. Niveaux de Sécurité & Clés d'Accès

### A. Accès Standard (Quotidien)
* **Vecteur :** Magic Link par e-mail.
* **Sécurité Anti-Bot/Anti-Spam :** 
  * Invalidation du jeton (*token*) dès la première requête HTTP.
  * Durée de vie courte du jeton (5-10 min).
  * Redirection sur page de confirmation intermédiaire pour bloquer la pré-lecture par les robots d'indexation e-mail.

### B. Second Facteur & Codes de Secours (Better Auth `2fa` Plugin)
* **2FA Optionnel / Recommandé :** TOTP (Aegis, 2FAS, Bitwarden) ou Passkey.
* **Recovery Codes (Codes de secours) :** 
  * Générés automatiquement via Better Auth (3 à 10 codes à usage unique).
  * Permettent de passer outre le TOTP ou de réinitialiser l'e-mail si la boîte mail est inaccessible.

### C. Identifiant Unique de Compte (`Account ID`)
* **Format :** Identifiant unique immuable généré à l'inscription (ex: `usr_nuxi_9f8a2b3c`).
* **Usage :** Clé de vérification ultime pour la procédure de support manuelle en dernier recours.

---

## 3. Parcours Utilisateur Step-by-Step

### Étape 1 : Inscription & Onboarding (Enregistrement de l'Account ID)
1. L'utilisateur saisit son adresse e-mail et valide son premier Magic Link.
2. Le compte est créé dans PostgreSQL.
3. **Modale d'Onboarding Obligatoire :**
   * L'application affiche l'`Account ID` unique (ex: `usr_nuxi_9f8a2b3c`).
   * Consigne : *"Conservez cet identifiant dans votre gestionnaire de mots de passe (ex: Bitwarden). Il s'agit de votre preuve de propriété en cas de perte de votre boîte e-mail."*
   * Case à cocher : `[x] J'ai sauvegardé mon Account ID en lieu sûr`.

### Étape 2 : Configuration Optionnelle (2FA & Recovery Codes)
1. Dans `/settings/account`, l'utilisateur active le 2FA (Plugin Better Auth).
2. L'application génère les **Recovery Codes**.
3. L'utilisateur télécharge ou copie ces codes à usage unique.

### Étape 3 : Modification d'E-mail Sécurisée (Self-Service)
1. Dans `/settings/account`, l'utilisateur saisit sa nouvelle adresse e-mail.
2. Un e-mail de confirmation est envoyé à la **nouvelle adresse** (Double Opt-In).
3. Un e-mail d'alerte immédiat est envoyé à l'**ancienne adresse** avec un lien d'annulation d'urgence sous 24h.
4. L'adresse n'est mise à jour en BDD qu'après validation du lien sur la nouvelle adresse.

### Étape 4 : Procédure de Récupération Ultime (Support Manuel)
Si l'utilisateur a perdu l'accès à sa boîte e-mail ET à ses codes de secours / 2FA :

1. **Soumission de la demande (Formulaire de Support) :**
   L'utilisateur fournit 3 éléments d'identification :
   * Son **Account ID** (`usr_nuxi_9f8a2b3c`).
   * Son **ancienne adresse e-mail**.
   * Le **nom exact d'au moins 1 ou 2 projets / espaces de travail** créés sur son compte.
2. **Vérification Backend / Admin (Toi) :**
   Exécution d'une requête de contrôle croisé dans PostgreSQL :
   ```sql
   SELECT u.id, u.email, p.name 
   FROM "user" u
   JOIN "project" p ON p.owner_id = u.id
   WHERE u.id = 'usr_nuxi_9f8a2b3c' 
     AND u.email = 'ancien@email.com';
   ```
3. **Validation & Migration :**
   * Si les 3 métadonnées concordent, l'administrateur met à jour le champ `email` vers la nouvelle adresse demandée.
   * Un Magic Link de première connexion est émis vers la nouvelle adresse.

---

## 4. Matrice de Responsabilité

| Scénario | Moyen de Résolution | Responsabilité |
| :--- | :--- | :--- |
| **Connexion quotidienne** | Magic Link par e-mail | **Application** |
| **Piratage e-mail / Session compromise** | 2FA TOTP + Alerte d'annulation 24h sur changement e-mail | **Application & Utilisateur** |
| **Perte de l'appareil 2FA** | Recovery Codes (Plugin Better Auth) | **Utilisateur** (sauvegarde initiale) |
| **Perte d'accès à la boîte e-mail** | Recovery Codes OU Support (Account ID + Projet) | **Utilisateur** (sauvegarde Account ID) |
| **Perte d'accès e-mail + ID perdu + Pas de codes** | *Compte irrécupérable* | **Utilisateur** (perte définitive) |

---

## 5. Avantages de la Stratégie
1. **Sécurité maximale :** Protection contre le piratage d'e-mail et les attaques d'ingénierie sociale.
2. **Conformité RGPD stricte :** Aucun document d'identité stocké ou manipulé.
3. **Simplicité technique (KISS) :** Repose entièrement sur le stack Hono + Bun + Better Auth + PostgreSQL.
