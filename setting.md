# Settings — état des lieux (revue rapide pour reprendre plus tard)

> **Date :** 17/11/2026 · **Branche :** `dev` · **Dernier commit utile :** `eeb06cd`
> « building archive task and fix bug user langage »
> Ce document reflète la réalité du code à ce jour. Les points **ouverts** sont
> regroupés en fin de fichier (§6).

---

## 1. Architecture générale

Le système de réglages est volontairement **KISS** : une seule requête de
lecture, des mises à jour directes (pas de bouton « Save »), zéro-trust côté
serveur.

### Backend (`app/backend/src/routes/setting/`)

| Fichier | Rôle |
|---|---|
| `setting.router.ts` | `GET /api/v1/setting/getSettings` (« Get all setting in one request ») + `PATCH /api/v1/setting/patchSettings`, protégés par `requirePermission({ setting: ["read" \| "update"] })` |
| `setting.shemas.ts` | `GetSetting` (zod) = `theme`, `emailNotifications`, `language`, `archiveMode`, `archiveDelayDays` ; `patchSetting = GetSetting.partial()` |
| `controler/getSetting.ts` | Sélectionne les 5 champs pour l'utilisateur courant (`.limit(1)`) |
| `controler/updateSetting.ts` | `db.update(userSetting).set(body).where(userId)` — **pas d'upsert** : PATCH sur un compte sans ligne ne crée rien |

Table `user_setting` (`drizzle/schemas/user-center.ts`) :

- `theme` enum (`light|dark|system`, défaut `system`)
- `email_notifications` bool
- `language` enum (`fr|en`, **défaut `en`**)
- `archive_mode` enum (`instant|time`, défaut `instant`)
- `archive_delay_days` int 1–90, nullable (utile uniquement en mode `time`)

### Frontend (`app/web-frontend/src/features/settings/`)

| Fichier | Rôle |
|---|---|
| `api/settings.ts` | Types miroir `GetSetting` + zod `SettingsSchema` (**strict** : clé inconnue = rejet). `DEFAULT_SETTINGS` = derniers recours si le serveur est indisponible (langue `en`) |
| `hooks/useSettingsApi.ts` | **`settingsQueryBase`** = options UNIQUES de la query `["settings"]` (`staleTime/gcTime: Infinity`, `refetchOnMount/Focus/Reconnect: false`). `useUpdateSettings` = PATCH + `invalidateQueries(["settings"])` → **exactement 1 GET de re-sync par modification** |
| `hooks/useSettings.ts` | État local éditable amorcé depuis la query unique ; `setLanguage` / `setEmailNotifications` / `setArchiveMode` / `setArchiveDelayDays` persiste immédiatement |
| `components/SettingsDialog.tsx` | Modale, drill des props vers les tabs ; header = `t("settings.${activeTab}.label")` |
| `components/tabs/` | `GeneralTab`, `ProfileTab`, `ArchivingTab` — aucun fetch propre, tout arrive en props |

**Clés de cache TanStack :** `["settings"]` · `["board", projectId]` ·
`["archived", projectId]`. Les défauts globaux (`refetchOnMount: false`,
`staleTime: 10min` dans `src/shared/lib/queryClient.ts`) sont **volontaires** :
on ne corrige jamais globalement, on surcharge par query si besoin.

---

## 2. Onglet « Archivage » (ArchivingTab) — branché et i18n

### Branchement

- Le tab **ne fait aucune requête** : il reçoit `archiveMode`,
  `archiveDelayDays`, `setArchiveMode`, `setArchiveDelayDays` en props
  (pattern identique à `GeneralTab`), donc « chargement en une fois » avec le
  reste des settings.
- **Toggle** → `archiveMode` (`time` ↔ `instant`).
- **Select du délai** → `archiveDelayDays` (`7 | 30 | 90`), désactivé si le
  mode n'est pas `time`.
- Activation du mode `time` **sans délai stocké** → envoie
  `{ archiveMode: "time", archiveDelayDays: 30 }` d'un coup (le select a
  toujours une valeur).
- Retour en `instant` → envoie juste `{ archiveMode }` : le délai choisi est
  **conservé** pour la prochaine activation.
- Chaque changement : PATCH + bandeau vert « Saved » (même feedback que
  langue/notifications). Aucun bouton Save.

### Terminologie (décision produit)

Les deux modes sont des **automatisations** ; seul le moment diffère. On ne
dit **pas** « archive auto » :

| Endroit | EN | FR |
|---|---|---|
| Onglet + header dialog (`settings.tabs.archiving`, `settings.archiving.label`) | Archiving | Archivage |
| Toggle (`settings.archiving.timeBasedArchive`) | Time-based archive | **Archive basée sur le temps** |
| Description (`…timeBasedArchiveDesc`) | « On: … after the delay below. Off: … the moment you drop them in Done. » | « Activé : … après le délai ci-dessous. Désactivé : … dès le dépôt dans Done. » |
| Onboarding (`onboarding.archiveModeTimeTitle`) | Time-based | Basée sur le temps |
| Mode instantané | Instant / Instantané (**inchangé**) | idem |

