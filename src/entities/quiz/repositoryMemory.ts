import type { QuizRepository } from "./repository";
import type { QuizMode, QuizModeId, QuizTarget } from "./model";

const modes: QuizMode[] = [
  {
    id: "ch-cantons",
    title: "Kantone – Schweiz",
    description: "Finde den richtigen Kanton auf der Karte",
    startScopeId: "ch",
  },
];

const targetsByMode: Record<QuizModeId, QuizTarget[]> = {
  "ch-cantons": [
    { name: "Zürich", path: ["1"] },
    { name: "Bern", path: ["2"] },
    { name: "Luzern", path: ["3"] },
  ],
};

export function createQuizRepositoryMemory(): QuizRepository {
  return {
    async listModes() {
      return modes.slice();
    },
    async getMode(id) {
      return modes.find((m) => m.id === id) ?? null;
    },
    async loadTargets(modeId) {
      return (targetsByMode[modeId] ?? []).slice();
    },
  };
}
