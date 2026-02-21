// FILE: src/features/explore/HierarchySvg.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { useGeoData } from "../geo/useGeoData";
import { makeCommunityId, makeDistrictId, parseCommunityId, parseDistrictId } from "../../entities/geo/ids";

type LockedFill = Record<string, "white" | "yellow" | "orange" | "red">;

type ClusterPin = {
  id: string;
  lonLat: [number, number];
};

type Props = {
  scopeId: string;
  parentId: string | null;
  level: "country" | "canton" | "district" | "community";
  onSelectNode: (nodeId: string) => void;

  flashId?: string | null;
  flashColor?: "red" | "green" | "blue" | null;

  lockToId?: string | null;
  lockedFills?: LockedFill;

  gpsLonLat?: [number, number] | null;
  gpsAccuracyM?: number | null;

  pins?: ClusterPin[];
  onSelectPin?: (id: string) => void;
};

type RenderedFeature = {
  id: string;
  d: string;
  nodeId: string;
  props: any;
};

function cantonIdFromProps(props: any): string | null {
  const v = props?.kantonsnummer;
  return typeof v === "number" ? String(v) : typeof v === "string" ? v : null;
}

function districtIdFromProps(props: any, cantonId: string, fallback: string): string {
  const bz = props?.bezirksnummer ?? fallback;
  return makeDistrictId(cantonId, String(bz));
}

function communityIdFromProps(props: any, cantonId: string, fallback: string): string {
  const raw = props?.id ?? fallback;
  return makeCommunityId(cantonId, String(raw));
}

function fillFromLocked(key: LockedFill[keyof LockedFill]) {
  if (key === "white") return "#ffffff";
  if (key === "yellow") return "#facc15";
  if (key === "orange") return "#fb923c";
  return "#ef4444";
}

