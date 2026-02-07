// This file is currently not used!

import type { CreateMomentInput, MomentsRepository } from "./repository";
import type { Moment } from "./model";

function makeId() {
  // works in modern browsers; fallback for older environments
  const anyCrypto = globalThis.crypto as any;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export class MomentsRepositoryMemory implements MomentsRepository {
  private items: Moment[] = [];

  async list(): Promise<Moment[]> {
    // newest first
    return [...this.items].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  }

  async get(id: string): Promise<Moment | null> {
    return this.items.find((m) => m.id === id) ?? null;
  }

  async create(input: CreateMomentInput): Promise<Moment> {
    const next: Moment = {
      id: makeId(),
      title: String(input.title ?? "").trim(),
      takenAt: input.takenAt,
      position: input.position,
      accuracyM: input.accuracyM ?? null,
      photoUrl: input.photoUrl,
      admin: input.admin,
    };

    this.items = [next, ...this.items];
    return next;
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((m) => m.id !== id);
  }

  async clearAll(): Promise<void> {
    this.items = [];
  }
}
