// FILE: src/features/quiz/useQuizSession.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { repositories } from "../../app/repositories";
import type { QuizMode, QuizTarget } from "../../entities/quiz/model";

type LockedFill = Record<string, "white" | "yellow" | "orange" | "red">;

// ✅ NEW: "ready" = targets geladen, aber noch nicht gestartet (Prestart-Modal)
type Phase = "idle" | "loading" | "ready" | "playing" | "done";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function colorForCorrect(attemptsOnCurrent: number): "white" | "yellow" | "orange" | "red" {
  if (attemptsOnCurrent <= 0) return "white";
  if (attemptsOnCurrent === 1) return "yellow";
  if (attemptsOnCurrent === 2) return "orange";
  return "red";
}

function formatMs(ms: number) {
  const totalS = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useQuizSession() {
  const [modes, setModes] = useState<QuizMode[]>([]);
  const [mode, setMode] = useState<QuizMode | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [targets, setTargets] = useState<QuizTarget[]>([]);
  const [index, setIndex] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);

  const [flashId, setFlashId] = useState<string | null>(null);
  const [flashColor, setFlashColor] = useState<"red" | "green" | "blue" | null>(null);
  const [lockedFills, setLockedFills] = useState<LockedFill>({});

  const [hintOn, setHintOn] = useState(false);

  // existing timeout for flash etc.
  const timerRef = useRef<number | null>(null);

  // ✅ NEW: quiz stopwatch
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const stopwatchRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const stopStopwatch = useCallback(() => {
    if (stopwatchRef.current) window.clearInterval(stopwatchRef.current);
    stopwatchRef.current = null;

    if (startedAtRef.current != null) {
      setElapsedMs(Date.now() - startedAtRef.current);
    }
    startedAtRef.current = null;
  }, []);

  const startStopwatch = useCallback(() => {
    startedAtRef.current = Date.now();
    setElapsedMs(0);

    if (stopwatchRef.current) window.clearInterval(stopwatchRef.current);

    stopwatchRef.current = window.setInterval(() => {
      const start = startedAtRef.current;
      if (start == null) return;
      setElapsedMs(Date.now() - start);
    }, 250);
  }, []);

  useEffect(() => {
    repositories.quiz
      .listModes()
      .then((ms) => setModes(ms))
      .catch(() => setModes([]));
  }, []);

  const current = useMemo(() => targets[index] ?? null, [targets, index]);
  const total = targets.length;

  const progressLabel = useMemo(() => {
    if (!total) return "0/0";
    return `${Math.min(index + 1, total)}/${total}`;
  }, [index, total]);

  const timeLabel = useMemo(() => formatMs(elapsedMs), [elapsedMs]);

  const lockToId = useMemo(() => {
    if (!hintOn) return null;
    return current?.path?.[0] ?? null;
  }, [hintOn, current]);

  // Hint pulse stays as-is
  useEffect(() => {
    if (!hintOn) return;
    if (!lockToId) return;

    let alive = true;

    const pulse = () => {
      if (!alive) return;
      setFlashId(lockToId);
      setFlashColor("blue");

      window.setTimeout(() => {
        if (!alive) return;
        setFlashId(null);
        setFlashColor(null);
      }, 450);
    };

    pulse();
    const interval = window.setInterval(pulse, 900);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [hintOn, lockToId]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopStopwatch();
    };
  }, [clearTimer, stopStopwatch]);

  // ✅ Start mode loads everything, then goes to "ready" (Prestart modal)
  const startMode = useCallback(
    async (m: QuizMode) => {
      clearTimer();
      stopStopwatch();

      setPhase("loading");
      setMode(m);

      setTargets([]);
      setIndex(0);
      setCorrectCount(0);
      setAttemptsOnCurrent(0);
      setFlashId(null);
      setFlashColor(null);
      setLockedFills({});
      setHintOn(false);
      setElapsedMs(0);
      startedAtRef.current = null;

      try {
        const ts = await repositories.quiz.loadTargets(m.id);
        const shuffled = shuffle(ts);
        setTargets(shuffled);

        // ✅ show prestart modal (ready) if there are targets
        setPhase(shuffled.length ? "ready" : "done");
      } catch {
        setTargets([]);
        setPhase("done");
      }
    },
    [clearTimer, stopStopwatch]
  );

  // ✅ NEW: begin quiz (Start button)
  const begin = useCallback(() => {
    if (!mode) return;
    if (!targets.length) return;
    if (phase !== "ready") return;

    startStopwatch();
    setPhase("playing");
  }, [mode, targets.length, phase, startStopwatch]);

  const restart = useCallback(() => {
    if (!mode) return;
    // ✅ restart should also show prestart modal again (consistent UX)
    void startMode(mode);
  }, [mode, startMode]);

  const backToModes = useCallback(() => {
    clearTimer();
    stopStopwatch();

    setMode(null);
    setPhase("idle");
    setTargets([]);
    setIndex(0);
    setCorrectCount(0);
    setAttemptsOnCurrent(0);
    setFlashId(null);
    setFlashColor(null);
    setLockedFills({});
    setHintOn(false);
    setElapsedMs(0);
    startedAtRef.current = null;
  }, [clearTimer, stopStopwatch]);

  const answer = useCallback(
    (clickedId: string) => {
      if (phase !== "playing") return;
      if (!current) return;

      const correctId = String(current.path?.[0] ?? "");
      if (!correctId) return;

      if (lockedFills[clickedId]) return;

      clearTimer();

      if (clickedId === correctId) {
      
        // ✅ Farb-Logik
        const fill = colorForCorrect(attemptsOnCurrent);
        setLockedFills((prev) => ({ ...prev, [correctId]: fill }));
      
        // ✅ Score nur bei erstem Versuch
        if (attemptsOnCurrent === 0) setCorrectCount((c) => c + 1);
      
        // reset für nächste Frage
        setAttemptsOnCurrent(0);
        setHintOn(false);
      
        // ✅ NEXT: index sofort hochsetzen -> "Wo ist ...?" updated sofort
        const nextIndex = index + 1;
      
        if (nextIndex >= targets.length) {
          stopStopwatch();
          clearTimer();
        
          // optional: flash sofort weg (damit modal clean ist)
          setFlashId(null);
          setFlashColor(null);
        
          setPhase("done");
          return;
        }
      
        // ✅ sonst: direkt zur nächsten Frage wechseln
        setIndex(nextIndex);
      
        // Flash nach kurzem Moment entfernen (Feedback bleibt fühlbar)
        timerRef.current = window.setTimeout(() => {
          setFlashId(null);
          setFlashColor(null);
        }, 420);
      
        return;
      }      

      setFlashId(clickedId);
      setFlashColor("red");

      setAttemptsOnCurrent((prev) => {
        const next = prev + 1;
        if (next >= 3) setHintOn(true);
        return next;
      });

      if (hintOn) {
        setLockedFills((prev) => (prev[clickedId] ? prev : { ...prev, [clickedId]: "red" }));
      }

      timerRef.current = window.setTimeout(() => {
        setFlashId(null);
        setFlashColor(null);
      }, 520);
    },
    [phase, current, targets.length, lockedFills, clearTimer, attemptsOnCurrent, hintOn, stopStopwatch]
  );

  const toggleHint = useCallback(() => setHintOn((v) => !v), []);

  return {
    // mode selection
    modes,
    mode,
    startMode,
    backToModes,

    // session
    phase,
    targets,
    current,
    index,
    total,
    progressLabel,
    correctCount,
    attemptsOnCurrent,

    // time
    elapsedMs,
    timeLabel,

    // map wiring
    flashId,
    flashColor,
    lockedFills,
    lockToId,

    // actions
    begin,        // ✅ NEW
    answer,
    restart,
    hintOn,
    toggleHint,
  };
}
