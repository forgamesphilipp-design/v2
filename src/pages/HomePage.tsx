// FILE: src/pages/HomePage.tsx
// Adds a Settings button (top right area) without changing your overall layout.
// Replace entire file.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Modal } from "../shared/ui";

export default function HomePage() {
  const nav = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 12 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>SwissOrient</div>
              <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                Lerne und entdecke die Schweiz.
              </div>
            </div>

            <Button onClick={() => nav("/settings")}>Settings</Button>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <Button variant="primary" onClick={() => nav("/quiz")}>
              Quiz
            </Button>
            <Button onClick={() => nav("/explore")}>Explore</Button>
            <Button onClick={() => nav("/learn")}>Learn</Button>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setInfoOpen(true)}>Info</Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal open={infoOpen} title="Info" onClose={() => setInfoOpen(false)}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Was wir gerade bauen</div>
          <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
            Die App befindet sich aktuell in einer sehr frühen Entwicklungsphase. Im Moment arbeiten wir an den Kernfunktionen wie dem Quiz, um die Grundlagen zu schaffen. Sobald diese stabil sind, werden wir weitere Funktionen hinzufügen und die App kontinuierlich verbessern.
          </div>
        </div>
      </Modal>
    </div>
  );
}
