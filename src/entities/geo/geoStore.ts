export type GeoFeatureCollection = {
    type: "FeatureCollection";
    features: any[];
  };
  
  type Key = "cantons" | "districts" | "communities";
  
  const URLS: Record<Key, string> = {
    cantons: "/geo/cantons.geojson",
    districts: "/geo/districts.geojson",
    communities: "/geo/communities.geojson",
  };
  
  const cache: Partial<Record<Key, GeoFeatureCollection>> = {};
  const inflight: Partial<Record<Key, Promise<GeoFeatureCollection>>> = {};
  
  async function fetchJson(url: string): Promise<GeoFeatureCollection> {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
    return (await r.json()) as GeoFeatureCollection;
  }
  
  async function load(key: Key): Promise<GeoFeatureCollection> {
    if (cache[key]) return cache[key] as GeoFeatureCollection;
    if (inflight[key]) return inflight[key] as Promise<GeoFeatureCollection>;
  
    inflight[key] = fetchJson(URLS[key])
      .then((data) => {
        cache[key] = data;
        return data;
      })
      .finally(() => {
        delete inflight[key];
      });
  
    return inflight[key] as Promise<GeoFeatureCollection>;
  }
  
  export function loadCantonsGeo() {
    return load("cantons");
  }
  export function loadDistrictsGeo() {
    return load("districts");
  }
  export function loadCommunitiesGeo() {
    return load("communities");
  }
  