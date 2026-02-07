import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../app/supabaseClient";
import { repositories } from "../../app/repositories";
import type { Profile } from "../../entities/profile/model";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;

  // sessionLoading blocks routing; profileLoading must NOT block routing
  sessionLoading: boolean;
  profileLoading: boolean;

  isAuthed: boolean;

  refresh: () => Promise<void>;
  hardReset: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    p.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(t);
        reject(e);
      }
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // prevents race conditions if multiple auth changes happen quickly
  const profileLoadSeq = useRef(0);

  async function loadProfileFor(nextUser: User | null) {
    const seq = ++profileLoadSeq.current;

    if (!nextUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    try {
      // Don't ever block the app indefinitely on profile
      const p = await withTimeout(repositories.profile.getMyProfile(), 2500, "getMyProfile");
      // ignore if newer load started
      if (seq !== profileLoadSeq.current) return;
      setProfile(p);
    } catch {
      // keep app usable even if profile fails
      if (seq !== profileLoadSeq.current) return;
      setProfile(null);
    } finally {
      if (seq !== profileLoadSeq.current) return;
      setProfileLoading(false);
    }
  }

  async function refresh() {
    setSessionLoading(true);

    try {
      const { data, error } = await withTimeout(supabase.auth.getSession(), 2500, "getSession");
      if (error) throw error;

      const nextSession = data.session ?? null;
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession);
      setUser(nextUser);
    } catch {
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      // ✅ routing unblocks here, profile loads separately
      setSessionLoading(false);
    }

    // load profile in background (does not block routing)
    void loadProfileFor((await supabase.auth.getUser()).data.user ?? null).catch(() => {
      // ignore
    });
  }

  async function hardReset() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setSessionLoading(false);
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      setSessionLoading(true);
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), 2500, "getSession(initial)");
        if (error) throw error;

        if (!mounted) return;

        const nextSession = data.session ?? null;
        const nextUser = nextSession?.user ?? null;

        setSession(nextSession);
        setUser(nextUser);
      } catch {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (!mounted) return;
        setSessionLoading(false);
      }

      // profile loads after session is known; never blocks routing
      if (mounted) void loadProfileFor((await supabase.auth.getUser()).data.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const nextUser = nextSession?.user ?? null;

      // ✅ update session immediately; unblock routing immediately
      setSession(nextSession ?? null);
      setUser(nextUser);
      setSessionLoading(false);

      // load profile in background
      void loadProfileFor(nextUser);
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
      sessionLoading,
      profileLoading,
      isAuthed: Boolean(user),
      refresh,
      hardReset,
    }),
    [session, user, profile, sessionLoading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
