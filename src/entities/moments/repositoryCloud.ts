import type { MomentsRepository, CreateMomentInput } from "./repository";
import type { Moment } from "./model";
import { supabase } from "../../app/supabaseClient";

export class MomentsRepositoryCloud implements MomentsRepository {
  async list(): Promise<Moment[]> {
    const { data, error } = await supabase.from("moments").select("*").order("taken_at", { ascending: false });
    if (error) throw error;

    const rows = data ?? [];
    const out = await Promise.all(rows.map((r) => this.mapRowAsync(r)));
    return out;
  }

  async get(id: string): Promise<Moment | null> {
    const { data, error } = await supabase.from("moments").select("*").eq("id", id).single();
    if (error) return null;
    return await this.mapRowAsync(data);
  }

  async create(input: CreateMomentInput): Promise<Moment> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const uid = userRes.user?.id;
    if (!uid) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("moments")
      .insert({
        user_id: uid,
        title: input.title,
        taken_at: input.takenAt,
        lon: input.position.lon,
        lat: input.position.lat,
        accuracy_m: input.accuracyM,
        // in DB: storage path
        photo_url: input.photoUrl,
        admin: input.admin,
      })
      .select()
      .single();

    if (error) throw error;
    return await this.mapRowAsync(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("moments").delete().eq("id", id);
    if (error) throw error;
  }

  async clearAll(): Promise<void> {
    const { error } = await supabase.from("moments").delete().neq("id", "");
    if (error) throw error;
  }

  private async signedUrlForPath(path: string | null | undefined): Promise<string> {
    const p = String(path ?? "").trim();
    if (!p) return "";

    const { data, error } = await supabase.storage.from("moments").createSignedUrl(p, 60 * 60); // 1h
    if (error) return "";
    return data?.signedUrl ?? "";
  }

  private async mapRowAsync(row: any): Promise<Moment> {
    const signed = await this.signedUrlForPath(row.photo_url);

    return {
      id: row.id,
      title: row.title,
      takenAt: row.taken_at,
      position: { lon: row.lon, lat: row.lat },
      accuracyM: row.accuracy_m,
      // UI: signed URL (aus DB storage path)
      photoUrl: signed,
      admin: row.admin,
    };
  }
}
