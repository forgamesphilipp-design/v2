// FILE: src/entities/quiz/repositoryMemory.ts

import type { QuizRepository } from "./repository";
import type { QuizMode, QuizModeId, QuizTarget } from "./model";
import { loadCantonsGeo } from "../geo/geoStore";

const modes: QuizMode[] = [
  {
    id: "ch-cantons",
    title: "Kantone – Schweiz",
    description: "Finde den richtigen Kanton auf der Karte",
    startScopeId: "ch",
  },
];

let cachedCantonTargets: QuizTarget[] | null = null;

function cantonIdFromProps(props: any): string | null {
  const v = props?.kantonsnummer ?? props?.id ?? props?.canton_id;
  if (typeof v === "number") return String(v);
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function cantonNameFromProps(props: any): string | null {
  const v = props?.name ?? props?.kantonsname ?? props?.canton_name;
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

async function buildCantonTargets(): Promise<QuizTarget[]> {
  if (cachedCantonTargets) return cachedCantonTargets;

  const geo = await loadCantonsGeo();
  const features = (geo?.features ?? []) as any[];

  const out: QuizTarget[] = [];

  for (const f of features) {
    const p = f?.properties ?? {};
    const id = cantonIdFromProps(p);
    if (!id) continue;

    const name = cantonNameFromProps(p) ?? `Kanton ${id}`;
    out.push({ name, path: [id] });
  }

  // Stable sort by numeric canton id (1..26)
  out.sort((a, b) => Number(a.path[0]) - Number(b.path[0]));

  cachedCantonTargets = out;
  return out;
}

export function createQuizRepositoryMemory(): QuizRepository {
  return {
    async listModes() {
      return modes.slice();
    },

    async getMode(id) {
      return modes.find((m) => m.id === id) ?? null;
    },

    async loadTargets(modeId: QuizModeId) {
      if (modeId === "ch-cantons") {
        return await buildCantonTargets();
      }
      return [];
    },
  };
}
