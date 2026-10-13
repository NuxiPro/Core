import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveSession } from "@/src/shared/lib/auth-guard";

export const Route = createFileRoute("/_auth/register")({
  loader: async () => {
    const session = await resolveSession();
    if (session) throw redirect({ to: "/" });
    // Single entry point: login and register are fused (magic link only).
    throw redirect({ to: "/login" });
  },
});
