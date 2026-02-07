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
import { appConfig } from "../../app/config";
import { createMomentFromCamera } from "../moments/createMomentFromCamera";

export default function ExploreScreen() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const nav = useGeoNavigation("ch");

  const breadcrumbText = nav.breadcrumb.map((n) => n.name).join(" › ");

  async function refresh() {
    const list = await repositories.moments.list();
    setMoments(list);
  }

  useEffect(() => {
    if (!appConfig.features.moments) return;
    void refresh();
  }, []);

  async function addFromCamera() {
    await createMomentFromCamera();
    await refresh();
  }

  return (
    <AppLayout title="Explore" subtitle="Domain-Test (später Karte/GPS)" backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        {appConfig.features.geoNavigation && (
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
              Current: <b>{nav.current.name}</b> · Level: <b>{nav.current.level}</b> · Children:{" "}
              <b>{nav.children.length}</b>
            </div>

            {nav.children.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {nav.children.slice(0, 6).map((c) => (
                  <Button key={c.id} onClick={() => void nav.goTo(c.id)}>
                    {c.name}
                  </Button>
                ))}
                {nav.children.length > 6 && (
                  <div style={{ alignSelf: "center", fontSize: 12, color: "var(--muted)" }}>
                    … {nav.children.length - 6} weitere
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        <MapPlaceholder current={nav.current} breadcrumbText={breadcrumbText} />

        {appConfig.features.moments && (
          <>
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>Moments</div>
                  <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
                    Kamera + Cloud Storage (noch ohne GPS/Admin)
                  </div>
                </div>

                <Button variant="primary" onClick={() => void addFromCamera()}>
                  + Foto aufnehmen
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
                      <div
                        style={{
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {m.title || "Moment"}
                      </div>
                      <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 12 }}>
                        {new Date(m.takenAt).toLocaleString("de-CH")}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
