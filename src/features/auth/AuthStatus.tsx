import { useNavigate } from "react-router-dom";
import Button from "../../shared/ui/Button";
import { supabase } from "../../app/supabaseClient";
import { useAuth } from "./useAuth";

function clearSupabaseStorage() {
  try {
    // remove only supabase-related keys
    for (const k of Object.keys(localStorage)) {
      if (k.toLowerCase().includes("supabase")) localStorage.removeItem(k);
    }
    for (const k of Object.keys(sessionStorage)) {
      if (k.toLowerCase().includes("supabase")) sessionStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}

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

  async function logout() {
    // 1) Supabase session kill (global = safest)
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // ignore
    }

    // 2) Ensure local tokens/state are gone
    clearSupabaseStorage();

    // 3) Reset your context quickly (optional but nice)
    try {
      await auth.hardReset();
    } catch {
      // ignore
    }

    // 4) Hard navigate so router + auth re-init is clean
    window.location.href = "/auth";
  }

  const baseName = auth.profile?.displayName?.trim() || auth.user.email || "eingeloggt";
  const name = auth.profileLoading ? `${baseName} …` : baseName;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 800 }}>{name}</div>
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
