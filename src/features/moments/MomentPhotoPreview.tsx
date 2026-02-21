// FILE: src/features/moments/MomentPhotoPreview.tsx

import { useEffect, useMemo, useState } from "react";
import { Card, Button } from "../../shared/ui";

type Props = {
  file: File;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onRetry: () => void;
  onConfirm: () => void;
};

export default function MomentPhotoPreview({
  file,
  busy = false,
  error,
  onCancel,
  onRetry,
  onConfirm,
}: Props) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [expired, setExpired] = useState(false);

  // Object URL cleanup
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  // Reset bei neuem Foto
  useEffect(() => {
    setSecondsLeft(60);
    setExpired(false);
  }, [file]);

  // Countdown
  useEffect(() => {
    if (busy || expired) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [busy, expired]);

  return (
    <Card style={{ position: "relative" }}>
      <img
        src={url}
        alt="Preview"
        style={{
          width: "100%",
          marginTop: 12,
          borderRadius: 12,
          opacity: expired ? 0.4 : 1,
        }}
      />

      {!expired && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "right",
          }}
        >
          Vorschau läuft ab in {secondsLeft}s
        </div>
      )}

      {error && !expired && (
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
          Fehler: <b>{error}</b>
        </div>
      )}

      {!expired && (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Button onClick={onCancel} disabled={busy}>
            Abbrechen
          </Button>
          <Button onClick={onRetry} disabled={busy}>
            Nochmal
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Speichere…" : "Speichern"}
          </Button>
        </div>
      )}

      {/* Expired Overlay */}
      {expired && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: 12,
              padding: 20,
              minWidth: 220,
              textAlign: "center",
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              Vorschau abgelaufen
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
              Die Zeit zur Bestätigung ist abgelaufen.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}