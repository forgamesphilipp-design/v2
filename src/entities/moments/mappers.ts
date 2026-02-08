// FILE: src/entities/moments/mappers.ts

import type { Moment } from "./model";

export type MomentsRow = {
  id: string;
  title: string | null;
  taken_at: string;
  lon: number;
  lat: number;
  accuracy_m: number | null;
  photo_url: string | null; // storage path in DB
  admin: any; // MomentAdmin JSON
};

export function mapMomentRow(row: MomentsRow, signedPhotoUrl: string): Moment {
  return {
    id: row.id,
    title: row.title ?? "",
    takenAt: row.taken_at,
    position: { lon: row.lon, lat: row.lat },
    accuracyM: row.accuracy_m,
    photoUrl: signedPhotoUrl, // UI: signed url
    admin: row.admin,
  };
}
