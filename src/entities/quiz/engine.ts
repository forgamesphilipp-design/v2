// FILE: src/entities/quiz/engine.ts

import type { QuizMode, QuizTarget } from "./model";
import type { QuizSession, LockedFill } from "./session";
import { makeEmptySession } from "./session";

function normId(id: any) {
  return String(id ?? "").trim();
}

function currentTarget(session: QuizSession): QuizTarget | null {
  if (session.targets.length === 0) return null;
  if (session.index < 0 || session.index >= session.targets.length) return null;
  return session.targets[session.index] ?? null;
}

/**
 * Welche Geo-ID ist die "richtige Antwort" für den aktuellen Target?
 * Standard: letztes Element im path (z.B. ["1"] => "1")
 */
export function targetAnswerId(t: QuizTarget): string {
  const p = t?.path ?? [];
  if (p.length === 0) return "";
  return normId(p[p.length - 1]);
}

/**
 * Startet eine Session.
 * Engine bleibt UI-unabhängig.
 */
export function startSession(mode: QuizMode, targets: QuizTarget[]): QuizSession {
  return makeEmptySession(mode, targets);
}

/**
 * Nutzer hat ein Gebiet angeklickt.
 * -> setzt flash, lastResult, stats
 * -> wechselt in feedback-phase
 *
 * "1:1 Verhalten" (erst Feedback, dann Next)
 */
export function selectAnswer(session: QuizSession, pickedId: string): QuizSession {
  if (session.phase !== "running") return session;

  const t = currentTarget(session);
  if (!t) return { ...session, phase: "done" };

  const picked = normId(pickedId);
  const correct = normId(targetAnswerId(t));

  const isCorrect = picked !== "" && picked === correct;

  // lockedFills: wir markieren die korrekte Region (oder die angeklickte) mit Farben
  // v2-map unterstützt white/yellow/orange/red
  const lockedFills = { ...session.visuals.lockedFills };

  // Minimal, stabil:
  // - Correct: markiere korrektes Gebiet gelb
  // - Wrong: markiere falsch angeklicktes Gebiet rot (wenn id da ist)
  if (isCorrect) {
    lockedFills[correct] = "yellow";
  } else {
    if (picked) lockedFills[picked] = "red";
  }

  return {
    ...session,
    phase: "feedback",
    lastResult: isCorrect ? "correct" : "wrong",
    correctCount: session.correctCount + (isCorrect ? 1 : 0),
    wrongCount: session.wrongCount + (isCorrect ? 0 : 1),
    visuals: {
      ...session.visuals,
      flashId: isCorrect ? correct : picked || correct,
      flashColor: isCorrect ? "green" : "red",
      lockedFills,
    },
  };
}

/**
 * Nach Feedback -> nächster Target (oder done)
 */
export function next(session: QuizSession): QuizSession {
  if (session.phase !== "feedback") return session;

  const nextIndex = session.index + 1;
  const done = nextIndex >= session.targets.length;

  return {
    ...session,
    phase: done ? "done" : "running",
    index: done ? session.index : nextIndex,
    lastResult: null,
    visuals: {
      ...session.visuals,
      flashId: null,
      flashColor: null,
      lockToId: null,
    },
  };
}

/**
 * Restart: gleiche Targets nochmal von vorne.
 */
export function restart(session: QuizSession): QuizSession {
  return {
    ...session,
    phase: session.targets.length > 0 ? "running" : "done",
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

/**
 * Optional helper: gibt aktuellen Target zurück (für UI)
 */
export function getCurrentTarget(session: QuizSession): QuizTarget | null {
  return currentTarget(session);
}

/**
 * Optional helper: Für UI Text
 */
export function getProgress(session: QuizSession) {
  return {
    index: session.index,
    total: session.targets.length,
    human: session.targets.length > 0 ? `${session.index + 1}/${session.targets.length}` : "0/0",
  };
}
