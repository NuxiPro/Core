import { useEffect, useState } from "react";
import { authClient } from "@/src/shared/lib/client";

interface User {
  name: string;
  email: string;
  avatar: string;
}

/**
 * S'abonne à l'atom nanostores de Better Auth (authClient.useSession).
 *
 * Pourquoi ce pattern plutôt que getSession() dans useEffect ?
 *  - L'atom est partagé en mémoire : si beforeLoad (ou un autre composant)
 *    a déjà appelé getSession(), la valeur est déjà dans l'atom.
 *    → Aucun second appel réseau, résultat instantané.
 *  - Re-render automatique si la session change (logout, expiration).
 *  - subscribe() appelle le callback immédiatement avec la valeur courante
 *    (initialisation synchrone via useState initializer).
 */
export function useAuth() {
  const [state, setState] = useState(() => authClient.useSession.get());

  useEffect(() => {
    // subscribe retourne la fonction de nettoyage directement
    return authClient.useSession.subscribe((value) => {
      setState(value);
    });
  }, []);

  const user: User | null = state.data?.user
    ? {
        name: state.data.user.name || "",
        email: state.data.user.email || "",
        avatar: state.data.user.image || "",
      }
    : null;

  return { user, loading: state.isPending };
}
