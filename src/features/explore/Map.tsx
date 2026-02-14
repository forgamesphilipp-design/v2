// FILE: src/features/explore/MapPlaceholder.tsx

import type { GeoNode } from "../../entities/geo/model";
import HierarchySvg from "./HierarchySvg";

type Props = {
  current: GeoNode;
  onSelectNode: (id: string) => void;
};

export default function Map({ current, onSelectNode }: Props) {
  return (
    <HierarchySvg
      scopeId={String(current.id)}
      parentId={current.parentId ? String(current.parentId) : null}
      level={current.level as any}
      onSelectNode={onSelectNode}
    />
  );
}
