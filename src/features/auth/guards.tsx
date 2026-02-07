// FILE: src/features/auth/guards.tsx

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export function FullscreenLoading({ label = "Lade…" }: { label?: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div style={{ color: "var(--muted)", fontWeight: 900 }}>{label}</div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.loading) return <FullscreenLoading />;
  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

export function RequireNoAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.loading) return <FullscreenLoading />;
  if (auth.isAuthed) return <Navigate to="/" replace />;

  return <>{children}</>;
}

/**
 * Require that onboarding is complete.
 * - If authed but profile missing => still allow app (graceful)
 * - If profile exists and onboardedAt missing => redirect to onboarding
 */
export function RequireOnboardingComplete({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const loc = useLocation();

  if (auth.loading) return <FullscreenLoading />;

  // If not authed, auth guard should handle, but keep safe:
  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  // If profile isn't loaded/available, don't block the whole app
  // (but normally profile exists via trigger)
  if (!auth.profile) return <>{children}</>;

  const done = Boolean(auth.profile.onboardedAt);
  if (!done) {
    return <Navigate to="/onboarding" replace state={{ from: loc.pathname }} />;
  }

  return <>{children}</>;
}
