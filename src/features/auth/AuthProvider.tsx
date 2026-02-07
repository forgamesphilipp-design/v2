// FILE: src/features/auth/AuthProvider.tsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../app/supabaseClient";
import { repositories } from "../../app/repositories";
import type { Profile } from "../../entities/profile/model";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;

  loading: boolean;
  isAuthed: boolean;

  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(nextUser: User | null) {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    try {
      const p = await repositories.profile.getMyProfile();
      setProfile(p);
    } catch {
      // keep auth usable even if profile fetch fails
      setProfile(null);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const nextSession = data.session ?? null;
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession);
      setUser(nextUser);

      await loadProfile(nextUser);
    } catch {
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;

        const nextSession = data.session ?? null;
        const nextUser = nextSession?.user ?? null;

        setSession(nextSession);
        setUser(nextUser);

        // load profile after session established
        await loadProfile(nextUser);
      } catch {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession ?? null);
      setUser(nextUser);

      // profile follows auth transitions
      setLoading(true);
      await loadProfile(nextUser);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user,
      profile,
      loading,
      isAuthed: Boolean(user),
      refresh,
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
