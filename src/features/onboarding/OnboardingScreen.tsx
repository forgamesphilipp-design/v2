// FILE: src/features/onboarding/OnboardingScreen.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../app/AppLayout";
import { Card, Button } from "../../shared/ui";
import { repositories } from "../../app/repositories";
import { useAuth } from "../auth/useAuth";

export default function OnboardingScreen() {
  const nav = useNavigate();
  const auth = useAuth();

  const initialName = useMemo(() => auth.profile?.displayName ?? "", [auth.profile?.displayName]);
  const [displayName, setDisplayName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = displayName.trim().length >= 2 && !busy;

  async function save() {
    if (!canSave) return;
    setBusy(true);
    setErr(null);

    try {
      await repositories.profile.updateMyProfile({
        displayName: displayName.trim(),
        onboardedAt: new Date().toISOString(),
      });

      // refresh auth context so guards see onboardedAt immediately
      await auth.refresh();

      nav("/", { replace: true });
    } catch (e: any) {
      setErr(String(e?.message ?? e ?? "Fehler"));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    // Onboarding should be optional to cancel; easiest is logout.
    // (AuthStatus also supports logout, but user is not in main app yet.)
    const { supabase } = await import("../../app/supabaseClient");
    await supabase.auth.signOut();
    nav("/auth", { replace: true });
  }

  return (
    <AppLayout title="Onboarding" subtitle="Profil einrichten" backTo="/" right={null}>
      <div style={{ display: "grid", gap: 12 }}>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Willkommen!</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>
            Kurz Profil einrichten.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>Anzeigename</div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="z.B. Max"
              autoComplete="nickname"
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

            {err && (
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
                Fehler: <b>{err}</b>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={() => void save()} disabled={!canSave}>
                {busy ? "Speichere…" : "Speichern"}
              </Button>

              <Button onClick={() => void logout()} disabled={busy}>
                Abbrechen (Logout)
              </Button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
              Hinweis: Du kannst das später in den Settings ändern.
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
