import { useNavigate } from "react-router-dom";
import Button from "../../shared/ui/Button";
import { supabase } from "../../app/supabaseClient";
import { useAuth } from "./useAuth";

export default function AuthStatus() {
  const nav = useNavigate();
  const auth = useAuth();

  if (auth.loading) {
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

  async function logout() {
    await supabase.auth.signOut();
    nav("/auth", { replace: true });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 800 }}>
        {auth.user.email ?? "eingeloggt"}
      </div>
      <Button
        onClick={() => void logout()}
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
