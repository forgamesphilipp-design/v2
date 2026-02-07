import type { MomentsRepository, CreateMomentInput } from "./repository";
import type { Moment } from "./model";
import { supabase } from "../../app/supabaseClient";

export class MomentsRepositoryCloud implements MomentsRepository {
  async list(): Promise<Moment[]> {
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .order("taken_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(this.mapRow);
  }

  async get(id: string): Promise<Moment | null> {
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return this.mapRow(data);
  }

  async create(input: CreateMomentInput): Promise<Moment> {
    const { data, error } = await supabase
      .from("moments")
      .insert({
        title: input.title,
        taken_at: input.takenAt,
        lon: input.position.lon,
        lat: input.position.lat,
        accuracy_m: input.accuracyM,
        photo_url: input.photoUrl,
        admin: input.admin,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async remove(id: string): Promise<void> {
    await supabase.from("moments").delete().eq("id", id);
  }

  async clearAll(): Promise<void> {
    await supabase.from("moments").delete().neq("id", "");
  }

  private mapRow(row: any): Moment {
    return {
      id: row.id,
      title: row.title,
      takenAt: row.taken_at,
      position: { lon: row.lon, lat: row.lat },
      accuracyM: row.accuracy_m,
      photoUrl: row.photo_url,
      admin: row.admin,
    };
  }
}
