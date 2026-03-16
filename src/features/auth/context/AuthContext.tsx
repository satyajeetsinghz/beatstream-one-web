import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/services/firebase/config";
import { db } from "@/services/firebase/config";
import { createUserIfNotExists } from "../services/user.service";
import { IAuthContext, IUser } from "../types";

export const AuthContext = createContext<IAuthContext>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]       = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await createUserIfNotExists(firebaseUser);

        // Write lastLoginAt on every sign-in — non-critical, never blocks login
        try {
          await updateDoc(doc(db, "users", firebaseUser.uid), {
            lastLoginAt: serverTimestamp(),
          });
        } catch {
          // Intentionally silent
        }

        // ✅ FIX: Always set the user regardless of status.
        //
        // The old code called setUser(null) for banned/suspended users.
        // This destroyed the status field — App.tsx checks user?.status
        // to decide which screen to show, so null meant it could never
        // detect "banned" or "suspended" and fell through to the router,
        // which then redirected to login (looked like an instant logout).
        //
        // App.tsx is the correct place to gate on status — not here.
        // AuthContext's only job is to resolve and expose the user object.
        setUser(appUser);

      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};