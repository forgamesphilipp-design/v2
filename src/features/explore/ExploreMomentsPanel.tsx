// FILE: src/features/explore/ExploreMomentsPanel.tsx

import { useEffect, useMemo, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import { Button, Card } from "../../shared/ui";
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
  const [open, setOpen] = useState(true);

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
    <Card padding={0} style={{ overflow: "hidden" }}>
      {/* Header (immer sichtbar) */}
      <div
        style={{
          padding: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 160ms ease",
              flex: "0 0 auto",
            }}
          >
            ▶
          </div>

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
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
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
      </div>

      {/* Animated content */}
      <div
        style={{
          maxHeight: open ? 1200 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 260ms ease, opacity 180ms ease",
        }}
      >
        <div style={{ padding: 16, paddingTop: 0, display: "grid", gap: 12 }}>
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
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Native Kamera · Vorschau · Private Storage (Signed URLs)
            </div>
          )}

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
              <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Noch keine Moments.</div>
            ) : open ? (
              <List<RowProps>
                rowComponent={MomentRow}
                rowCount={moments.length}
                rowHeight={92}
                rowProps={{ items: moments }}
                style={{ height: 420, width: "100%" }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
