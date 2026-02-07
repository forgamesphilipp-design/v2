// FILE: src/features/settings/SettingsScreen.tsx

import { useMemo, useState } from "react";
import AppLayout from "../../app/AppLayout";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import { useAuth } from "../auth/useAuth";
import { repositories } from "../../app/repositories";
import { supabase } from "../../app/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SettingsScreen() {
  const auth = useAuth();
  const nav = useNavigate();

  const initialName = useMemo(() => auth.profile?.displayName ?? "", [auth.profile?.displayName]);
  const [displayName, setDisplayName] = useState(initialName);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canSave = displayName.trim().length >= 2 && !busy && displayName.trim() !== (initialName ?? "").trim();

  async function save() {
    if (!canSave) return;
    setBusy(true);
    setErr(null);
    setSaved(false);

    try {
      await repositories.profile.updateMyProfile({
        displayName: displayName.trim(),
      });

      await auth.refresh();
      setSaved(true);

      // hide saved state after a moment (no async background needed)
      window.setTimeout(() => setSaved(false), 1200);
    } catch (e: any) {
      setErr(String(e?.message ?? e ?? "Fehler"));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await supabase.auth.signOut();
      nav("/auth", { replace: true });
    } catch (e: any) {
      setErr(String(e?.message ?? e ?? "Fehler"));
      setBusy(false);
    }
  }

  return (
    <AppLayout title="Settings" subtitle="Account & Profil" backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        <Card>
          <div style={{ fontWeight: 900 }}>Account</div>

          <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: 13 }}>
            <div style={{ color: "var(--muted)" }}>
              Email: <b style={{ color: "var(--text)" }}>{auth.user?.email ?? "—"}</b>
            </div>
            <div style={{ color: "var(--muted)" }}>
              User ID: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{auth.user?.id ?? "—"}</span>
            </div>
            <div style={{ color: "var(--muted)" }}>
              Onboarding:{" "}
              <b style={{ color: "var(--text)" }}>{auth.profile?.onboardedAt ? "✅ done" : "❌ missing"}</b>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={() => nav("/onboarding")} disabled={busy}>
              Onboarding öffnen
            </Button>
            <Button onClick={() => void logout()} disabled={busy}>
              Logout
            </Button>
          </div>

          {err && (
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
              Fehler: <b>{err}</b>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 900 }}>Profil</div>
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13, lineHeight: 1.4 }}>
            Anzeigename wird in der App verwendet (Header etc.). Avatar kommt später.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>Anzeigename</div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="z.B. Phil"
              autoComplete="nickname"
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

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Button variant="primary" onClick={() => void save()} disabled={!canSave}>
                {busy ? "Speichere…" : "Speichern"}
              </Button>
              {saved && <div style={{ fontSize: 13, color: "var(--muted)" }}>✅ Gespeichert</div>}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 900 }}>Nächste Schritte (optional)</div>
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Avatar Upload (Storage) + Anzeige im Header</li>
              <li>Email ändern</li>
              <li>Account löschen (mit Storage Cleanup via Edge Function)</li>
              <li>OAuth (Google/Apple) als Alternative zu Magic Link</li>
            </ul>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
