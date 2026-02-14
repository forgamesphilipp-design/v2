// FILE: src/features/quiz/quizEngine.ts

import type { QuizMode, QuizTarget } from "../../entities/quiz/model";

export type LockedFill = Record<string, "white" | "yellow" | "orange" | "red">;
export type FlashColor = "red" | "green" | "blue" | null;

export type QuizPhase = "running" | "feedback" | "done";

export type QuizVisuals = {
  flashId: string | null;
  flashColor: FlashColor;
  lockToId: string | null;
  lockedFills: LockedFill;
};

export type QuizSession = {
  modeId: string;
  phase: QuizPhase;

  index: number; // current question index
  correctCount: number;
  wrongCount: number;

  lastResult: "correct" | "wrong" | null;

  // per-target locked fills across this session
  visuals: QuizVisuals;
};

function answerIdOf(t: QuizTarget | null): string {
  if (!t?.path?.length) return "";
  return String(t.path[t.path.length - 1] ?? "");
}

export function createInitialSession(mode: QuizMode): QuizSession {
  return {
    modeId: mode.id,
    phase: "running",
    index: 0,
    correctCount: 0,
    wrongCount: 0,
    lastResult: null,
    visuals: {
      flashId: null,
      flashColor: null,
      lockToId: null,
      lockedFills: {},
    },
  };
}

/**
 * User picks a map node.
 * - phase: running -> feedback
 * - correct: flash green on correctId + lockTo correctId + persist correctId as yellow
 * - wrong: flash red on pickedId + lockTo correctId + persist pickedId as red
 */
export function applyPick(session: QuizSession, target: QuizTarget, pickedId: string): QuizSession {
  if (session.phase !== "running") return session;

  const correctId = answerIdOf(target);
  const picked = String(pickedId ?? "").trim();

  if (!correctId || !picked) return session;

  const isCorrect = picked === correctId;

  const nextLocked: LockedFill = { ...(session.visuals.lockedFills ?? {}) };

  if (isCorrect) {
    // correct becomes "yellow" (learned)
    nextLocked[correctId] = "yellow";
  } else {
    // wrong pick becomes "red" (mistake marker)
    nextLocked[picked] = "red";

    // also keep correct as yellow if it was already learned before;
    // otherwise don't auto-mark it (so it still feels like a reveal)
    // (we still lockTo correct in feedback so user sees it)
  }

  return {
    ...session,
    phase: "feedback",
    lastResult: isCorrect ? "correct" : "wrong",
    correctCount: session.correctCount + (isCorrect ? 1 : 0),
    wrongCount: session.wrongCount + (!isCorrect ? 1 : 0),
    visuals: {
      flashId: isCorrect ? correctId : picked,
      flashColor: isCorrect ? "green" : "red",
      lockToId: correctId, // reveal/focus the correct region in feedback
      lockedFills: nextLocked,
    },
  };
}

/**
 * Next question:
 * - clears flash
 * - clears lockTo
 * - keeps lockedFills (session memory)
 * - moves index
 */
export function nextQuestion(session: QuizSession, targets: QuizTarget[]): QuizSession {
  if (session.phase !== "feedback") return session;

  const nextIndex = session.index + 1;
  const done = nextIndex >= (targets?.length ?? 0);

  if (done) {
    return {
      ...session,
      phase: "done",
      index: session.index, // keep last
      visuals: {
        ...session.visuals,
        flashId: null,
        flashColor: null,
        lockToId: null,
      },
    };
  }

  return {
    ...session,
    phase: "running",
    index: nextIndex,
    lastResult: null,
    visuals: {
      ...session.visuals,
      flashId: null,
      flashColor: null,
      lockToId: null,
    },
  };
}

export function restartSession(mode: QuizMode): QuizSession {
  return createInitialSession(mode);
}
