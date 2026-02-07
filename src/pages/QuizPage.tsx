import Card from "../shared/ui/Card";

export default function QuizPage() {
  return (
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <Card>
        <div style={{ fontSize: 18, fontWeight: 900 }}>Quiz</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Kommt später: Modus-Auswahl + Runner.
        </div>
      </Card>
    </div>
  );
}
