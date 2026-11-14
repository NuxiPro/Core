# Stratégie de Changement d'E-mail Sécurisé (OTP)

## 1. Objectif & Philosophie
Permettre aux utilisateurs de modifier leur adresse e-mail principale de connexion en garantissant la propriété de la nouvelle adresse (anti-usurpation), tout en maintenant une architecture simple (**KISS**), sans cron job ni table temporaire supplémentaire grâce à **Better Auth**.

---

## 2. Flux d'Exécution (De bout en bout)

### Étape 1 : Demande de modification
1. L'utilisateur saisit sa nouvelle adresse e-mail depuis ses paramètres de profil.
2. Le système valide le format de l'adresse (via Zod) et vérifie qu'elle n'est pas déjà associée à un autre compte.
3. L'e-mail principal actuel reste inchangé et actif tant que la procédure n'est pas finalisée.

### Étape 2 : Génération et Envoi de l'OTP
1. Better Auth (via le plugin `emailOTP`) génère un code numérique aléatoire à **6 chiffres**.
2. Le code est enregistré dans la table de vérification native de Better Auth avec une durée de validité stricte de **10 minutes**.
3. Le service transactionnel (**Plunk**) envoie immédiatement ce code à la **nouvelle adresse e-mail** saisie.

### Étape 3 : Validation, Basculement et Alerte
1. L'utilisateur reste sur l'application et saisit les 6 chiffres reçus.
2. Better Auth vérifie la correspondance du code, la session active de l'utilisateur et le délai d'expiration.
3. **En cas de succès :**
   * La nouvelle adresse remplace officiellement l'ancienne en tant qu'e-mail principal de connexion.
   * Le statut de vérification de l'e-mail est validé et le code OTP est immédiatement détruit.
   * **Alerte de sécurité :** Un e-mail de notification est envoyé immédiatement via **Plunk** à l'**ancienne adresse** pour informer du changement (indiquant la nouvelle adresse masquée et invitant à contacter le support avec l'`Account ID` en cas d'action non autorisée).
   * Les autres sessions actives du compte sont révoquées.
4. **En cas d'échec ou d'expiration :**
   * Aucun changement n'est appliqué au compte. L'utilisateur doit recommencer la demande pour obtenir un nouveau code.

---

## 3. Règles de Sécurité & Anti-Abus

- **Protection Anti-Bruteforce :** Un maximum de **3 tentatives** de saisie est autorisé par code généré. Au-delà, le code est automatiquement invalidé.
- **Expiration Courte (Zéro Cron Job) :** La validité de 10 minutes rend le code caduc automatiquement passé ce délai. Aucun script de nettoyage périodique n'est requis.
- **Rate Limiting :** Limitation du nombre de demandes d'envoi d'OTP par utilisateur et par fenêtre de temps afin de prévenir le spam et de protéger le quota d'envoi transactionnel.
- **Isolation de Session :** Seul l'utilisateur authentifié ayant initié la demande peut soumettre le code de validation pour son propre compte.
- **Hygiène Post-Changement :** Révocation automatique des autres sessions actives lors du basculement pour couper l'accès à un éventuel attaquant.
