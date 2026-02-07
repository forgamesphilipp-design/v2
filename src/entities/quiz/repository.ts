import type { QuizMode, QuizModeId, QuizTarget } from "./model";

export interface QuizRepository {
  listModes(): Promise<QuizMode[]>;
  getMode(id: QuizModeId): Promise<QuizMode | null>;

  // Targets pro Mode
  loadTargets(modeId: QuizModeId): Promise<QuizTarget[]>;
}
