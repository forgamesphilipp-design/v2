import { supabase } from "../../app/supabaseClient";

function extFromType(type: string) {
  const t = String(type || "").toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  return "jpg";
}

function makeId() {
  const anyCrypto = globalThis.crypto as any;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Uploadt in PRIVATE bucket und gibt den STORAGE-PFAD zurück:
 *   users/<uid>/photos/<id>.<ext>
 * Dieser Pfad wird in DB gespeichert (moments.photo_url).
 */
export async function uploadPhoto(file: File): Promise<string> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const uid = userRes.user?.id;
  if (!uid) throw new Error("Not authenticated");

  const id = makeId();
  const ext = extFromType(file.type);
  const path = `users/${uid}/photos/${id}.${ext}`;

  const { error } = await supabase.storage.from("moments").upload(path, file, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });

  if (error) throw error;

  return path;
}