- Clés i18n renommées : `autoArchive*` → **`timeBasedArchive*`** (une clé
  `autoArchive` qui affiche « Time-based » aurait été confuse).
- Variable du tab : `autoArchiveEnabled` → `timeBasedArchiveEnabled`.
- **Les valeurs enum `instant|time` ne changent pas** — copy uniquement.
- Commentaires du tab et de l'onboarding passés en **anglais simple**.

### Tests

- `useSettings.test.ts` : 3 tests archivage (activation mode time + délai 30
  par défaut, changement de délai, retour instant qui garde le délai).
- `SettingsNavigation.test.tsx` : assert mis à jour → `"Archiving"`.
- **Total frontend : 60/60.**

---

## 3. Piège i18n : trois espaces de clés « archive »

Ne pas confondre dans `features/i18n/locales/{en,fr}.json` :

| Namespace | Utilisé par |
|---|---|
| **`archive.*` (racine)** | `features/archive/ArchiveSheet.tsx` — 21 clés (dont `group.today/yesterday/last7Days`, `noResults*`, `resetFilters`…) corrigées le 17/11 |
| `settings.archive.*` | page Settings (ancien) |
| `settings.archiving.*` | onglet Archiving + header de la modale (10 clés) |
| `onboarding.archiveMode*` | `features/onboarding/steps/ArchiveModeStep.tsx` |

Vérification de parité (biome **ignore** les JSON de locales) :

```bash
cd /home/babas/Projets/NuxiPro/Core && bun -e '
const en = require("./app/web-frontend/src/features/i18n/locales/en.json");
const fr = require("./app/web-frontend/src/features/i18n/locales/fr.json");
const flat = (o,p="") => Object.entries(o).flatMap(([k,v]) =>
  typeof v==="object"&&v!==null ? flat(v,p+k+".") : [p+k]);
const a=new Set(flat(en)), b=new Set(flat(fr));
console.log("parity:", [...a].filter(k=>!b.has(k)).concat([...b].filter(k=>!a.has(k))).join(",")||"ok");'
```

---

## 4. Bug « le i18n passe de fr à en » — enquête complète

### Symptôme

Navigateur en français : l'app démarre en **FR**, puis bascule en **EN** au
chargement.

### Chaîne normale (qui fonctionne)

1. **Init** (`features/i18n/index.ts`) : LanguageDetector
   `order: ["localStorage", "navigator"]`, cache localStorage, `fallbackLng: "en"`,
   `load: "languageOnly"`.
2. **Synchro** (`shared/hooks/useSyncLanguage.ts`, monté dans
   `routes/_dashboard.tsx`) : lit `["settings"].language` ; si ≠
   `i18n.language` → `changeLanguage(server)`. **Le serveur a la priorité**
   (choix explicite > détection navigateur) — choix de design.
3. **Seed à l'inscription** (`auth.ts` + `logique/InitUserAccount/`) :
   - `sendMagicLink` : `lang = getUserLanguage(email) ?? toLang(header X-User-Language)`
     ; si l'utilisateur n'existe pas encore → stash
     `stashSignUpLanguage` (identifiant `lang:{email}`, TTL 15 min) ;
   - `user.create.after` → `resolveSeedLanguage` = **stash magic-link →
     état OAuth → fallback `en`** → `seedAccountDefaults` →
     `StepDefaultSettings` (`insert … onConflictDoNothing`).

### Preuves récoltées (base `nuxipro`, le 17/11)

- Session active = **f@gmail.com** (`sT0S2Zfi30UAkrIeluij8lwsgsSunMtN`) →
  `user_setting.language = 'en'` alors que le navigateur est en `fr`.
- Le stash **existe encore** : `verification.identifier = lang:f@gmail.com`,
  `value = 'fr'`, créé **13:43:12** (envoi du lien) — mais le compte a été
  créé à **13:43:16** et la ligne a pris le **fallback `en`** :
  le stash **n'a jamais été consommé** (il aurait été supprimé), il a expiré
  à 13:58.
- **b@gmail.com** (créé le même matin à 10:15) a bien **`fr`** → le relay
  fonctionnait, il a cassé entre 10:15 et 13:43 (refactor en cours à ce
  moment-là), puis le commit `eeb06cd` (17/11 22:50, « fix bug user langage »)
  a réécrit `auth.ts` + `user-language.ts`.
- **Conclusion : le code est probablement corrigé, mais les données du compte
  f@gmail.com sont restées en `en`** → le flip persiste.

