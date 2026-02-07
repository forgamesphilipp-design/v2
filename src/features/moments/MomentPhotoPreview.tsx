import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

type Props = {
  file: File;
  onCancel: () => void;
  onRetry: () => void;
  onConfirm: () => void;
};

export default function MomentPhotoPreview({ file, onCancel, onRetry, onConfirm }: Props) {
  const url = URL.createObjectURL(file);

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

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Button onClick={onCancel}>Löschen</Button>
        <Button onClick={onRetry}>Nochmal</Button>
        <Button variant="primary" onClick={onConfirm}>
          Speichern
        </Button>
      </div>
    </Card>
  );
}
