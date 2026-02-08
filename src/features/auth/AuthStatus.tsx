// FILE: src/features/auth/AuthStatus.tsx

import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { useAuth } from "./useAuth";

export default function AuthStatus() {
  const nav = useNavigate();
  const auth = useAuth();

  if (auth.sessionLoading) {
    return (
      <div style={{ fontSize: 12, opacity: 0.9, display: "flex", alignItems: "center", gap: 10 }}>
        Lade…
      </div>
    );
  }

  if (!auth.user) {
    return (
      <Button
        onClick={() => nav("/auth")}
        style={{
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.22)",
          color: "#fff",
        }}
      >
        Login
      </Button>
    );
  }

  async function onLogout() {
    await auth.logout();
    nav("/auth", { replace: true });
  }

  const baseName = auth.profile?.displayName?.trim() || auth.user.email || "eingeloggt";
  const name = auth.profileLoading ? `${baseName} …` : baseName;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 800 }}>{name}</div>
      <Button
        onClick={() => void onLogout()}
        style={{
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.22)",
          color: "#fff",
        }}
      >
        Logout
      </Button>
    </div>
  );
}
