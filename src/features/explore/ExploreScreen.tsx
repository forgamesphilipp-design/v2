// This is a temporary screen for testing the Moments domain! 
import { useEffect, useState } from "react";
import AppLayout from "../../app/AppLayout";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import { repositories } from "../../app/repositories";
import type { Moment } from "../../entities/moments/model";

export default function ExploreScreen() {
  const [moments, setMoments] = useState<Moment[]>([]);

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
      photoUrl: "https://via.placeholder.com/600x400?text=Moment", // später echter Storage-Link
      admin: { canton: { id: "1", name: "Zürich" }, district: null, community: null },
    });

    await refresh();
  }

  return (
    <AppLayout title="Explore" subtitle="Domain-Test (später Karte/GPS)" backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Moments (Demo)</div>
              <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
                Noch ohne Backend. Nur um die Struktur zu verstehen.
              </div>
            </div>

            <Button variant="primary" onClick={addFake}>
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
                  style={{ width: 88, height: 60, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
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
