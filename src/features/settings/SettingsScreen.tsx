// FILE: src/features/settings/SettingsScreen.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../app/AppLayout";
import { Card, Button, useToast, Modal } from "../../shared/ui";
import { useAuth } from "../auth/useAuth";
import { repositories } from "../../app/repositories";

export default function SettingsScreen() {
  const auth = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const initialName = useMemo(() => auth.profile?.displayName ?? "", [auth.profile?.displayName]);
  const [displayName, setDisplayName] = useState(initialName);

  // Tracks whether the user has manually edited the input.
  // We only auto-sync from profile when user hasn't touched it.
  const touchedRef = useRef(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Delete-account UI state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  // ✅ Keep input in sync with profile changes (e.g. after refresh/reload),
  // but only if the user isn't actively editing.
  useEffect(() => {
    if (touchedRef.current) return;
    setDisplayName(initialName);
  }, [initialName]);

  const canSave =
    displayName.trim().length >= 2 &&
    !busy &&
    displayName.trim() !== (initialName ?? "").trim();

  async function save() {
    if (!canSave) return;

    const nextName = displayName.trim();

    setBusy(true);
    setErr(null);
    setSaved(false);

    try {
      await repositories.profile.updateMyProfile({
        displayName: nextName,
      });

      touchedRef.current = false;

      await auth.refresh();

      setSaved(true);
      toast.success("Profil gespeichert.");
      window.setTimeout(() => setSaved(false), 1200);
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "Fehler");
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function openDeleteModal() {
    setDeleteErr(null);
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (deleteBusy) return;
    setDeleteOpen(false);
    setDeleteErr(null);
  }

  async function confirmDeleteAccount() {
    if (deleteBusy) return;

    setDeleteBusy(true);
    setDeleteErr(null);

    try {
      // 1) Call backend hard delete
      await repositories.account.deleteMyAccount();

      // 2) Ensure local state is clean and user is out
      await auth.logout();

      toast.success("Account gelöscht.");

      // 3) Navigate to login
      nav("/auth", { replace: true });
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "Fehler");
      setDeleteErr(msg);
      toast.error(msg);
    } finally {
      setDeleteBusy(false);
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
              User ID:{" "}
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                {auth.user?.id ?? "—"}
              </span>
            </div>
          </div>

          {err && (
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
              Fehler: <b>{err}</b>
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={openDeleteModal}
              disabled={!auth.isAuthed || deleteBusy}
              style={{
                background: "rgba(172, 0, 0, 0.92)",
                color: "#fff",
                border: "1px solid rgba(172, 0, 0, 0.35)",
              }}
            >
              Account löschen
            </Button>
          </div>
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
              onChange={(e) => {
                touchedRef.current = true;
                setDisplayName(e.target.value);
              }}
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
      </div>

      <Modal open={deleteOpen} title="Account wirklich löschen?" onClose={closeDeleteModal}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 900 }}>Achtung</div>

          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            Dein Account wird <b>dauerhaft</b> gelöscht:
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              <li>Login/Account (Supabase Auth)</li>
              <li>Profil</li>
              <li>Alle Moments</li>
              <li>Alle Fotos im Storage</li>
            </ul>
            Danach kannst du dich mit derselben Email wieder neu registrieren.
          </div>

          {deleteErr && (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Fehler: <b>{deleteErr}</b>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Button onClick={closeDeleteModal} disabled={deleteBusy}>
              Abbrechen
            </Button>

            <Button
              onClick={() => void confirmDeleteAccount()}
              disabled={deleteBusy}
              style={{
                background: "rgba(172, 0, 0, 0.92)",
                color: "#fff",
                border: "1px solid rgba(172, 0, 0, 0.35)",
              }}
            >
              {deleteBusy ? "Lösche…" : "Wirklich löschen"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
