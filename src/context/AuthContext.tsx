import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import api from "@/lib/api";
import { ApiUser } from "@/types";
import { toast } from "sonner";

interface AuthContextValue {
  user: ApiUser | null;
  isInitializing: boolean;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const hydrateUser = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const loginWithGoogle = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const payload = {
        firebaseUid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || "Callify User",
        photoURL: result.user.photoURL,
        idToken,
      };

      const { data } = await api.post("/api/auth/firebase", payload);
      setUser(data.user);
      toast.success("Signed in successfully");
    } catch (error) {
      console.error("Firebase auth error:", error);
      toast.error("Sign in failed");
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore logout errors
    }
    await signOut(auth).catch(() => undefined);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isInitializing,
    isAuthLoading,
    loginWithGoogle,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

