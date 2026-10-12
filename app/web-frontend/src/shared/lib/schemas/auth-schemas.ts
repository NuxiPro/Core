import z from "zod";

// ──────────────────────────────────────────────
// Schémas de validation — auth
//
// Utilisés côté client (react-hook-form) ET
// réutilisables côté serveur (Hono) si besoin.
// ──────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email requis" })
    .email({ message: "Email invalide" })
    .max(255, { message: "Email trop long" }),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email requis" })
    .email({ message: "Email invalide" })
    .max(255, { message: "Email trop long" }),
});

export type LoginFields = z.infer<typeof LoginSchema>;
export type RegisterFields = z.infer<typeof RegisterSchema>;
