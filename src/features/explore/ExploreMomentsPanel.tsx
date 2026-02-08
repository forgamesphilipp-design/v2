// FILE: src/features/explore/ExploreMomentsPanel.tsx

import { useEffect, useState } from "react";
import { Button, Card } from "../../shared/ui";
import { repositories } from "../../app/repositories";
import type { Moment } from "../../entities/moments/model";
import { useMomentCameraFlow } from "../moments/useMomentCameraFlow";
import MomentPhotoPreview from "../moments/MomentPhotoPreview";

export default function ExploreMomentsPanel() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const camera = useMomentCameraFlow();

  async function refresh() {
    const list = await repositories.moments.list();
    setMoments(list);
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Nach Speichern / Abbrechen neu laden
  useEffect(() => {
    if (!camera.file && !camera.busy) void refresh();
  }, [camera.file, camera.busy]);

  return (
    <>
      {camera.file ? (
        <MomentPhotoPreview
          file={camera.file}
          busy={camera.busy}
          error={camera.error}
          onCancel={camera.cancel}
          onRetry={camera.retry}
          onConfirm={camera.confirm}
        />
      ) : (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Moments</div>
              <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
                Native Kamera · Vorschau · Private Storage (Signed URLs)
              </div>
            </div>

            <Button variant="primary" onClick={camera.start} disabled={camera.busy}>
              + Foto aufnehmen
            </Button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {moments.length === 0 ? (
          <Card>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Noch keine Moments.</div>
          </Card>
        ) : (
          moments.map((m) => (
            <Card key={m.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={m.photoUrl || "https://via.placeholder.com/600x400?text=No+Access"}
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
  );
}
