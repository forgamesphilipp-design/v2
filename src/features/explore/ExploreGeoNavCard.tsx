// FILE: src/features/explore/ExploreGeoNavCard.tsx

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

  const showEnsure =
    Boolean(onEnsureChildren) &&
    (current.level === "canton" || current.level === "district");

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 950 }}>Navigation</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {current.name} · {levelLabel(current.level)}
            </div>
          </div>
        </div>
      </div>
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
                  <Button
                    key={String(n.id)}
                    onClick={() => !isLast && onGoTo(n.id as GeoId)}
                    disabled={isLast}
                  >
                    {n.name}
                  </Button>
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
    </Card>
  );
}
