// FILE: src/features/explore/MapPlaceholder.tsx

import { Card } from "../../shared/ui";
import type { GeoNode } from "../../entities/geo/model";

export default function MapPlaceholder(props: { current: GeoNode; breadcrumbText: string }) {
  const { current, breadcrumbText } = props;

  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ fontWeight: 900 }}>Map (Placeholder)</div>
      <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
        Hier kommt später die echte Karte rein (HierarchySvg).
      </div>

      <div
        style={{
          marginTop: 12,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          padding: 14,
          minHeight: 220,
          display: "grid",
          alignContent: "start",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Breadcrumb</div>
        <div style={{ fontWeight: 900, lineHeight: 1.25 }}>{breadcrumbText}</div>

        <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>Current</div>
        <div style={{ fontWeight: 900 }}>
          {current.name}{" "}
          <span style={{ color: "var(--muted)", fontWeight: 700 }}>
            ({current.level} · {current.id})
          </span>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
          Next: echtes GeoRepository + HierarchySvg (klickbare Shapes).
        </div>
      </div>
    </Card>
  );
}