export default function HierarchySvg({
  scopeId,
  level,
  onSelectNode,
  flashId,
  flashColor,
  lockToId,
  lockedFills,
  gpsLonLat,
  gpsAccuracyM,
  pins,
  onSelectPin,
}: Props) {
  const need = useMemo(() => {
    if (level === "country") return { cantons: true };
    if (level === "canton") return { districts: true, communities: true };
    if (level === "district") return { communities: true };
    if (level === "community") return { communities: true };
    return { cantons: true };
  }, [level]);

  const geoData = useGeoData(need);

  const geo = geoData.cantons;
  const districtGeo = geoData.districts;
  const communityGeo = geoData.communities;

  const [hovered, setHovered] = useState<string | null>(null);
  const [_debugSelected, setDebugSelected] = useState<any>(null);

  const lockActive = Boolean(lockToId);
  const projectionRef = useRef<any>(null);

  const enterTimer = useRef<number | null>(null);
  const leaveTimer = useRef<number | null>(null);

  const dCache = useRef<Map<string, string>>(new Map());

  const isHoverCapableRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    const compute = () => {
      isHoverCapableRef.current = mq?.matches ?? false;
      if (!isHoverCapableRef.current) setHovered(null);
    };
    compute();

    if (!mq) return;

    const onChange = () => compute();

    if ("addEventListener" in mq) (mq as any).addEventListener("change", onChange);
    else (mq as any).addListener(onChange);

    return () => {
      if ("removeEventListener" in mq) (mq as any).removeEventListener("change", onChange);
      else (mq as any).removeListener(onChange);
    };
  }, []);

  const features = useMemo(() => {
    const sid = String(scopeId);

    if (level === "country") {
      if (!geo?.features) return [];
      return geo.features;
    }

    if (level === "canton") {
      if (districtGeo?.features) {
        const districts = districtGeo.features.filter((f: any) => String(f?.properties?.kantonsnummer) === sid);
        if (districts.length > 0) return districts;
      }

      if (!communityGeo?.features) return [];
      return communityGeo.features.filter((f: any) => {
        const p = f?.properties ?? {};
        return String(p.kantonsnummer) === sid && (p.bezirksnummer == null || String(p.bezirksnummer).trim() === "");
      });
    }

    if (level === "district") {
      if (!communityGeo?.features) return [];
      const parsed = parseDistrictId(sid);
      if (!parsed) return [];

      return communityGeo.features.filter((f: any) => {
        const kn = f?.properties?.kantonsnummer;
        const bn = f?.properties?.bezirksnummer;
        return String(kn) === String(parsed.cantonId) && bn != null && String(bn) === String(parsed.districtNo);
      });
    }

    if (level === "community") {
      if (!communityGeo?.features) return [];
      const parsed = parseCommunityId(sid);
      if (!parsed) return [];

      return communityGeo.features.filter((f: any) => {
        const p = f?.properties ?? {};
        const kn = p?.kantonsnummer;
        const raw = p?.id;

        // ✅ parseCommunityId liefert { rawId }, nicht communityRaw
        return String(kn) === String(parsed.cantonId) && raw != null && String(raw) === String(parsed.rawId);
      });
    }

    return [];
  }, [geo, districtGeo, communityGeo, scopeId, level]);

  const pathFn = useMemo(() => {
    const projection = geoMercator();
    if (features.length > 0) {
      projection.fitSize([1000, 700], { type: "FeatureCollection", features } as any);
    }
    projectionRef.current = projection;
    return geoPath(projection as any);
  }, [features]);

  const rendered = useMemo<RenderedFeature[]>(() => {
    return features.map((f: any, idx: number) => {
      const sid = String(scopeId);

      let id: string;
      let nodeId: string;

      if (level === "country") {
        id = cantonIdFromProps(f.properties) ?? `c-${idx}`;
        nodeId = cantonIdFromProps(f.properties) ?? id;
      } else if (level === "canton") {
        if (f?.properties?.bezirksnummer != null) {
          id = districtIdFromProps(f.properties, sid, `x-${idx}`);
          nodeId = id;
        } else {
          id = communityIdFromProps(f.properties, sid, `m-${idx}`);
          nodeId = id;
        }
      } else if (level === "district") {
        const parsed = parseDistrictId(sid);
        const cantonId = parsed?.cantonId ?? "0";
        id = communityIdFromProps(f.properties, cantonId, `m-${idx}`);
        nodeId = id;
      } else {
        id = `u-${idx}`;
        nodeId = id;
      }

      const cacheKey = `${sid}:${id}`;
      let d = dCache.current.get(cacheKey);
      if (!d) {
        d = pathFn(f) || "";
        dCache.current.set(cacheKey, d);
      }

      return { id, d, nodeId, props: f?.properties ?? {} };
    });
  }, [features, pathFn, scopeId, level]);

  const pinPoints = useMemo(() => {
    const list = pins ?? [];
    if (!list.length) return [];
    const proj = projectionRef.current;
    if (!proj) return [];

    const out: { id: string; x: number; y: number }[] = [];
    for (const m of list) {
      const p = proj(m.lonLat);
      if (!p) continue;
      out.push({ id: m.id, x: p[0], y: p[1] });
    }
    return out;
  }, [pins, scopeId, level, features]);

  const onEnter = (id: string) => {
    if (!isHoverCapableRef.current) return;
    if (lockActive && lockToId && id !== lockToId) return;

    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    if (enterTimer.current) window.clearTimeout(enterTimer.current);

    enterTimer.current = window.setTimeout(() => {
      setHovered((prev) => (prev === id ? prev : id));
    }, 40);
  };

  const onLeave = (id: string) => {
    if (!isHoverCapableRef.current) return;
    if (lockActive && lockToId && id !== lockToId) return;

    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);

    leaveTimer.current = window.setTimeout(() => {
      setHovered((prev) => (prev === id ? null : prev));
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!lockActive) return;
    setHovered(null);
  }, [lockActive]);

  if (level === "country" && !geo) return <div style={{ height: "70vh" }} />;
  if (level === "canton" && !districtGeo && !communityGeo) return <div style={{ height: "70vh" }} />;
  if (level === "district" && !communityGeo) return <div style={{ height: "70vh" }} />;
  if (level === "community" && !communityGeo) return <div style={{ height: "70vh" }} />;

  let gpsPoint: { x: number; y: number } | null = null;
  if (gpsLonLat && projectionRef.current) {
    const p = projectionRef.current(gpsLonLat);
    if (p) gpsPoint = { x: p[0], y: p[1] };
  }

  return (
    <div
      style={{
        width: "100%",
        height: "70vh",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      {/* MiniMap hier bewusst deaktiviert (ENABLE_MINIMAP=false) */}

      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "manipulation",
        }}
      >
        {rendered.map(({ id, d, nodeId, props }) => {
        const lockedKey = lockedFills?.[id] ?? null;
        const isLocked = Boolean(lockedKey);

        const isAllowedByHint = !lockActive || !lockToId || id === lockToId;
        const isAllowed = isAllowedByHint && !isLocked;

        const isHover = isAllowed && hovered === id && isHoverCapableRef.current;

        const baseClickable = level === "country" || level === "canton" || level === "district";
        const clickable = baseClickable && isAllowed;

        const lockedFill = lockedKey ? fillFromLocked(lockedKey) : null;

        // ✅ NEW: disable fill animation for click-feedback states (locked or flash)
        const disableFillAnim = Boolean(lockedKey) || flashId === id;

        return (
          <path
            key={id}
            d={d}
            fill={
              lockedFill
                ? lockedFill
                : flashId === id
                ? flashColor === "red"
                  ? "#c00000"
                  : flashColor === "green"
                  ? "#16a34a"
                  : "#2563eb"
                : !isAllowedByHint
                ? "#e6e6e6"
                : isHover
                ? "#eee"
                : "#b2cdff"
            }
            stroke={!isAllowedByHint ? "rgba(0,0,0,0.25)" : "#000"}
            strokeWidth={1}
            onPointerEnter={(e) => {
              if (!clickable) return;
              if (e.pointerType !== "mouse") return;
              onEnter(id);
            }}
            onPointerLeave={(e) => {
              if (!clickable) return;
              if (e.pointerType !== "mouse") return;
              onLeave(id);
            }}
            onClick={() => {
              if (!clickable) return;

              setDebugSelected({ level, scopeId, id, nodeId, props });
              onSelectNode(nodeId);
            }}
            style={{
              cursor: clickable ? "pointer" : "default",
              // ✅ hover animiert, click/flash/locked instant
              transition: disableFillAnim
                ? "stroke-width 120ms ease, stroke 120ms ease"
                : "fill 120ms ease, stroke-width 120ms ease, stroke 120ms ease",
            }}
          />
        );
      })}

        {/* Cluster Pins */}
        {pinPoints.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={11}
              fill="rgba(172, 0, 0, 0.92)"
              stroke="#fff"
              strokeWidth={2}
              style={{ cursor: onSelectPin ? "pointer" : "default" }}
              onClick={() => onSelectPin?.(p.id)}
            />
            <circle cx={p.x} cy={p.y} r={4} fill="#fff" opacity={0.9} pointerEvents="none" />
          </g>
        ))}

        {/* GPS marker */}
        {gpsPoint && (
          <>
            {typeof gpsAccuracyM === "number" && gpsAccuracyM > 0 && (
              <circle
                cx={gpsPoint.x}
                cy={gpsPoint.y}
                r={Math.min(140, Math.max(12, gpsAccuracyM / 8))}
                fill="rgba(37, 99, 235, 0.12)"
                stroke="rgba(37, 99, 235, 0.35)"
                strokeWidth={1}
              />
            )}
            <circle cx={gpsPoint.x} cy={gpsPoint.y} r={7} fill="#2563eb" stroke="#fff" strokeWidth={2} />
          </>
        )}
      </svg>
    </div>
  );
}
