// FILE: src/shared/supabase/errors.ts

export function prettySupabaseError(e: any): string {
  const msg = String(e?.message ?? e ?? "Unknown error");

  // common RLS hint
  if (msg.toLowerCase().includes("row level security")) {
    return "Zugriff verweigert (RLS). Bist du eingeloggt und gehört der Datensatz dir?";
  }

  return msg;
}

export function toError(e: any, fallback = "Fehler"): Error {
  const msg = prettySupabaseError(e);
  return new Error(msg || fallback);
}
