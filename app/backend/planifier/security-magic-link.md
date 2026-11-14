# Stratégie de Sécurité : Magic Link, TOTP et Codes de Secours (NuxiPro)

Ce document formalise l'architecture et la cinématique de sécurité retenues pour l'authentification native sur **NuxiPro**. L'approche repose sur un triptyque strict (**Magic Link + TOTP + Recovery Codes**), guidée par une philosophie **KISS** (Keep It Simple, Stupid) et un modèle de **souveraineté totale (Zéro Backdoor)**.

---

## 1. Principes Directeurs et Modèle de Menace

* **L'E-mail comme Racine de Confiance (Root of Trust) :** L'authentification initiale par Magic Link repose entièrement sur la sécurité de la boîte mail de l'utilisateur. Si celle-ci est compromise, le compte NuxiPro l'est également.
* **Le Double Facteur (TOTP) comme Barrière Infranchissable :** L'ajout du TOTP (ou du code de secours) garantit que même si un attaquant intercepte le lien magique, il ne pourra pas valider la session s'il ne possède pas le second facteur.
* **Souveraineté et Responsabilité Totale :** Pour garantir une sécurité maximale et refuser toute infrastructure superflue (pas de Redis, pas de base de données de transition, pas de service de support par SMS), le système **ne comporte aucune porte dérobée (backdoor)** de récupération automatique. L'utilisateur est souverain, ce qui signifie qu'il est pleinement responsable de la conservation de ses accès et de ses codes de secours.

---

## 2. Le Flux d'Authentification (Cinématique en 4 étapes)

1. **Demande du Magic Link :** L'utilisateur saisit son e-mail et reçoit un lien de connexion magique éphémère.
2. **Interception et Sas de Transition (JWT sur Hono) :**
   * L'utilisateur clique sur le lien, ce qui l'amène sur la route de callback du serveur Hono (`/api/auth/magic-link/verify`).
   * Better Auth valide le lien. Le système intercepte ensuite le flux : si le `twoFactorEnabled` est actif, le serveur génère un **jeton JWT temporaire (valable 3 minutes)** via `hono/jwt`.
   * Ce jeton est stocké dans un cookie `HttpOnly` sécurisé et l'utilisateur est redirigé vers `/auth/verify-2fa`.
3. **Validation du Second Facteur (TOTP ou Code de Secours) :**
   * Sur la page `/auth/verify-2fa`, l'utilisateur saisit soit son code à 6 chiffres (Aegis/Google Authenticator), soit un code de secours.
   * Si un code de secours est utilisé, il est **haché en base** et **consommé à usage unique** (immédiatement supprimé/invalidé).
4. **Création de la Session Définitive :**
   * Après validation réussie du TOTP ou du code de secours, le cookie de transition JWT est détruit, et la session définitive Better Auth est ouverte.

---

## 3. Implémentation Technique (Hono + Bun)

### A. Génération du Jeton de Transition (Route de Callback Magic Link)
```typescript
import { sign } from 'hono/jwt';
import { setCookie } from 'hono/cookie';

if (user.twoFactorEnabled) {
  const payload = {
    userId: user.id,
    pending2fa: true,
    exp: Math.floor(Date.now() / 1000) + 180, // Expiration stricte à 3 minutes
  };

  const tempToken = await sign(payload, process.env.AUTH_SECRET!);

  setCookie(c, 'nuxipro_2fa_pending', tempToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 180,
    path: '/',
  });

  return c.redirect('/auth/verify-2fa');
}
```

### B. Validation et Finalisation (Route `/verify-2fa`)
```typescript
import { verify } from 'hono/jwt';
import { getCookie, deleteCookie } from 'hono/cookie';

const tokenCookie = getCookie(c, 'nuxipro_2fa_pending');
if (!tokenCookie) {
  return c.json({ error: 'Session de vérification expirée.' }, 401);
}

try {
  const decoded = await verify(tokenCookie, process.env.AUTH_SECRET!) as { userId: string; pending2fa: boolean };
  
  // Vérification du TOTP ou du Code de Secours (qui contourne le TOTP mais nécessite impérativement le JWT valide)
  const isValid = await verifyTotpOrRecoveryCode(decoded.userId, submittedCode);
  if (!isValid) {
    return c.json({ error: 'Code invalide.' }, 400);
  }

  deleteCookie(c, 'nuxipro_2fa_pending');
  await createFinalSession(c, decoded.userId);

  return c.json({ success: true, redirectTo: '/dashboard' });
} catch (err) {
  deleteCookie(c, 'nuxipro_2fa_pending');
  return c.json({ error: 'Jeton invalide ou expiré.' }, 401);
}
```

---

## 4. Sensibilisation et Gestion des Cas Limites

* **Perte de l'E-mail et du 2FA :** Si l'utilisateur perd l'accès à sa boîte mail *et* à son application d'authentification sans avoir sauvegardé ses codes de secours, **le compte est définitivement perdu**. Aucun mécanisme de récupération par e-mail secondaire ou par SMS n'est implémenté, conformément aux standards de sécurité stricts (NIST/FIDO).
* **Sensibilisation Contextuelle :** Lors de l'activation du 2FA, l'interface impose l'affichage d'un avertissement clair et l'obligation de sauvegarder les codes de secours avant de valider le processus.
