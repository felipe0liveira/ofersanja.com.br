import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AdminAuthState = {
  user: User | null;
  idToken: string;
  roles: string[];
  checking: boolean;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    idToken: "",
    roles: [],
    checking: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/admin";
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
        window.location.href = "/admin";
        return;
      }

      const data = await res.json();
      setState({
        user: currentUser,
        idToken: token,
        roles: data.roles ?? [],
        checking: false,
      });
    });

    return () => unsubscribe();
  }, []);

  return state;
}
