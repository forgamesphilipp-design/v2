import type { CreateMomentInput, MomentsRepository } from "./repository";
import type { Moment, MomentId } from "./model";

function uid(): MomentId {
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createMomentsRepositoryMemory(): MomentsRepository {
  let items: Moment[] = [];

  return {
    async list() {
      return items.slice().sort((a, b) => (a.takenAt < b.takenAt ? 1 : -1));
    },
    async get(id) {
      return items.find((m) => m.id === id) ?? null;
    },
    async create(input: CreateMomentInput) {
      const m: Moment = { ...input, id: uid() };
      items = [m, ...items];
      return m;
    },
    async remove(id: MomentId) {
      items = items.filter((m) => m.id !== id);
    },
  };
}
