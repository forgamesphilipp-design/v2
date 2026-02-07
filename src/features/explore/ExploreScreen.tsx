// Temporary screen for testing the Moments + Navigation domains.
// This screen will be cleaned up once Map/GPS + Cloud backend replace the demo parts.
import { useEffect, useState } from "react";
import AppLayout from "../../app/AppLayout";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import { repositories } from "../../app/repositories";
import type { Moment } from "../../entities/moments/model";
import { useGeoNavigation } from "../navigation/useGeoNavigation";
import MapPlaceholder from "./MapPlaceholder";

export default function ExploreScreen() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const nav = useGeoNavigation("ch");

  const breadcrumbText = nav.breadcrumb.map((n) => n.name).join(" › ");

  async function refresh() {
    const list = await repositories.moments.list();
    setMoments(list);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addFake() {
    await repositories.moments.create({
      title: `Test ${moments.length + 1}`,
      takenAt: new Date().toISOString(),
      position: { lon: 8.54, lat: 47.37 },
      accuracyM: 10,
      photoUrl: "https://via.placeholder.com/600x400?text=Moment",
      admin: { canton: { id: "1", name: "Zürich" }, district: null, community: null },
    });

    await refresh();
  }

  return (
    <AppLayout title="Explore" subtitle="Domain-Test (später Karte/GPS)" backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        <Card>
          <div style={{ fontWeight: 900 }}>Navigation (Demo)</div>
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
            Breadcrumb: {breadcrumbText}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <Button onClick={() => void nav.goBack()} disabled={!nav.canGoBack}>
              ← Zurück
            </Button>

            <Button onClick={() => void nav.goTo("1")}>Zürich</Button>
            <Button onClick={() => void nav.goTo("2")}>Bern</Button>
            <Button onClick={() => void nav.goTo("ch")}>Schweiz</Button>
          </div>

          <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
            Current: <b>{nav.current.id}</b> · Level: <b>{nav.current.level}</b>
          </div>
        </Card>

        {/* Phase 12: Minimaler Debug-Block, um sicher zu sehen, dass ensureChildren lädt */}
        <Card>
          <div style={{ fontWeight: 900 }}>Geo Children (Debug)</div>
          <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
            Current: <b>{nav.current.name}</b> · children: <b>{nav.children.length}</b>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <Button variant="primary" onClick={() => void nav.ensureChildren()}>
              Children laden
            </Button>

            {nav.children.slice(0, 8).map((c) => (
              <Button key={c.id} onClick={() => void nav.goTo(c.id)}>
                {c.name}
              </Button>
            ))}
          </div>

          {nav.children.length > 8 && (
            <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>
              … {nav.children.length - 8} weitere
            </div>
          )}
        </Card>

        {/* Phase 10: Map placeholder (bleibt bewusst simpel) */}
        <MapPlaceholder current={nav.current} breadcrumbText={breadcrumbText} />

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Moments (Demo)</div>
              <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
                Noch ohne Backend. Nur um die Struktur zu verstehen.
              </div>
            </div>

            <Button variant="primary" onClick={() => void addFake()}>
              + Fake Moment
            </Button>
          </div>
        </Card>

        <div style={{ display: "grid", gap: 10 }}>
          {moments.length === 0 ? (
            <Card>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Noch keine Moments.</div>
            </Card>
          ) : (
            moments.map((m) => (
              <Card key={m.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={m.photoUrl}
                  alt=""
                  style={{
                    width: 88,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.title || "Moment"}
                  </div>
                  <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 12 }}>
                    {new Date(m.takenAt).toLocaleString("de-CH")} · {m.admin?.canton?.name ?? "—"}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
