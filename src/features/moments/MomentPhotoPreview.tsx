import { useEffect, useMemo } from "react";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

type Props = {
  file: File;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onRetry: () => void;
  onConfirm: () => void;
};

export default function MomentPhotoPreview({ file, busy = false, error, onCancel, onRetry, onConfirm }: Props) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <Card>
      <div style={{ fontWeight: 900 }}>Foto Vorschau</div>

      <img
        src={url}
        alt="Preview"
        style={{
          width: "100%",
          marginTop: 12,
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      />

      {error && (
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
          Fehler: <b>{error}</b>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Button onClick={onCancel} disabled={busy}>
          Löschen
        </Button>
        <Button onClick={onRetry} disabled={busy}>
          Nochmal
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={busy}>
          {busy ? "Speichere…" : "Speichern"}
        </Button>
      </div>
    </Card>
  );
}
