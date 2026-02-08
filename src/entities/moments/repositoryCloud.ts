// FILE: src/entities/moments/repositoryCloud.ts

import type { MomentsRepository, CreateMomentInput } from "./repository";
import type { Moment } from "./model";
import { supabase } from "../../app/supabaseClient";
import { toError } from "../../shared/supabase/errors";
import { safeSignedUrl } from "../../shared/supabase/storage";
import { mapMomentRow, type MomentsRow } from "./mappers";

export class MomentsRepositoryCloud implements MomentsRepository {
  async list(): Promise<Moment[]> {
    const { data, error } = await supabase.from("moments").select("*").order("taken_at", { ascending: false });
    if (error) throw toError(error);

    const rows = (data ?? []) as MomentsRow[];

    const out = await Promise.all(
      rows.map(async (r) => {
        const signed = await safeSignedUrl("moments", r.photo_url, 60 * 60);
        return mapMomentRow(r, signed);
      })
    );

    return out;
  }

  async get(id: string): Promise<Moment | null> {
    const { data, error } = await supabase.from("moments").select("*").eq("id", id).single();
    if (error || !data) return null;

    const row = data as MomentsRow;
    const signed = await safeSignedUrl("moments", row.photo_url, 60 * 60);
    return mapMomentRow(row, signed);
  }

  async create(input: CreateMomentInput): Promise<Moment> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw toError(userErr);

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
        // DB: storage path
        photo_url: input.photoUrl,
        admin: input.admin,
      })
      .select()
      .single();

    if (error) throw toError(error);

    const row = data as MomentsRow;
    const signed = await safeSignedUrl("moments", row.photo_url, 60 * 60);
    return mapMomentRow(row, signed);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("moments").delete().eq("id", id);
    if (error) throw toError(error);
  }

  async clearAll(): Promise<void> {
    // NOTE: stays as-is (dev helper). In multi-user scenarios, you'd typically scope to user_id.
    const { error } = await supabase.from("moments").delete().neq("id", "");
    if (error) throw toError(error);
  }
}
