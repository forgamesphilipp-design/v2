import AppLayout from "../../app/AppLayout";
import Card from "../../shared/ui/Card";

export default function LearnScreen() {
  return (
    <AppLayout title="Learn" subtitle="Lernen & Inhalte (später)" backTo="/">
      <Card>
        <div style={{ fontWeight: 900 }}>Learn</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Feature-Screen. Hier kommt später die Lernstruktur rein.
        </div>
      </Card>
    </AppLayout>
  );
}