### Audit sécurité (ce qui ne PAS une faille)

| Point suspect | Verdict |
|---|---|
| Header `X-User-Language` contrôlé par le client | Whitelisté par `toLang()` → `{fr,en}` uniquement. Impact max : langue du propre compte créé. **Zéro-trust respecté** |
| Ligne `lang:{email}` laissée dans `verification` | Juste une langue (pas un token), TTL 15 min, préfixée. Sa présence prouve le **bug** (non consommée), pas une fuite |
| `.env` (`DATABASE_URL`) | **Jamais commité** (`git log --all -- app/backend/.env` vide), bien ignoré par git |
| Priorité serveur dans `useSyncLanguage` | Choix de design. Le problème est que la valeur serveur ici est un **seed raté**, pas un choix utilisateur |

### Fragilité repérée (robustesse, pas sécurité)

`StepDefaultSettings` utilise `onConflictDoNothing` → **un seed raté ne se
rattrape jamais**, alors que le commentaire de `auth.ts` prétend le contraire
(« l'idempotence permet le re-seed au prochain passage authentifié ») :
**commentaire faux à corriger.**

---

## 5. Commandes de vérification

```bash
# Frontend (le jeu complet)
cd /home/babas/Projets/NuxiPro/Core/app/web-frontend
bunx biome check --write <fichiers touchés>
bun run typecheck        # attendu : 0 erreur
bun run test:run         # attendu : 60/60

# Backend
cd /home/babas/Projets/NuxiPro/Core/app/backend
bun run typecheck        # 3 erreurs PRÉEXISTANTES (indexationTask.test ×2, dialog.ts HTMLElement)
bun run test:run         # 1 échec PRÉEXISTANT (dateHelpers.test.ts importe isDBDateStr supprimé par 9d798ed)
```

Requête utile (pas de `psql` installé sur la machine) :

```bash
cd /home/babas/Projets/NuxiPro/Core/app/backend && bun -e '
import { Pool } from "pg";
const pool = new Pool({ connectionString: "postgresql://dev:dev@localhost:5432/nuxipro" });
console.log((await pool.query(
  "SELECT u.email, s.language, s.theme, s.archive_mode FROM user_setting s JOIN \"user\" u ON u.id = s.user_id"
)).rows);
await pool.end();'
```

---

## 6. ⚠️ À faire (ouvert)

- [ ] **Corriger la donnée** du compte connecté (le flip disparaît
      immédiatement) — **pas encore fait** :
      ```sql
      UPDATE user_setting SET language = 'fr'
      WHERE user_id = 'sT0S2Zfi30UAkrIeluij8lwsgsSunMtN';  -- f@gmail.com
      ```
      Alternative sans SQL : Settings → Langue → Français (valide au passage
      le vrai chemin PATCH).
- [ ] **Valider le fix de seed du commit `eeb06cd`** avec une inscription test
      : envoyer un magic link pour un nouvel e-mail, vérifier (1) que le stash
      `lang:{email}` est **consommé** (disparu de `verification`) et (2) que la
      ligne `user_setting` sort en **`fr`**. L'URL du lien s'affiche dans le
      terminal du backend en dev (`[Magic Link] …`).
- [ ] **Corriger le faux commentaire** sur le « re-seed » dans `auth.ts`, ou
      décider d'une vraie politique d'auto-réparation (ex. : si le seed a
      raté, réconcilier détection navigateur ↔ serveur à la première
      connexion) — décision produit à trancher.
- [ ] *(option)* **Test de parité i18n** : une clé utilisée dans un composant
      mais absente des locales = échec du test (le bug `archive.group.*` ne
      reviendra pas).
- [ ] *(option)* Réparer les échecs préexistants : `dateHelpers.test.ts`
      (supprimé `isDBDateStr`) et les 3 erreurs de typecheck backend.

---

## 7. Rappels transversaux de la session (liés aux settings)

- **Mode instantané** : le drop dans `Done` archive côté **serveur**
  (`updateTaskPosition` → `archiveCard()` dans
  `logique/archive/archive-card.ts`, partagée avec `POST /newArchive` et le
  futur sweep du mode `time`). Le frontend retire la carte après
  `ARCHIVE_ANIMATION_MS = 750 ms` (anim « archivage » vert, **pas** l'anim de
  suppression) et pulvérise une seule fois le bouton archive
  (`ARCHIVE_PULSE_MS = 1000 ms`).
- **Restore 400** : garde de body globale dans `src/index.ts` → exemption
  `c.req.path.includes("/restoreArchive/")`.
- **Liste d'archives périmée** : `refetchOnMount: true` posé **uniquement**
  sur la query `["archived", projectId]` de la route archive.
- **Terminologie archive** : enum `instant|time` intacte partout — seules les
  chaînes affichées ont changé (§2).
