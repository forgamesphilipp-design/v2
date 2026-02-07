import Card from "../shared/ui/Card";

export default function ExplorePage() {
  return (
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <Card>
        <div style={{ fontSize: 18, fontWeight: 900 }}>Explore</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Kommt später: Karte + Standort + Moments.
        </div>
      </Card>
    </div>
  );
}
