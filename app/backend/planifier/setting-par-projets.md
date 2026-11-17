# Stratégie de Mini-Paramètres par Projet (KISS / Solo-First)

> **État : implémenté** (frontend + backend). Ce document reflète la réalité du code.

## 1. Philosophie & Architecture

Pour garantir une interface ultra-légère, rapide et sans sur-ingénierie, chaque projet dispose de sa propre mini-page de configuration dédiée. Les paramètres globaux (`/settings`) restent exclusivement réservés au compte utilisateur.

* **Modèle de données plat :** Relation directe `projects.userId` → `users.id` (zéro couche Workspace inutile en mode solo).
* **Route dédiée :** `/kanban/$projectSlug/settings` (route enfant TanStack Router, fichier `kanban.$projectSlug.settings.tsx`).
* **Décision de rendu :** le board parent (`kanban.$projectSlug.tsx`) masque le `KanbanBoard` quand la route settings est active (`useMatches`) — la page de settings est plein écran. Exception : `/archive` reste en superposition par-dessus le board.
* **Anti-clignotement :** `RouteTransition` (`__root.tsx`) ne déclenche aucune transition au sein de la section `/kanban` (settings, archive, changement de projet, redirect initial). Le chunk de la page est **préchargé au survol** du bouton latéral (`onPointerEnter` / `onFocus`).
* **Accès :** icône `⋯` (MoreHorizontal) sur chaque projet de la barre latérale (`nav-projects.tsx`).

## 2. Périmètre Fonctionnel (2 Blocs)

La page (`features/project-settings/ProjectSettingsPage.tsx`) est volontairement limitée à l'essentiel :

1. **Identité du Projet :**
   * Nom (30 car.) et description (200 car.), compteurs de caractères live, détection de modifications (`isDirty` — le bouton Enregistrer reste désactivé tant que rien n'a changé), bouton retour au tableau, squelettes de chargement, état « projet introuvable ».
   * La synchronisation du formulaire n'écrase jamais une saisie en cours ; `key={projectSlug}` réinitialise l'état à chaque changement de projet.
   * i18n complet (fr/en, clés `settings.project.*`) et tokens sémantiques du `global.css` uniquement (`bg-surface-card`, `text-text-label`…) — adaptation clair/sombre automatique.
2. **Zone de Danger :**
   * Bouton rouge (`variant="destructive"`) sous le titre « Zone dangereuse ».
   * **Double confirmation obligatoire** (`DeleteProjectDialog.tsx`) :
     1. le bouton rouge ouvre le dialogue d'avertissement (liste de tout ce qui sera détruit) ;
     2. l'utilisateur doit saisir le nom exact du projet pour activer « Supprimer définitivement ».
   * **Pattern GitHub Primer (copie inline) :** le nom du projet est intégré à la consigne en texte cliquable — couleur lien (`text-primary`), soulignement pointillé, icône copie adjacente. Un clic copie. Bouton **toujours visible** (jamais hover-only), échange d'icône copie → coche verte ~2 s, succès affiché **seulement si l'écriture a réussi**, échec jamais silencieux (message inline + sélection manuelle de secours, `select-all`), label accessible nommant le contenu, annonce sr-only (`role="status"`), bouton non désactivé pendant le feedback.
   * **Mention juridique** dans le dialogue (voir §5).

## 3. Endpoints API

Le contrôle d'accès passe par `requirePermission({ project: [...] })` + vérification de propriété (`project.userId === session.user.id`).

* **`GET /api/v1/projects/{projectId}`** : hydrate la vue.
* **`PATCH /api/v1/projects/{projectId}`** : met à jour l'identité (validation Zod : nom ≤ 30, description ≤ 200).
* **`DELETE /api/v1/projects/deletedProject/{id}`** : supprime définitivement le projet et ses données enfants (`onDelete: "cascade"` sur cartes et archives). Journal d'audit poussé **dans la même transaction** — voir `audit-log.md` (`PROJECT_DELETED`, metadata `{ projectId, projectName }`).

## 4. États & Synchronisation du Cache

* **Après un `PATCH` :** `queryClient.setQueryData(["projects"], …)` — le nom se met à jour dans la barre latérale sans rechargement.
* **Après un `DELETE` :** purge du cache (`projects`, `tasks`, `archived`) puis redirection vers `/kanban` (redirigé vers le premier projet restant).
* **Projet introuvable / erreur :** message dédié + bouton retour au tableau (pas de redirection silencieuse).

## 5. Protection Juridique (Suppression)

Le message de confirmation applique le droit FR/UE :

* **Exonération ciblée, jamais générale** (art. 1171 C. civ. — une décharge totale serait réputée non écrite) : la responsabilité n'est pas engagée « pour une suppression que vous avez expressément confirmée ».
* **Information préalable claire** : irréversibilité, aucune copie de restauration conservée, recommandation d'exporter avant — le silence sur ces points est systématiquement interprété contre l'éditeur.
* **Consentement éclairé + traçabilité** : double confirmation explicite + écriture d'audit côté serveur = la preuve que l'action était délibérée et non accidentelle.
* Texte i18n `settings.dangerZone.legal*` (fr/en) : intro + 3 points + clause de responsabilité (`legalLiability`, `{{appName}}` interpolé depuis `brand.name`, rendue en évidence — lisibilité = opposabilité).
