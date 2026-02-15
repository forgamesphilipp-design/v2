// FILE: src/pages/AuthPage.tsx
// OAuth buttons added + existing magic-link flow preserved.
// (Includes your busy/status fix.)

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../app/supabaseClient";
import { signInWithProvider } from "../features/auth/oauth";

type Status = "idle" | "sent" | "error";

function isValidEmail(e: string) {
  const s = e.trim();
  return s.includes("@") && s.includes(".") && s.length >= 6;
}

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // resend cooldown (UI only)
  const [cooldownS, setCooldownS] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const canSend = useMemo(() => isValidEmail(email), [email]);

  function startCooldown(seconds: number) {
    setCooldownS(seconds);

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setCooldownS((s) => {
        if (s <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  async function sendLink() {
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return;
    if (busy) return;

    setErr(null);
    setBusy(true);

    try {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setStatus("sent");
      startCooldown(30);
    } catch (e: any) {
      setErr(String(e?.message ?? e ?? "Fehler"));
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    if (busy) return;
    setErr(null);
    setBusy(true);
    try {
      await signInWithProvider(provider);
      // note: signInWithOAuth redirects away; code below won't run
    } catch (e: any) {
      setErr(String(e?.message ?? e ?? "Fehler"));
      setStatus("error");
      setBusy(false);
    }
  }

  function reset() {
    if (busy) return;
    setStatus("idle");
    setErr(null);
    setCooldownS(0);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  const hint = useMemo(() => {
    if (status === "sent") return "✅ Link gesendet. Öffne deine Email und klicke den Login-Link. (Spam prüfen)";
    if (status === "error" && err) return `Fehler: ${err}`;
    return "Login via Magic Link oder Social Login.";
  }, [status, err]);

  const buttonLabel = useMemo(() => {
    if (busy) return "Sende…";
    if (status === "sent") return "Erneut senden";
    return "Login-Link senden";
  }, [busy, status]);

  const primaryDisabled = useMemo(() => {
    if (!canSend) return true;
    if (busy) return true;
    if (status === "sent" && cooldownS > 0) return true;
    return false;
  }, [canSend, busy, status, cooldownS]);

  const showResend = status === "sent";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, display: "grid", gap: 12 }}>
        <div
          style={{
            borderRadius: 18,
            border: "1px solid var(--border)",
            background: "var(--card)",
            boxShadow: "var(--shadow)",
            padding: 16,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900 }}>Login</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)", lineHeight: 1.35 }}>{hint}</div>

          {/* OAuth buttons */}
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <button
              onClick={() => void oauth("google")}
              disabled={busy}
              style={{
                borderRadius: 999,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: "#fff",
                color: "var(--text)",
                cursor: busy ? "not-allowed" : "pointer",
                fontWeight: 900,
                boxShadow: "0 10px 22px rgba(15,23,42,.08)",
              }}
            >
              Weiter mit Google
            </button>
          </div>

          {/* Divider */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>oder</div>
            <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
          </div>

          {/* Magic link */}
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>Email</div>

            <input
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="name@email.ch"
              autoComplete="email"
              inputMode="email"
              disabled={busy}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "10px 12px",
                outline: "none",
                background: "var(--card)",
                color: "inherit",
                fontSize: 14,
              }}
            />

            <button
              onClick={() => void sendLink()}
              disabled={primaryDisabled}
              style={{
                marginTop: 8,
                borderRadius: 999,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: primaryDisabled ? "rgba(0,0,0,0.06)" : "rgba(172, 0, 0, 0.92)",
                color: primaryDisabled ? "rgba(0,0,0,0.45)" : "#fff",
                cursor: primaryDisabled ? "not-allowed" : "pointer",
                fontWeight: 900,
                boxShadow: "0 10px 22px rgba(15,23,42,.10)",
              }}
            >
              {showResend && cooldownS > 0 ? `Erneut senden (${cooldownS}s)` : buttonLabel}
            </button>

            {showResend && (
              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                <button
                  onClick={reset}
                  disabled={busy}
                  style={{
                    borderRadius: 999,
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    cursor: busy ? "not-allowed" : "pointer",
                    fontWeight: 900,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  Andere Email
                </button>

                <div style={{ alignSelf: "center", fontSize: 12, color: "var(--muted)" }}>
                  Tipp: Auf Mobile öffnet sich der Link evtl. im Browser – ist ok.
                </div>
              </div>
            )}

            {status === "sent" && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
                Wenn du den Link nicht findest: Spam/Promotions prüfen oder nach <b>Supabase</b> suchen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
