export type QuizModeId = string;

export type QuizTarget = {
  name: string;
  path: string[]; // z.B. ["1", "d-1-110", "m-1-261"]
};

export type QuizMode = {
  id: QuizModeId;
  title: string;
  description: string;
  startScopeId: string; // z.B. "ch"
};
