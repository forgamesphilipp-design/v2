// FILE: src/shared/supabase/storage.ts

import { supabase } from "../../app/supabaseClient";

/**
 * Returns "" if path is empty or signed-url creation fails.
 * Keep UI resilient (no hard crash on missing storage access).
 */
export async function safeSignedUrl(
  bucket: string,
  path: string | null | undefined,
  expiresInSeconds = 60 * 60
): Promise<string> {
  const p = String(path ?? "").trim();
  if (!p) return "";

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(p, expiresInSeconds);
  if (error) return "";

  return data?.signedUrl ?? "";
}
