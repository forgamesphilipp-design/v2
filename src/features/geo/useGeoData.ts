// FILE: src/features/geo/useGeoData.ts

import { useEffect, useMemo, useState } from "react";
import type { GeoFeatureCollection } from "../../entities/geo/geoStore";
import { loadCantonsGeo, loadCommunitiesGeo, loadDistrictsGeo } from "../../entities/geo/geoStore";

type Need = Partial<Record<"cantons" | "districts" | "communities", boolean>>;

type GeoData = {
  cantons: GeoFeatureCollection | null;
  districts: GeoFeatureCollection | null;
  communities: GeoFeatureCollection | null;
  loading: boolean;
  error: string | null;
};

export function useGeoData(need: Need): GeoData {
  const [cantons, setCantons] = useState<GeoFeatureCollection | null>(null);
  const [districts, setDistricts] = useState<GeoFeatureCollection | null>(null);
  const [communities, setCommunities] = useState<GeoFeatureCollection | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => JSON.stringify(need ?? {}), [need]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const jobs: Promise<void>[] = [];

        if (need.cantons) {
          jobs.push(
            loadCantonsGeo().then((g) => {
              if (!cancelled) setCantons(g);
            })
          );
        }

        if (need.districts) {
          jobs.push(
            loadDistrictsGeo().then((g) => {
              if (!cancelled) setDistricts(g);
            })
          );
        }

        if (need.communities) {
          jobs.push(
            loadCommunitiesGeo().then((g) => {
              if (!cancelled) setCommunities(g);
            })
          );
        }

        await Promise.all(jobs);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e ?? "Geo load failed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { cantons, districts, communities, loading, error };
}
