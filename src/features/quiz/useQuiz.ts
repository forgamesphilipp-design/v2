// FILE: src/features/quiz/useQuiz.ts

import { useEffect, useMemo, useState } from "react";
import { repositories } from "../../app/repositories";
import type { QuizMode, QuizTarget } from "../../entities/quiz/model";
import { applyPick, createInitialSession, nextQuestion, restartSession, type QuizSession } from "./quizEngine";

export function useQuiz() {
  const [modes, setModes] = useState<QuizMode[]>([]);
  const [modesLoading, setModesLoading] = useState(false);

  const [mode, setMode] = useState<QuizMode | null>(null);
  const [targets, setTargets] = useState<QuizTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  const [session, setSession] = useState<QuizSession | null>(null);

  // load modes once
  useEffect(() => {
    let cancelled = false;
    setModesLoading(true);
    repositories.quiz
      .listModes()
      .then((ms) => {
        if (!cancelled) setModes(ms);
      })
      .catch(() => {
        if (!cancelled) setModes([]);
      })
      .finally(() => {
        if (!cancelled) setModesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function selectMode(modeId: string) {
    const m = await repositories.quiz.getMode(modeId);
    if (!m) return;

    setMode(m);
    setTargets([]);
    setTargetsLoading(true);

    try {
        const ts = await repositories.quiz.loadTargets(m.id);

        // ✅ simple shuffle (session-level)
        const shuffled = ts.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        setTargets(shuffled);
        setSession(createInitialSession(m));        
    } catch (e) {
      setTargets([]);
      setSession(createInitialSession(m));
    } finally {
      setTargetsLoading(false);
    }
  }

  const currentTarget = useMemo(() => {
    if (!session) return null;
    return targets[session.index] ?? null;
  }, [targets, session]);

  const progressText = useMemo(() => {
    if (!session) return "0/0";
    const total = targets.length;
    const cur = Math.min(total, session.index + 1);
    return `${cur}/${total}`;
  }, [session, targets.length]);

  function backToModes() {
    setMode(null);
    setTargets([]);
    setSession(null);
  }

  function doRestart() {
    if (!mode) return;
    setSession(restartSession(mode));
  }

  function pickOnMap(pickedId: string) {
    if (!session || !currentTarget) return;
    setSession((prev) => (prev ? applyPick(prev, currentTarget, pickedId) : prev));
  }

  function goNext() {
    if (!session) return;
    setSession((prev) => (prev ? nextQuestion(prev, targets) : prev));
  }

  return {
    modes,
    modesLoading,

    mode,
    targetsLoading,
    targets,

    session,
    currentTarget,
    progressText,

    selectMode,
    backToModes,
    doRestart,
    pickOnMap,
    goNext,
  };
}
