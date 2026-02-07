// FILE: src/pages/AuthCallbackPage.tsx
// Handles OAuth redirect back to the app.
// For SPA/browser usage, supabase-js often processes the session automatically,
// but we still provide a robust callback to support PKCE/code exchange when needed. :contentReference[oaicite:2]{index=2}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../app/supabaseClient";
import { FullscreenLoading } from "../features/auth/guards";
import { useAuth } from "../features/auth/useAuth";

export default function AuthCallbackPage() {
  const nav = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // If PKCE "code" is present, exchange it for a session.
        // If not present, supabase-js may already have processed the callback.
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        }

        // Refresh our AuthProvider state (loads session + profile)
        await auth.refresh();

        if (cancelled) return;
        nav("/", { replace: true });
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e?.message ?? e ?? "Auth callback failed"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav, auth]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: 16 }}>
        <div style={{ width: "min(520px, 92vw)", borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", boxShadow: "var(--shadow)", padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Login fehlgeschlagen</div>
          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>
            Fehler: <b>{error}</b>
          </div>
          <button
            onClick={() => nav("/auth", { replace: true })}
            style={{
              marginTop: 14,
              borderRadius: 999,
              padding: "10px 12px",
              border: "1px solid var(--border)",
              background: "var(--accent)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
              boxShadow: "0 10px 22px rgba(15,23,42,.10)",
            }}
          >
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  return <FullscreenLoading label="Login wird abgeschlossen…" />;
}
