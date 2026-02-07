import AppLayout from "../app/AppLayout";
import Card from "../shared/ui/Card";

export default function LearnPage() {
  return (
    <AppLayout title="Learn" subtitle="Lernen & Inhalte (später)" backTo="/">
      <Card>
        <div style={{ fontWeight: 900 }}>Learn</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Platzhalter. Hier kommt später Struktur für Lerninhalte rein.
        </div>
      </Card>
    </AppLayout>
  );
}
