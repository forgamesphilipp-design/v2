import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
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

  // ✅ Only block on session loading
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

export function RequireOnboardingComplete({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.sessionLoading) return <FullscreenLoading />;

  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  // ✅ Don't block the app if profile is missing/slow.
  // If profile loads later and shows not onboarded, we can redirect then (next navigation),
  // but we avoid deadlocks.
  if (!auth.profile) return <>{children}</>;

  if (!auth.profile.onboardedAt) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}
