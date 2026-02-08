// FILE: src/features/explore/ExploreGeoNavCard.tsx

import { Button, Card } from "../../shared/ui";
import type { GeoId } from "../../entities/geo/ids";
import type { GeoNode } from "../../entities/geo/model";

type Props = {
  breadcrumbText: string;

  current: GeoNode;
  children: GeoNode[];

  canGoBack: boolean;
  onBack: () => void;

  onGoTo: (id: GeoId) => void;

  // demo shortcuts (keine neue Logik – nur UI)
  showShortcuts?: boolean;
};

export default function ExploreGeoNavCard({
  breadcrumbText,
  current,
  children,
  canGoBack,
  onBack,
  onGoTo,
  showShortcuts = true,
}: Props) {
  return (
    <Card>
      <div style={{ fontWeight: 900 }}>Navigation (Demo)</div>
      <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
        Breadcrumb: {breadcrumbText}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <Button onClick={onBack} disabled={!canGoBack}>
          ← Zurück
        </Button>

        {showShortcuts && (
          <>
            <Button onClick={() => onGoTo("1")}>Zürich</Button>
            <Button onClick={() => onGoTo("2")}>Bern</Button>
            <Button onClick={() => onGoTo("ch")}>Schweiz</Button>
          </>
        )}
      </div>

      <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
        Current: <b>{current.name}</b> · Level: <b>{current.level}</b> · Children: <b>{children.length}</b>
      </div>

      {children.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {children.slice(0, 6).map((c) => (
            <Button key={c.id} onClick={() => onGoTo(c.id as GeoId)}>
              {c.name}
            </Button>
          ))}
          {children.length > 6 && (
            <div style={{ alignSelf: "center", fontSize: 12, color: "var(--muted)" }}>
              … {children.length - 6} weitere
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
