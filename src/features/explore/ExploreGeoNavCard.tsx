// FILE: src/features/explore/ExploreGeoNavCard.tsx

import { useState } from "react";
import { Button, Card } from "../../shared/ui";
import type { GeoId } from "../../entities/geo/ids";
import type { GeoNode } from "../../entities/geo/model";

type Props = {
  breadcrumb: GeoNode[];
  current: GeoNode;

  canGoBack: boolean;
  onBack: () => void;
  onGoTo: (id: GeoId) => void;

  onEnsureChildren?: () => void;
  ensureBusy?: boolean;
};

function levelLabel(level: GeoNode["level"]) {
  if (level === "country") return "Land";
  if (level === "canton") return "Kanton";
  if (level === "district") return "Bezirk";
  return "Gemeinde";
}

export default function ExploreGeoNavCard({
  breadcrumb,
  current,
  canGoBack,
  onBack,
  onGoTo,
  onEnsureChildren,
  ensureBusy = false,
}: Props) {
  const [open, setOpen] = useState(true);

  const showEnsure =
    Boolean(onEnsureChildren) &&
    (current.level === "canton" || current.level === "district");

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 160ms ease",
            }}
          >
            ▶
          </div>

          <div>
            <div style={{ fontWeight: 950 }}>Navigation</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {current.name} · {levelLabel(current.level)}
            </div>
          </div>
        </div>
      </div>

      {/* Animated content */}
      <div
        style={{
          maxHeight: open ? 1000 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 260ms ease, opacity 180ms ease",
        }}
      >
        <div style={{ padding: 16, paddingTop: 0, display: "grid", gap: 12 }}>
          {/* Breadcrumb */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--muted)" }}>
              Pfad
            </div>

            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {breadcrumb.map((n, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <button
                    key={String(n.id)}
                    onClick={() => !isLast && onGoTo(n.id as GeoId)}
                    disabled={isLast}
                    style={{
                      borderRadius: 999,
                      padding: "6px 10px",
                      border: "1px solid var(--border)",
                      background: isLast
                        ? "rgba(172,0,0,0.10)"
                        : "var(--bg)",
                      cursor: isLast ? "default" : "pointer",
                      fontWeight: isLast ? 950 : 900,
                      fontSize: 12,
                      color: isLast ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {n.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={onBack} disabled={!canGoBack}>
              ← Zurück
            </Button>

            {showEnsure && (
              <Button
                variant="primary"
                onClick={() => onEnsureChildren?.()}
                disabled={ensureBusy}
              >
                {ensureBusy ? "Lade…" : "Kinder laden"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
