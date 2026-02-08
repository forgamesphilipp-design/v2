// FILE: src/features/quiz/QuizScreen.tsx

import { useEffect, useState } from "react";
import AppLayout from "../../app/AppLayout";
import { Card } from "../../shared/ui";
import { repositories } from "../../app/repositories";
import type { QuizMode } from "../../entities/quiz/model";

export default function QuizScreen() {
  const [modes, setModes] = useState<QuizMode[]>([]);

  useEffect(() => {
    repositories.quiz.listModes().then(setModes).catch(() => setModes([]));
  }, []);

  return (
    <AppLayout title="Quiz" subtitle="Domain-Test (später Engine/UI)" backTo="/">
      <Card>
        <div style={{ fontWeight: 900 }}>Quiz Modi (Demo)</div>
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
          Nur Strukturtest: Repository → UI. Später ersetzen wir das durch echte Modus-Auswahl.
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {modes.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Keine Modi.</div>
          ) : (
            modes.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                <div style={{ fontWeight: 900 }}>{m.title}</div>
                <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 13 }}>
                  {m.description}
                </div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                  modeId: <b>{m.id}</b>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </AppLayout>
  );
}
