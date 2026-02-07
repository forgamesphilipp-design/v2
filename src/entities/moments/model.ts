export type LonLat = {
  lon: number;
  lat: number;
};

export type AdminRef = {
  id: string;
  name: string;
};

export type MomentAdmin = {
  canton: AdminRef | null;
  district: AdminRef | null;
  community: AdminRef | null;
};

export type Moment = {
  id: string;

  title: string; // optional label
  takenAt: string; // ISO string

  position: LonLat;
  accuracyM: number | null;

  // later: real cloud storage URL
  photoUrl: string;

  // resolved mapping at creation time
  admin: MomentAdmin;
};
