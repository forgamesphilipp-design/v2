import type { Moment, MomentAdmin, LonLat } from "./model";

export type CreateMomentInput = {
  title: string;
  takenAt: string; // ISO
  position: LonLat;
  accuracyM: number | null;
  photoUrl: string;
  admin: MomentAdmin;
};

export type MomentsRepository = {
  list(): Promise<Moment[]>;
  get(id: string): Promise<Moment | null>;
  create(input: CreateMomentInput): Promise<Moment>;
  remove(id: string): Promise<void>;
  clearAll(): Promise<void>;
};
