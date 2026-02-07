import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../app/supabaseClient";

export default function AuthPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const canSend = useMemo(() => {
    const e = email.trim();
    return e.includes("@") && e.includes(".");
  }, [email]);

  async function sendLink() {
    const e = email.trim().toLowerCase();
    if (!canSend) return;

    setErr(null);
    setStatus("sending");

    try {
      const redirectTo = window.location.origin; // wichtig für Mobile/Vercel
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;

      setStatus("sent");
    } catch (e: any) {
      setErr(String(e?.message ?? e ?? "Fehler"));
      setStatus("error");
    }
  }

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
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)", lineHeight: 1.35 }}>
            Bitte anmelden, bevor du SwissOrient nutzen kannst. Du bekommst einen{" "}
            <b>Login-Link per Email</b>.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>Email</div>
            <input
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="name@email.ch"
              autoComplete="email"
              inputMode="email"
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
              disabled={!canSend || status === "sending"}
              style={{
                marginTop: 8,
                borderRadius: 999,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: !canSend || status === "sending" ? "rgba(0,0,0,0.06)" : "rgba(172, 0, 0, 0.92)",
                color: !canSend || status === "sending" ? "rgba(0,0,0,0.45)" : "#fff",
                cursor: !canSend || status === "sending" ? "not-allowed" : "pointer",
                fontWeight: 900,
                boxShadow: "0 10px 22px rgba(15,23,42,.10)",
              }}
            >
              {status === "sending" ? "Sende…" : "Login-Link senden"}
            </button>

            {status === "sent" && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
                ✅ Link gesendet. Öffne deine Email und klicke den Login-Link.
              </div>
            )}

            {err && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
                Fehler: <b>{err}</b>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          style={{
            borderRadius: 999,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            background: "var(--bg)",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Zurück
        </button>
      </div>
    </div>
  );
}
