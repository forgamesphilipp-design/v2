import { supabase } from "../../app/supabaseClient";

export async function uploadPhoto(file: File): Promise<string> {
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`;
  const path = `photos/${fileName}`;

  const { error } = await supabase.storage
    .from("moments")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("moments")
    .getPublicUrl(path);

  return data.publicUrl;
}
