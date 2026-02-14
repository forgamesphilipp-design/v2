// FILE: src/features/quiz/useQuizSession.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { repositories } from "../../app/repositories";
import type { QuizMode, QuizTarget } from "../../entities/quiz/model";

type LockedFill = Record<string, "white" | "yellow" | "orange" | "red">;

type Phase = "idle" | "loading" | "playing" | "done";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function colorForCorrect(attemptsOnCurrent: number): "white" | "yellow" | "orange" | "red" {
  // attemptsOnCurrent zählt Fehlversuche (weil du es nur bei wrong erhöhst)
  if (attemptsOnCurrent <= 0) return "white"; // 1. Versuch richtig
  if (attemptsOnCurrent === 1) return "yellow"; // 2. Versuch richtig
  if (attemptsOnCurrent === 2) return "orange"; // 3. Versuch richtig
  return "red"; // nach Hinweis
}

export function useQuizSession() {
  const [modes, setModes] = useState<QuizMode[]>([]);
  const [mode, setMode] = useState<QuizMode | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [targets, setTargets] = useState<QuizTarget[]>([]);
  const [index, setIndex] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);

  // UI helpers for map feedback
  const [flashId, setFlashId] = useState<string | null>(null);
  const [flashColor, setFlashColor] = useState<"red" | "green" | "blue" | null>(null);
  const [lockedFills, setLockedFills] = useState<LockedFill>({});

  // Hint: restrict clicks to the correct id (makes everything else grey)
  const [hintOn, setHintOn] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Load modes once
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

  const lockToId = useMemo(() => {
    if (!hintOn) return null;
    return current?.path?.[0] ?? null;
  }, [hintOn, current]);

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
      }, 450); // <-- ON-Dauer (größer = weniger hektisch)
    };
  
    pulse(); // ✅ sofort starten (kein "wartet 1s")
  
    const interval = window.setInterval(pulse, 900); // <-- Puls-Abstand
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [hintOn, lockToId]);
  
  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startMode = useCallback(
    async (m: QuizMode) => {
      clearTimer();
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

      try {
        const ts = await repositories.quiz.loadTargets(m.id);
        const shuffled = shuffle(ts);
        setTargets(shuffled);
        setPhase(shuffled.length ? "playing" : "done");
      } catch {
        setTargets([]);
        setPhase("done");
      }
    },
    [clearTimer]
  );

  const restart = useCallback(() => {
    if (!mode) return;
    void startMode(mode);
  }, [mode, startMode]);

  const backToModes = useCallback(
    () => {
      clearTimer();
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
    },
    [clearTimer]
  );

  const answer = useCallback(
    (clickedId: string) => {
      if (phase !== "playing") return;
      if (!current) return;

      const correctId = String(current.path?.[0] ?? "");
      if (!correctId) return;

      // ignore already locked shapes (white/yellow/orange/red)
      if (lockedFills[clickedId]) return;

      clearTimer();

      if (clickedId === correctId) {

        // ✅ Farb-Logik: 1. richtig=weiß (zählt), 2.=gelb, 3.=orange
        const fill = colorForCorrect(attemptsOnCurrent);
        setLockedFills((prev) => ({ ...prev, [correctId]: fill }));

        // ✅ Score nur bei erstem Versuch (also 0 Fehlversuche)
        if (attemptsOnCurrent === 0) {
          setCorrectCount((c) => c + 1);
        }

        // reset für nächste Frage
        setAttemptsOnCurrent(0);
        setHintOn(false);

        timerRef.current = window.setTimeout(() => {
          setFlashId(null);
          setFlashColor(null);

          setIndex((i) => {
            const next = i + 1;
            if (next >= targets.length) {
              setPhase("done");
              return i; // keep index stable on finish
            }
            return next;
          });
        } );
        return;
      }

      // ❌ wrong (kurzer Flash)
      setFlashId(clickedId);
      setFlashColor("red");

      // ✅ attempts erhöhen + ab 3 automatisch Hinweis an
      setAttemptsOnCurrent((prev) => {
        const next = prev + 1;
        if (next >= 3) setHintOn(true);
        return next;
      });

      // ✅ wenn Hinweis aktiv ist: falsche Klicks permanent rot locken
      // (damit man weiter klicken kann, aber nicht endlos auf die gleichen Flächen)
      if (hintOn) {
        setLockedFills((prev) => (prev[clickedId] ? prev : { ...prev, [clickedId]: "red" }));
      }

      timerRef.current = window.setTimeout(() => {
        setFlashId(null);
        setFlashColor(null);
      }, 520);
    },
    [phase, current, targets.length, lockedFills, clearTimer, attemptsOnCurrent, hintOn]
  );

  const toggleHint = useCallback(() => {
    setHintOn((v) => !v);
  }, []);

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

    // map wiring
    flashId,
    flashColor,
    lockedFills,
    lockToId,

    // actions
    answer,
    restart,
    hintOn,
    toggleHint,
  };
}
