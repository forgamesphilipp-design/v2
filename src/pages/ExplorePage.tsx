import AppLayout from "../app/AppLayout";
import Card from "../shared/ui/Card";

export default function ExplorePage() {
  return (
    <AppLayout title="Explore" subtitle="Karte + Standort + Moments (später)" backTo="/">
      <Card>
        <div style={{ fontWeight: 900 }}>Explore</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Platzhalter. Hier kommt später das Map-Feature rein.
        </div>
      </Card>
    </AppLayout>
  );
}
