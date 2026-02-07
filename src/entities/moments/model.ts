export type MomentId = string;

export type LonLat = { lon: number; lat: number };

export type MomentAdmin = {
  canton?: { id: string; name: string } | null;
  district?: { id: string; name: string } | null;
  community?: { id: string; name: string } | null;
};

export type Moment = {
  id: MomentId;
  title: string;

  takenAt: string; // ISO (new Date().toISOString())
  position: LonLat;
  accuracyM: number | null;

  // später Cloud: URL ins Storage (nicht dataUrl)
  photoUrl: string;

  admin: MomentAdmin;
};
