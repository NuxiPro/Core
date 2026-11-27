# TODO

## Backend

- Migrer loops vers Plunk (migration en cours, non terminée).
- Redis (anticipation, pas de besoin actuel) : seulement si p95 requêtes
  monte ou pool DB saturé — via `secondaryStorage` better-auth
  (sessions + rate-limits), les tokens magic-link restent en DB.

---

## Audit — réactivité et qualité (26/11)

**Invariant premium :** aucune attente artificielle ne doit retarder une
réponse, une mutation ou une navigation. Garder le vrai temps réseau quand
il est nécessaire, mais afficher le feedback immédiatement. Les animations
restent courtes, non bloquantes et ne pilotent jamais la mutation.

### Réactivité — frontend

- [x] **Connexion — retirer les attentes artificielles**
  (`app/web-frontend/src/features/auth/components/LoginForm.tsx`) :
  le formulaire attend au moins 700 ms après la requête, puis 450 ms avant
  l’état de succès. Même les erreurs et le lien de vérification attendent
  700 ms. Afficher chaque résultat dès que la requête répond. Corrigé :
  succès/erreur traités dès la réponse API.
- [x] **Suppression d’une tâche — ne pas attendre l’animation**
  (`app/web-frontend/src/features/board/components/task/card/useTaskCardActions.ts`) :
  l’appel de suppression part sur `animationend`, donc 160 ms après le clic.
  Déclencher la mutation immédiatement ; si une sortie visuelle est conservée,
  elle ne doit pas la retarder. Éviter aussi `scale(0)` et l’animation de
  propriétés de mise en page dans `global.css`. Corrigé : mutation au clic,
  animation de suppression retirée.
- [x] **Création de projet — retirer la pause post-réponse**
  (`app/web-frontend/src/layout/sidebar/new-project-dialog.tsx`) :
  le cache et la navigation attendent encore 200 ms après la réponse serveur.
  Corrigé : cache et navigation mis à jour directement après la réponse.
- [x] **Navigation — supprimer le temps mort bloquant**
  (ancien `layout/components/RouteTransition.tsx`) :
  l’ancienne page reste affichée 80 ms avec les interactions bloquées, puis
  la nouvelle entre sur 120 ms. Corrigé : affichage direct de la nouvelle route.
- [x] **Onboarding — retirer la pause fixe après succès**
  (`app/web-frontend/src/features/onboarding/OnboardingWizard.tsx`) :
  la redirection attend 400 ms. Garder le feedback si utile, mais ne pas
  retarder artificiellement l’accès au tableau. **Conserver** l’attente réelle
  du `PATCH /setting`, nécessaire pour enregistrer le choix. Corrigé :
  redirection immédiate après la tentative de sauvegarde.
- [ ] **Transitions des contrôles**
  (`app/web-frontend/global.css:18-23`) : la règle globale force
  `transition-duration: 0ms` et neutralise les transitions déclarées par les
  composants. Vérifier l’intention avant de la changer ; si du feedback est
  rétabli, le faire uniquement sur les contrôles concernés, avec une durée
  courte, sans activer globalement les anciennes transitions de 300–400 ms.
- [x] **Panneau Archive — entrée depuis la droite**
  (`app/web-frontend/src/features/archive/ArchiveSheet.tsx`) : ouverture
  depuis le bord droit vers la gauche en 250 ms avec la courbe drawer Apple ;
  fermeture par le même bord en 280 ms avec une courbe plus douce. En
  `prefers-reduced-motion`, seul un fondu de 120 ms est utilisé. Le mouvement
  n’attend pas le chargement des archives et ne bloque pas leurs actions.
- [x] **Palette du loader au démarrage** (`app/web-frontend/index.html`) :
  le HTML initial utilisait des couleurs différentes des thèmes de l’app.
  Les fonds et accents suivent maintenant la palette Ryoku claire ou sombre.
- [x] **Thème clair lisible et doux** : surfaces claires Ryoku sans grandes
  zones blanches, accents cyan accessibles, contours de contrôles visibles ;
  états vides sans opacité affaiblissante. Les thèmes de mise en forme et de
  priorité restent sémantiques.
- [x] **Squelettes de chargement adaptatifs** : le squelette partagé et le
  placeholder TipTap utilisent le token `skeleton` distinct des surfaces ;
  le chargement des projets reste lisible sans opacité 40 %.
- [x] **Logger backend** (`app/backend/src/logique/logging/logger.ts`) :
  implémenté avec tslog, `alert` conservé comme niveau dédié ; les niveaux
  courants sont limités au développement. Les champs sensibles et secrets
  usuels sont masqués. Le lien magique reste visible uniquement en local.

### Fiabilité des tests et de la livraison

- [x] Logger déplacé dans le backend et remplacé par tslog ; le frontend
  utilise seulement quelques appels `console` directs pour ses diagnostics.
- [x] Corriger les scripts de test racine (`package.json`) : ils pointaient
  vers `frontend`/`backend`, alors que les workspaces se trouvent dans
  `app/web-frontend` et `app/backend`. Corrigé.
