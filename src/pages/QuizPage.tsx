import AppLayout from "../app/AppLayout";
import Card from "../shared/ui/Card";

export default function QuizPage() {
  return (
    <AppLayout title="Quiz" subtitle="Modi + Runner (später)" backTo="/">
      <Card>
        <div style={{ fontWeight: 900 }}>Quiz</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Platzhalter. Hier kommen später Modus-Auswahl und Quiz-Runner rein.
        </div>
      </Card>
    </AppLayout>
  );
}
