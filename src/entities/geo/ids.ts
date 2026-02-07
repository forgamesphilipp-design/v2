export type CountryId = "ch";
export type CantonId = string; // "1".."26"
export type DistrictId = string; // "d-<canton>-<districtNo>"
export type CommunityId = string; // "m-<canton>-<raw>"

export type GeoLevel = "country" | "canton" | "district" | "community";

export type GeoId = CountryId | CantonId | DistrictId | CommunityId;

export function isCountryId(id: string): id is CountryId {
  return id === "ch";
}

export function isCantonId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function isDistrictId(id: string): boolean {
  return /^d-(\d+)-(\d+)$/.test(id);
}

export function isCommunityId(id: string): boolean {
  return /^m-(\d+)-(.+)$/.test(id);
}

export function parseDistrictId(id: string): { cantonId: CantonId; districtNo: string } | null {
  const m = /^d-(\d+)-(\d+)$/.exec(String(id));
  if (!m) return null;
  return { cantonId: m[1], districtNo: m[2] };
}

export function parseCommunityId(id: string): { cantonId: CantonId; rawId: string } | null {
  const m = /^m-(\d+)-(.+)$/.exec(String(id));
  if (!m) return null;
  return { cantonId: m[1], rawId: m[2] };
}

export function makeDistrictId(cantonId: CantonId, districtNo: string | number): DistrictId {
  return `d-${String(cantonId)}-${String(districtNo)}`;
}

export function makeCommunityId(cantonId: CantonId, rawId: string | number): CommunityId {
  return `m-${String(cantonId)}-${String(rawId)}`;
}

export function levelOfGeoId(id: string): GeoLevel | null {
  if (isCountryId(id)) return "country";
  if (isCantonId(id)) return "canton";
  if (isDistrictId(id)) return "district";
  if (isCommunityId(id)) return "community";
  return null;
}
