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

  // IMPORTANT:
  // In DB speichern wir einen STORAGE-PFAD (private bucket).
  // In der UI liefern wir eine SIGNED URL zurück.
  photoUrl: string;

  // resolved mapping at creation time
  admin: MomentAdmin;
};