- [x] Ajouter au workflow Forgejo
  (`.forgejo/workflows/deploy-frontend.yaml`) un typecheck et les tests
  frontend/backend avant le déploiement. Ajouté avant l'étape de déploiement.
- [ ] Ajouter quelques tests de routes backend pour les contrats prioritaires :
  authentification, ownership (autre utilisateur → 404), validation des entrées
  et opérations transactionnelles d’archivage/restauration. Les tests backend
  présents couvrent surtout des helpers, pas les contrôleurs HTTP.
- Vérification du lot immédiat : typechecks frontend/backend OK, frontend
  **66/66** et backend **20/20**, build Vite OK. Le build garde son avertissement
  de taille sur le chunk lazy `md-editor` (~585 kB non compressé).

---

- [] Ajouter une zone dédier pour les email non vérifier
- [] Ajouter option personaliser l'archivage donc l'user personalise sont archive comme il veut mais surtout il va aussi avoir un mini fenête qui l'aide à personaliser sont archivage de tâche

---

[X] Ajouter un teste be for (Ajouter un teste pour savoir ou sa casse)

[] Ajouter un moyen visuel pour comprendre que mon compte est en mode restrint donc l'user doit le savoir imédiatement
[] Terminée la connection avec plunk et tester plunk en mode usage réel pour savoir si sa marche ou pas pour la prod 

---

## Onboarding — archivage instantané par défaut

À la création du workspace, l'onboarding indique que l'archivage instantané
est sélectionné par défaut : une tâche déposée dans Done part immédiatement
à l'archive. Le choix temporel reste masqué jusqu'à ce que le mécanisme soit
réellement disponible.

### Déjà en place

- Préférence `user_setting.archive_mode` (`"instant"` | `"time"`, défaut
  `"instant"`) — exposée dans GET/PATCH `/setting`. Les endpoints
  `/api/v1/archive/*` (archiver, lister, restaurer, supprimer) sont prêts.

### Reste à faire — Backend

- [X] Mode `"instant"` : **le drop dans DONE archive la tâche sur-le-champ**.
  Intercepté côté **serveur** dans `updateTaskPosition` (zéro trust : le
  client n'en décide pas) : `archiveCard()` dans
  `logique/archive/archive-card.ts`, partagée avec la route
  `POST /newArchive` et réutilisable plus tard par le sweep lazy du mode
  `time`. La tâche n'y reste pas, elle part à l'archive — le frontend
  retire la carte du cache sur `{ archived: true }`.

- [X] Préférence dans `user_setting` : `archiveMode` (`"instant"` |
  `"time"`, défaut `"instant"`) en **pgEnum** (même pattern que
  theme/lang). Pas de `archiveDelayDays` pour l'instant — viendra avec
  le moteur temporel (YAGNI).
- [X] Routes `/setting` étendues : `GetSetting` expose le champ, le
  `PATCH` l'accepte (schéma déjà partiel), validation Zod enum 2 valeurs.
- [ ] Plus tard (mode `"time"` actif) : **PAS de cron** (non scalable, du
  travail à l'arrêt) — **archivage à la lecture (lazy), 100 % côté
  serveur** : quand le board d'un user est chargé (ou un sweep léger
  juste après le GET), le backend archive d'un coup, en une requête
  set-based indexée, les tâches DONE depuis N jours de CET user.
  L'user n'a **aucun accès direct au mécanisme** — il pose juste sa
  préférence (`user_setting.archive_mode`, posée à l'onboarding puis
  modifiable via la fenêtre de personnalisation). Coût proportionnel à
  l'usage réel, zéro travail quand personne ne regarde, résultat
  identique vu de l'écran.
  **État actuel important :** le sweep n'existe pas encore. En mode `"time"`,
  déposer une tâche dans Done la laisse sur le board ; ne pas présenter ce mode
  comme opérationnel avant d'avoir livré et testé le sweep.

### Reste à faire — Frontend

- [x] Fusionner le choix d'archivage dans `WorkspaceStep.tsx` : une carte
  informative indique « Archivage instantané — sélectionné par défaut » et
  explique que Done archive directement la tâche. Plus de deuxième écran ni
  de choix `time` indisponible.
- [x] Enregistrer `archiveMode: "instant"` à la création du workspace.
  Le serveur a déjà cette valeur par défaut ; le PATCH reste non bloquant.
- [x] Dans `ArchivingTab`, signaler le mode temporel comme « En développement »,
  empêcher de le sélectionner, et permettre aux comptes qui l'avaient déjà
  enregistré de revenir à l'instantané. Les contrôles de délai sont masqués
  jusqu'à la livraison du sweep.
- [ ] La préférence temporelle sera configurable dans les réglages avec le
  sweep lazy côté serveur, une fois cette fonctionnalité implémentée.

---

## Frontend — Settings — Sauvegarde de l’e-mail du profil

- [ ] Implémenter la sauvegarde réelle de l’adresse e-mail dans `app/web-frontend/src/features/settings/hooks/useSettings.ts`.
