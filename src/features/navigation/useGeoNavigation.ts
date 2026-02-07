import { useCallback, useEffect, useMemo, useState } from "react";
import { repositories } from "../../app/repositories";
import type { GeoId, GeoLevel } from "../../entities/geo/ids";
import type { GeoNode } from "../../entities/geo/model";
import type { GeoTree } from "../../entities/geo/repository";

type UseGeoNavigationResult = {
  tree: GeoTree | null;

  current: GeoNode;
  children: GeoNode[];
  breadcrumb: GeoNode[];

  goTo: (id: GeoId) => Promise<void>;
  goBack: () => Promise<void>;
  canGoBack: boolean;

  ensureChildren: () => Promise<void>;
};

function buildBreadcrumb(nodes: Record<string, GeoNode>, current: GeoNode) {
  const out: GeoNode[] = [];
  const seen = new Set<string>();

  let n: GeoNode | undefined = current;
  while (n && !seen.has(n.id)) {
    seen.add(n.id);
    out.unshift(n);
    n = n.parentId ? nodes[n.parentId] : undefined;
  }

  return out;
}

export function useGeoNavigation(rootId: GeoId = "ch"): UseGeoNavigationResult {
  const [tree, setTree] = useState<GeoTree | null>(null);
  const [currentId, setCurrentId] = useState<GeoId>(rootId);

  // initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const t = await repositories.geo.getTree();
      if (cancelled) return;

      setTree(t);

      // safety: if rootId not present, fallback to "ch"
      if (!t.nodes[String(rootId)]) setCurrentId("ch");
    })();

    return () => {
      cancelled = true;
    };
  }, [rootId]);

  const nodes = tree?.nodes ?? {};

  const current: GeoNode = useMemo(() => {
    return (
      nodes[String(currentId)] ??
      nodes[String(rootId)] ??
      nodes["ch"] ?? {
        id: "ch",
        level: "country",
        name: "Schweiz",
        parentId: null,
        childrenIds: [],
      }
    );
  }, [nodes, currentId, rootId]);

  const children: GeoNode[] = useMemo(() => {
    return (current.childrenIds ?? [])
      .map((id) => nodes[String(id)])
      .filter(Boolean) as GeoNode[];
  }, [current, nodes]);

  const breadcrumb: GeoNode[] = useMemo(() => {
    return buildBreadcrumb(nodes, current);
  }, [nodes, current]);

  const canGoBack = Boolean(current.parentId);

  const refreshTree = useCallback(async () => {
    const t = await repositories.geo.getTree();
    setTree(t);
  }, []);

  const goTo = useCallback(async (id: GeoId) => {
    const key = String(id).trim() as GeoId;
    if (!key) return;
    setCurrentId(key);
  }, []);

  const goBack = useCallback(async () => {
    if (!current.parentId) return;
    setCurrentId(current.parentId as GeoId);
  }, [current.parentId]);

  const ensureChildren = useCallback(async () => {
    await repositories.geo.ensureChildren(current.id as GeoId, current.level as GeoLevel);
    await refreshTree();
  }, [current.id, current.level, refreshTree]);

  // Phase 13: Auto-load children when entering canton/district (only if empty)
  useEffect(() => {
    if (!tree) return;

    const lvl = current.level;
    const shouldLoad = (lvl === "canton" || lvl === "district") && (current.childrenIds?.length ?? 0) === 0;

    if (!shouldLoad) return;

    // fire-and-forget, but safe
    void ensureChildren();
  }, [tree, current.id, current.level, current.childrenIds, ensureChildren]);

  return {
    tree,

    current,
    children,
    breadcrumb,

    goTo,
    goBack,
    canGoBack,

    ensureChildren,
  };
}
