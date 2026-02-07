import type { Moment, MomentId } from "./model";

export type CreateMomentInput = Omit<Moment, "id">;

export interface MomentsRepository {
  list(): Promise<Moment[]>;
  get(id: MomentId): Promise<Moment | null>;
  create(input: CreateMomentInput): Promise<Moment>;
  remove(id: MomentId): Promise<void>;
}
