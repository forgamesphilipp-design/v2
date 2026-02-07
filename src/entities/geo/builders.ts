import type { GeoFeatureCollection } from "./geoStore";
import type { GeoNode } from "./model";
import { makeDistrictId, makeCommunityId } from "./ids";

export function buildDistrictNodesForCanton(geo: GeoFeatureCollection, cantonId: string) {
  const districtNodes: Record<string, GeoNode> = {};
  const districtIds: string[] = [];

  for (const f of geo.features ?? []) {
    const p = f?.properties ?? {};
    if (String(p.kantonsnummer) !== String(cantonId)) continue;

    const dn = p.bezirksnummer;
    if (dn == null || String(dn).trim() === "") continue;

    const id = makeDistrictId(String(cantonId), String(dn));
    const name = String(p.name ?? p.bezirksname ?? "Bezirk").trim();

    if (!districtNodes[id]) {
      districtNodes[id] = {
        id,
        level: "district",
        name,
        parentId: String(cantonId),
        childrenIds: [],
      };
      districtIds.push(id);
    }
  }

  return { districtNodes, districtIds };
}

export function buildCommunityNodesForParent(geo: GeoFeatureCollection, parentId: string) {
  // parentId kann Kanton ("1") oder Bezirk ("d-1-110") sein
  const communityNodes: Record<string, GeoNode> = {};
  const communityIds: string[] = [];

  const isDistrict = /^d-(\d+)-(\d+)$/.test(String(parentId));
  const districtMatch = /^d-(\d+)-(\d+)$/.exec(String(parentId));
  const cantonId = isDistrict ? String(districtMatch?.[1] ?? "") : String(parentId);
  const districtNo = isDistrict ? String(districtMatch?.[2] ?? "") : null;

  for (const f of geo.features ?? []) {
    const p = f?.properties ?? {};
    if (String(p.kantonsnummer) !== String(cantonId)) continue;

    if (districtNo) {
      const bn = p.bezirksnummer;
      if (bn == null || String(bn) !== String(districtNo)) continue;
    } else {
      // Canton-parent: nur Gemeinden ohne Bezirk
      const bn = p.bezirksnummer;
      if (bn != null && String(bn).trim() !== "") continue;
    }

    const rawId = p.id;
    if (rawId == null) continue;

    const id = makeCommunityId(String(cantonId), String(rawId));
    const name = String(p.name ?? p.gemeindename ?? "Gemeinde").trim();

    communityNodes[id] = {
      id,
      level: "community",
      name,
      parentId: String(parentId),
      childrenIds: [],
    };
    communityIds.push(id);
  }

  return { communityNodes, communityIds };
}
