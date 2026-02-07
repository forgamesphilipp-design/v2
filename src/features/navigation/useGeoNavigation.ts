import { useCallback, useEffect, useMemo, useState } from "react";
import { repositories } from "../../app/repositories";
import type { GeoId, GeoLevel } from "../../entities/geo/ids";
import { levelOfGeoId } from "../../entities/geo/ids";
import type { GeoNode } from "../../entities/geo/model";

type GeoNavigation = {
  current: GeoNode;
  breadcrumb: GeoNode[];
  goTo: (id: GeoId) => Promise<void>;
  goBack: () => Promise<void>;
  canGoBack: boolean;
};

function buildBreadcrumb(nodes: Record<string, GeoNode>, current: GeoNode): GeoNode[] {
  const out: GeoNode[] = [];
  const seen = new Set<string>();
  let n: GeoNode | undefined = current;

  while (n && !seen.has(n.id)) {
    seen.add(n.id);
    out.unshift(n);
    n = n.parentId ? nodes[String(n.parentId)] : undefined;
  }
  return out;
}

export function useGeoNavigation(rootId: GeoId = "ch"): GeoNavigation {
  const [nodes, setNodes] = useState<Record<string, GeoNode>>({});
  const [currentId, setCurrentId] = useState<GeoId>(rootId);

  // initial tree load
  useEffect(() => {
    let cancelled = false;

    repositories.geo.getTree().then((tree) => {
      if (cancelled) return;
      setNodes(tree.nodes);
      // root safety
      setCurrentId((prev) => (tree.nodes[String(prev)] ? prev : tree.rootId));
    });

    return () => {
      cancelled = true;
    };
  }, [rootId]);

  const current: GeoNode = useMemo(() => {
    return nodes[String(currentId)] ?? nodes[String(rootId)] ?? { id: rootId, level: "country", name: "…", parentId: null, childrenIds: [] };
  }, [nodes, currentId, rootId]);

  const breadcrumb = useMemo(() => buildBreadcrumb(nodes, current), [nodes, current]);

  const ensure = useCallback(async (id: GeoId) => {
    const level = levelOfGeoId(String(id)) as GeoLevel | null;
    if (!level) return;
    await repositories.geo.ensureChildren(id, level);

    // repo könnte nodes intern erweitert haben -> erneut Tree ziehen
    const tree = await repositories.geo.getTree();
    setNodes(tree.nodes);
  }, []);

  const goTo = useCallback(
    async (id: GeoId) => {
      const key = String(id).trim() as GeoId;
      if (!key) return;

      // ensure children data for destination parent-level as needed
      await ensure(key);

      // after ensure: if exists, set
      const tree = await repositories.geo.getTree();
      if (tree.nodes[String(key)]) setCurrentId(key);
      else setCurrentId(tree.rootId);
    },
    [ensure]
  );

  const goBack = useCallback(async () => {
    const parentId = current.parentId;
    if (parentId && nodes[String(parentId)]) {
      setCurrentId(parentId);
      return;
    }
    setCurrentId(rootId);
  }, [current.parentId, nodes, rootId]);

  const canGoBack = current.parentId != null && String(current.id) !== String(rootId);

  return { current, breadcrumb, goTo, goBack, canGoBack };
}
