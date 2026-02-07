import type { GeoId, GeoLevel } from "./ids";
import type { GeoNode } from "./model";

export type GeoTree = {
  rootId: GeoId;
  nodes: Record<string, GeoNode>;
};

export interface GeoRepository {
  // liefert mindestens den "base tree" (country + cantons),
  // und kann je nach Level dynamisch nachladen (districts/communities)
  getTree(): Promise<GeoTree>;

  // “ensure” Funktionen: falls Children noch nicht da sind, werden sie geladen/gebaut
  ensureChildren(id: GeoId, level: GeoLevel): Promise<void>;

  // optional helpers
  getNode(id: GeoId): Promise<GeoNode | null>;
}
