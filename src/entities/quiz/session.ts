// FILE: src/entities/quiz/session.ts

import type { QuizMode, QuizTarget } from "./model";

/**
 * Phasen:
 * - idle: noch nicht gestartet (oder noch keine Targets geladen)
 * - running: Nutzer kann antworten
 * - feedback: korrekt/falsch Feedback wird angezeigt (flash), dann "Next"
 * - done: fertig
 */
export type QuizPhase = "idle" | "running" | "feedback" | "done";

export type QuizAnswerResult = "correct" | "wrong";

export type LockedFill = "white" | "yellow" | "orange" | "red";

/**
 * UI-Props die wir direkt an HierarchySvg durchreichen können.
 * (UI bleibt dadurch dünn und v2-konform)
 */
export type QuizVisuals = {
  flashId: string | null;
  flashColor: "red" | "green" | "blue" | null;

  /**
   * Optional: "Hint/Lock" - nur dieses Feature ist anklickbar
   * (deaktiviert alle anderen interaktiv)
   */
  lockToId: string | null;

  /**
   * Optional: bereits gelöste / markierte Gebiete einfärben.
   * Key = rendered feature id in HierarchySvg (bei Cantons: cantonId, etc.)
   */
  lockedFills: Record<string, LockedFill>;
};

export type QuizSession = {
  mode: QuizMode;
  targets: QuizTarget[];

  phase: QuizPhase;

  /**
   * Index in targets (0..n-1)
   */
  index: number;

  /**
   * Ergebnis der letzten Antwort (für Feedback-Phase)
   */
  lastResult: QuizAnswerResult | null;

  /**
   * Stats
   */
  correctCount: number;
  wrongCount: number;

  /**
   * Visual/Map state (für 1:1 Map Feedback)
   */
  visuals: QuizVisuals;
};

export function makeEmptySession(mode: QuizMode, targets: QuizTarget[]): QuizSession {
  return {
    mode,
    targets,
    phase: targets.length > 0 ? "running" : "done",
    index: 0,
    lastResult: null,
    correctCount: 0,
    wrongCount: 0,
    visuals: {
      flashId: null,
      flashColor: null,
      lockToId: null,
      lockedFills: {},
    },
  };
}
