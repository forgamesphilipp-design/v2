// FILE: src/features/quiz/QuizScreen.tsx

import AppLayout from "../../app/AppLayout";
import { Button, Card, Modal } from "../../shared/ui";
import HierarchySvg from "../explore/HierarchySvg";
import { useQuizSession } from "./useQuizSession";

export default function QuizScreen() {
  const q = useQuizSession();

  const title =
    q.phase === "playing"
      ? "Quiz"
      : q.phase === "done"
      ? "Quiz"
      : "Quiz";

  const subtitle =
    q.phase === "playing"
      ? "Tippe den richtigen Kanton an."
      : q.phase === "done"
      ? "Resultat"
      : "Wähle einen Modus.";

  return (
    <AppLayout title={title} subtitle={subtitle} backTo="/">
      <div style={{ display: "grid", gap: 12 }}>
        {/* MODE PICKER */}
        {q.phase === "idle" && (
          <Card>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Modus wählen</div>
            <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13, lineHeight: 1.4 }}>
              Starte eine Quiz-Session.
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {q.modes.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Keine Modi verfügbar.</div>
              ) : (
                q.modes.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => void q.startMode(m)}
                    style={{
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      padding: 14,
                      display: "grid",
                      gap: 6,
                      cursor: "pointer",
                      transition: "background 120ms ease, border-color 120ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-soft)";
                      e.currentTarget.style.borderColor = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--bg)";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    <div style={{ fontWeight: 950, fontSize: 16 }}>{m.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>
                      {m.description}
                    </div>
                  </div>
                ))                
              )}
            </div>
          </Card>
        )}

        {/* LOADING */}
        {q.phase === "loading" && (
          <Card>
            <div style={{ fontWeight: 900 }}>Lade…</div>
            <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
              Targets werden vorbereitet.
            </div>
          </Card>
        )}

        {/* PLAYING HUD */}
        {q.phase === "playing" && q.current && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 950, fontSize: 16 }}>
                  Wo ist <span style={{ color: "var(--accent)" }}>{q.current.name}</span>?
                </div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                  Fortschritt: <b>{q.progressLabel}</b> · Richtig: <b>{q.correctCount}</b>
                  {q.attemptsOnCurrent > 0 ? (
                    <>
                      {" "}
                      · Versuche: <b>{q.attemptsOnCurrent}</b>
                    </>
                  ) : null}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>

                <Button onClick={q.restart}>Neu starten</Button>

                <Button onClick={q.backToModes} style={{ background: "var(--bg)" }}>
                  Modus wechseln
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* MAP (country view for cantons quiz) */}
        {(q.phase === "playing" || q.phase === "done") && q.mode && (
          <HierarchySvg
            scopeId={q.mode.startScopeId}     // "ch"
            parentId={null}
            level={"country"}
            onSelectNode={(id) => q.answer(String(id))}
            flashId={q.flashId}
            flashColor={q.flashColor}
            lockToId={q.lockToId}
            lockedFills={q.lockedFills}
          />
        )}

      {/* DONE */}
      <Modal
        open={q.phase === "done"}
        title="Resultat"
        onClose={q.backToModes}
      >
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Resultat: <b>{q.correctCount}</b> richtig von <b>{q.total}</b>.
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {q.mode && (
            <Button variant="primary" onClick={q.restart}>
              Nochmal spielen
            </Button>
          )}
          <Button onClick={q.backToModes}>Modus wählen</Button>
        </div>
      </Modal>

      </div>
    </AppLayout>
  );
}
