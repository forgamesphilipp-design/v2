// FILE: src/pages/AuthCallbackPage.tsx
// 1:1 replacement
// Changes:
// - If a session already exists on mount, immediately redirect to "/" (no UI flash)
// - Debug block is shown ONLY on error
// - Still runs the OAuth processing only once (ranRef)

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../app/supabaseClient";

type Step = "starting" | "processing" | "waiting_session" | "done" | "error";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForSession(maxMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await sleep(200);
  }
  return null;
}

function isPkceVerifierMissing(err: any) {
  const msg = String(err?.message ?? err ?? "").toLowerCase();
  return msg.includes("pkce") && msg.includes("code verifier") && msg.includes("not found");
}

export default function AuthCallbackPage() {
  const nav = useNavigate();

  const ranRef = useRef(false);

  const [step, setStep] = useState<Step>("starting");
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<Record<string, any>>({});

  const urlInfo = useMemo(() => {
    const u = new URL(window.location.href);
    const code = u.searchParams.get("code");
    const err = u.searchParams.get("error");
    const errDesc = u.searchParams.get("error_description");
    const hash = u.hash || "";
    return { href: u.href, code, err, errDesc, hash };
  }, []);

  // ✅ If already logged in, don't show callback UI at all
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) nav("/", { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [nav]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setStep("starting");

        if (urlInfo.err) {
          throw new Error(`${urlInfo.err}: ${urlInfo.errDesc ?? "OAuth error"}`);
        }

        setStep("processing");

        // 1) Try PKCE exchange if code exists (non-fatal if verifier missing)
        if (urlInfo.code) {
          const res = await supabase.auth.exchangeCodeForSession(urlInfo.href);
          if (res.error && !isPkceVerifierMissing(res.error)) {
            setDebug((d) => ({ ...d, exchangeError: String(res.error.message ?? res.error) }));
          } else if (res.error && isPkceVerifierMissing(res.error)) {
            setDebug((d) => ({ ...d, exchangeIgnored: "PKCE verifier missing (ignored)" }));
          }
        } else if (urlInfo.hash && urlInfo.hash.length > 1) {
          // 2) Fallback for older implicit/hash callbacks (rare)
          const anyAuth: any = supabase.auth as any;
          if (typeof anyAuth.getSessionFromUrl === "function") {
            const { error } = await anyAuth.getSessionFromUrl({ storeSession: true });
            if (error) setDebug((d) => ({ ...d, storeHashError: String(error.message ?? error) }));
          }
        }

        setStep("waiting_session");
        const session = await waitForSession(9000);

        const { data: sNow } = await supabase.auth.getSession();
        const { data: uNow } = await supabase.auth.getUser();

        setDebug((d) => ({
          ...d,
          url: { hasCode: Boolean(urlInfo.code), hashLen: urlInfo.hash?.length ?? 0 },
          sessionAfterWait: Boolean(session),
          sessionNow: Boolean(sNow.session),
          userNow: Boolean(uNow.user),
          userId: uNow.user?.id ?? null,
          email: uNow.user?.email ?? null,
        }));

        if (!sNow.session) {
          throw new Error("No session after OAuth callback.");
        }

        if (cancelled) return;

        setStep("done");
        nav("/", { replace: true });
      } catch (e: any) {
        if (cancelled) return;

        // If session exists anyway -> treat as success
        const { data: sNow } = await supabase.auth.getSession();
        if (sNow.session) {
          nav("/", { replace: true });
          return;
        }

        setStep("error");
        setError(String(e?.message ?? e ?? "Auth callback failed"));
        setDebug((d) => ({
          ...d,
          caughtError: String(e?.message ?? e ?? "Auth callback failed"),
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav, urlInfo]);

  async function hardReset() {
    await supabase.auth.signOut({ scope: "global" });
    nav("/auth", { replace: true });
  }

  const label =
    step === "starting"
      ? "Starte OAuth Callback…"
      : step === "processing"
      ? "Login wird verarbeitet…"
      : step === "waiting_session"
      ? "Warte auf Session…"
      : step === "done"
      ? "Fertig…"
      : "Fehler";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: 16 }}>
      <div
        style={{
          width: "min(720px, 96vw)",
          borderRadius: 18,
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 900 }}>Login wird abgeschlossen…</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>{label}</div>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 12 }}>
          {step === "error" && error && (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Fehler: <b>{error}</b>
            </div>
          )}

          {/* ✅ Debug only when error */}
          {step === "error" && (
            <div
              style={{
                borderRadius: 14,
                border: "1px dashed var(--border)",
                background: "rgba(255,255,255,0.65)",
                padding: 12,
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              <div style={{ fontWeight: 900, color: "var(--text)" }}>Debug</div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{JSON.stringify({ step, ...debug }, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => nav("/auth", { replace: true })}
              style={{
                borderRadius: 999,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Zurück zum Login
            </button>

            <button
              onClick={() => void hardReset()}
              style={{
                borderRadius: 999,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: "rgba(172,0,0,0.92)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Hard Reset (Sign out)
            </button>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
            Hinweis: Wenn du deployed bist (Vercel/Netlify) brauchst du zusätzlich SPA rewrites, sonst bekommst du bei
            <code> /auth/callback</code> 404.
          </div>
        </div>
      </div>
    </div>
  );
}
