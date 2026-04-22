"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  documentId: string | null;
  phone: string | null;
  avatarUrl: string | null;
  email: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isProfileComplete: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    const res = await fetch(`/api/profile`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile ?? null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile();
    setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const p = await fetchProfile();
        setProfile(p);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const p = await fetchProfile();
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const isProfileComplete = Boolean(
    profile?.firstName && profile?.lastName && profile?.documentId && profile?.phone
  );

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isProfileComplete, signInWithGoogle, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
