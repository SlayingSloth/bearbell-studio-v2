import { useEffect, useState } from "react";
import { onAuthChange } from "../lib/firebase/auth";

/**
 * Subscribe to Firebase auth state.
 * @returns {{ user: import("firebase/auth").User | null, loading: boolean }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
