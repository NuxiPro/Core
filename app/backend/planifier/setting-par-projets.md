# Stratégie de Mini-Paramètres par Projet (KISS / Solo-First)

## 1. Philosophie & Architecture

Pour garantir une interface ultra-légère, rapide et sans sur-ingénierie, chaque projet dispose de sa propre mini-page de configuration dédiée. Les paramètres globaux (`/settings`) restent exclusivement réservés au compte utilisateur.

* **Modèle de données plat :** Relation directe `projects.userId` $\rightarrow$ `users.id` (zéro couche Workspace inutile en mode solo).
* **Route dédiée :** `/projects/:id/settings`, accessible directement depuis l'icône `*` dans l'en-tête du projet actif.
* **Scalabilité & Navigation :** Si l'utilisateur possède de nombreux projets, un simple filtre textuel côté client (en mémoire sur la liste déjà chargée) permet de les retrouver instantanément sans requête serveur supplémentaire.

## 2. Périmètre Fonctionnel Strict (2 Blocs Max)

La page `/projects/:id/settings` est volontairement limitée à l'essentiel pour éviter toute dérive fonctionnelle :

1. **Identité du Projet :**
   * Affichage et modification du nom du projet (et description courte si applicable).
2. **Zone de Danger :**
   * Suppression définitive du projet avec **double confirmation obligatoire** (saisie manuelle du nom exact du projet pour débloquer le bouton d'action) afin d'éliminer tout risque de perte de données accidentelle.

## 3. Endpoints API (Minimalistes)

L'architecture backend se limite strictement aux opérations nécessaires sur la ressource projet :

* **`GET /projects/:id`** : Récupère uniquement les informations du projet ciblé pour hydrater la vue.
* **`PATCH /projects/:id`** : Met à jour l'identité du projet (validation stricte des données via Zod).
* **`DELETE /projects/:id`** : Supprime définitivement le projet et l'ensemble de ses données enfants en base (`onDelete: "cascade"`).

## 4. Sécurité, États & Synchronisation

* **Contrôle d'accès :** Un middleware vérifie systématiquement l'authentification et la propriété (`project.userId === session.user.id`). En cas de projet inexistant (`404`) ou non autorisé (`403`), l'utilisateur est immédiatement redirigé vers le tableau de bord.
* **Synchronisation du cache :**
  * **Après un `PATCH` :** Invalidation du cache global pour mettre à jour le nom du projet dans la barre latérale sans rechargement.
  * **Après un `DELETE` :** Invalidation du cache global et redirection immédiate vers la vue principale des projets.
