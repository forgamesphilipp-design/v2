import type { GeoId, GeoLevel } from "./ids";

export type GeoNode = {
  id: GeoId;
  level: GeoLevel;
  name: string;

  parentId: GeoId | null;
  childrenIds: GeoId[];
};
