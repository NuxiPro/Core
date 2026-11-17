# TODO

## Backend

- Migrer loops vers Plunk (migration en cours, non terminée).
- Redis (anticipation, pas de besoin actuel) : seulement si p95 requêtes
  monte ou pool DB saturé — via `secondaryStorage` better-auth
  (sessions + rate-limits), les tokens magic-link restent en DB.

---

- [] Ajouter une zone dédier pour les email non vérifier
- [] Ajouter option personaliser l'archivage donc l'user personalise sont archive comme il veut mais surtout il va aussi avoir un mini fenête qui l'aide à personaliser sont archivage de tâche

---

[X] Ajouter un teste be for (Ajouter un teste pour savoir ou sa casse)

[] Ajouter un moyen visuel pour comprendre que mon compte est en mode restrint donc l'user doit le savoir imédiatement
[] Terminée la connection avec plunk et tester plunk en mode usage réel pour savoir si sa marche ou pas pour la prod 

---

## Onboarding — Choix du mode d'archivage (à la création du compte)

Demander à l'user son mode d'archivage de tâches au moment où il crée son
workspace (première connexion après inscription). C'est la première brique
de la personnalisation d'archivage (voir plus haut).

### Déjà en place

- Préférence `user_setting.archive_mode` (`"instant"` | `"time"`, défaut
  `"instant"`) — exposée dans GET/PATCH `/setting`. Les endpoints
  `/api/v1/archive/*` (archiver, lister, restaurer, supprimer) sont prêts.

### Reste à faire — Backend

- [ ] Mode `"instant"` : **changer le comportement de la colonne DONE** —
  le drag & drop d'une tâche dans DONE déclenche directement
  `POST /api/v1/archive/{projectId}/newArchive` (la tâche n'y reste pas,
  elle part à l'archive sur-le-champ).

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

### Reste à faire — Frontend

- [X] Étape insérée dans l'onboarding existant : workspace → **« Comment
  veux-tu archiver tes tâches ? »** → chargement → succès
  (`ArchiveModeStep.tsx`).
- [X] UI de l'étape : 2 cartes radio (⚡ Instantané / ⏱️ Automatique),
  navigation clavier native, i18n fr/en, tokens du design system.
  Défaut pré-sélectionné : Instantané.
- [X] Choix enregistré à la fin de l'onboarding (`PATCH /setting` en même
  temps que la création du workspace, préférence non bloquante), jamais
  re-demandé ensuite.
- [ ] La préférence lue plus tard par la fenêtre de personnalisation
  d'archivage et par le sweep lazy côté serveur.

---

## Frontend — Settings — Sauvegarde de l’e-mail du profil

- [ ] Implémenter la sauvegarde réelle de l’adresse e-mail dans `app/web-frontend/src/features/settings/hooks/useSettings.ts`.

### Situation actuelle

Le hook `useSettings` détecte déjà les modifications de l’e-mail avec `isProfileDirty` :

```ts
const isProfileDirty = user ? email !== (user.email || "") : false;
```

En revanche, `handleSaveProfile` ne sauvegarde pas encore la nouvelle adresse. Pour le moment, il exécute seulement `handle` et affiche un message temporaire indiquant que la modification est appliquée localement :

```ts
const handleSaveProfile = () =>
  handle(async () => {
    setSaveMessage(PATCH_PENDING_MSG);
  });
```

Cela signifie que l’utilisateur peut modifier l’adresse dans l’interface, mais que la nouvelle valeur n’est pas envoyée au serveur et sera perdue après un rechargement de la page.

### Implémentation attendue

Utiliser l’API Better Auth déjà disponible via `authClient` pour mettre à jour l’utilisateur, au lieu d’utiliser `patchSettings`. Les préférences générales et les informations d’authentification sont deux responsabilités différentes :

- `patchSettings` doit rester utilisé pour le thème, la langue et les notifications e-mail.
- `authClient.updateUser` doit être utilisé pour modifier l’adresse e-mail du compte.

Le flux attendu est :

1. Vérifier que l’adresse e-mail a réellement changé avec `isProfileDirty`.
2. Appeler `authClient.updateUser` avec la nouvelle adresse e-mail.
3. Afficher un message de succès en anglais lorsque la mise à jour réussit.
4. Afficher une erreur en anglais lorsque Better Auth refuse la modification.
5. Rafraîchir ou synchroniser la session utilisateur afin que l’adresse affichée corresponde à la valeur enregistrée.
6. Réinitialiser l’état dirty après une sauvegarde réussie.
7. Conserver le comportement spécifique aux comptes OAuth si leur adresse e-mail ne peut pas être modifiée depuis cette interface.

### Tests à ajouter

Ajouter des tests dans `app/web-frontend/src/features/settings/hooks/__tests__/useSettings.test.ts` pour vérifier :

- qu’aucune requête n’est envoyée lorsque l’e-mail n’a pas changé ;
- que `authClient.updateUser` reçoit la nouvelle adresse lorsque l’e-mail a changé ;
- que le message de succès est affiché après une sauvegarde réussie ;
- que l’erreur retournée par Better Auth est affichée en cas d’échec ;
- que l’adresse e-mail et l’état `isProfileDirty` sont synchronisés après une sauvegarde ;
- qu’un compte OAuth ne déclenche pas une modification d’e-mail non supportée.
