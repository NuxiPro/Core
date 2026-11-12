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
