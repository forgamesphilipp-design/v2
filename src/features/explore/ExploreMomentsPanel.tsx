// FILE: src/features/explore/ExploreMomentsPanel.tsx

import { useEffect, useMemo, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import { Button, Card, Modal } from "../../shared/ui";
import { repositories } from "../../app/repositories";
import type { Moment } from "../../entities/moments/model";
import { useMomentCameraFlow } from "../moments/useMomentCameraFlow";
import MomentPhotoPreview from "../moments/MomentPhotoPreview";

type RowProps = { items: Moment[] };

function MomentRow({ index, style, items }: RowComponentProps<RowProps>) {
  const m = items[index];

  return (
    <div style={{ ...style, padding: "0 8px" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          padding: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <img
          src={m.photoUrl || "https://via.placeholder.com/600x400?text=No+Access"}
          alt=""
          loading="lazy"
          style={{
            width: 88,
            height: 60,
            objectFit: "cover",
            borderRadius: 12,
            border: "1px solid var(--border)",
            flex: "0 0 auto",
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
      </div>
    </div>
  );
}

export default function ExploreMomentsPanel() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(false);

  const camera = useMomentCameraFlow();

  async function refresh() {
    setLoading(true);
    try {
      const list = await repositories.moments.list();
      setMoments(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Nach Speichern / Abbrechen neu laden
  useEffect(() => {
    if (!camera.file && !camera.busy) void refresh();
  }, [camera.file, camera.busy]);

  const headerMeta = useMemo(() => {
    if (camera.file) return "Vorschau";
    if (loading) return "Lade…";
    return `${moments.length} ${moments.length === 1 ? "Eintrag" : "Einträge"}`;
  }, [camera.file, loading, moments.length]);

  return (
    <>
      <Card padding={0} style={{ overflow: "hidden" }}>
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              minWidth: 0,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 950 }}>Moments</div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {headerMeta}
              </div>
            </div>

            {!camera.file && (
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  void camera.start();
                }}
                disabled={camera.busy}
              >
                + Foto aufnehmen
              </Button>
            )}
          </div>

          {!camera.file ? (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Native Kamera · Vorschau · Private Storage (Signed URLs)
            </div>
          ) : null}

          <div
            style={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              padding: 8,
              height: 420,
              overflow: "hidden",
            }}
          >
            {moments.length === 0 ? (
              <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>
                Noch keine Moments.
              </div>
            ) : (
              <List<RowProps>
                rowComponent={MomentRow}
                rowCount={moments.length}
                rowHeight={92}
                rowProps={{ items: moments }}
                style={{ height: 420, width: "100%" }}
              />
            )}
          </div>
        </div>
      </Card>

      <Modal
        open={Boolean(camera.file)}
        title="Vorschau"
        onClose={() => {
          if (!camera.busy) camera.cancel();
        }}
      >
        {camera.file ? (
          <MomentPhotoPreview
            file={camera.file}
            busy={camera.busy}
            error={camera.error}
            onCancel={camera.cancel}
            onRetry={camera.retry}
            onConfirm={camera.confirm}
          />
        ) : null}
      </Modal>
    </>
  );
}