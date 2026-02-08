// FILE: src/features/auth/guards.tsx

import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export function FullscreenLoading({ label = "Lade…" }: { label?: string }) {
  const auth = useAuth();

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: 16 }}>
      <div style={{ display: "grid", gap: 10, placeItems: "center" }}>
        <div style={{ color: "var(--muted)", fontWeight: 900 }}>{label}</div>

        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          sessionLoading: <b>{String(auth.sessionLoading)}</b> · profileLoading: <b>{String(auth.profileLoading)}</b>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => void auth.refresh()}
            style={{
              borderRadius: 999,
              padding: "10px 12px",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Refresh Auth
          </button>

          <button
            onClick={() => void auth.hardReset()}
            style={{
              borderRadius: 999,
              padding: "10px 12px",
              border: "1px solid var(--border)",
              background: "rgba(172, 0, 0, 0.92)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Hard Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.sessionLoading) return <FullscreenLoading />;

  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

export function RequireNoAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.sessionLoading) return <FullscreenLoading />;

  if (auth.isAuthed) return <Navigate to="/" replace />;

  return <>{children}</>;
}

/**
 * Clean single place for: "must be authed + onboarded"
 * Used as a route layout element (renders <Outlet />)
 */
export function RequireAuthedOnboardedLayout() {
  const auth = useAuth();

  if (auth.sessionLoading) return <FullscreenLoading />;

  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  // IMPORTANT: do NOT block app if profile is missing/slow.
  if (!auth.profile) return <Outlet />;

  if (!auth.profile.onboardedAt) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}

// Prevent re-onboarding
export function RequireNotOnboarded({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.sessionLoading) return <FullscreenLoading />;

  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  // allow page until profile arrives (page can handle later)
  if (!auth.profile) return <>{children}</>;

  if (auth.profile.onboardedAt) return <Navigate to="/" replace />;

  return <>{children}</>;
}
