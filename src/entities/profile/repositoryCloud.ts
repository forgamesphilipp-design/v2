// FILE: src/entities/profile/repositoryCloud.ts

import { supabase } from "../../app/supabaseClient";
import type { Profile } from "./model";
import type { ProfileRepository, UpdateProfileInput } from "./repository";

function mapRow(row: any): Profile {
  return {
    id: row.id,
    email: row.email ?? null,
    displayName: row.display_name ?? null,
    avatarUrl: row.avatar_url ?? null,
    onboardedAt: row.onboarded_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ProfileRepositoryCloud implements ProfileRepository {
  async getMyProfile(): Promise<Profile | null> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const uid = userRes.user?.id;
    if (!uid) return null;

    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return mapRow(data);
  }

  async updateMyProfile(input: UpdateProfileInput): Promise<Profile> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const uid = userRes.user?.id;
    if (!uid) throw new Error("Not authenticated");

    const patch: any = {};
    if ("displayName" in input) patch.display_name = input.displayName ?? null;
    if ("avatarUrl" in input) patch.avatar_url = input.avatarUrl ?? null;
    if ("onboardedAt" in input) patch.onboarded_at = input.onboardedAt ?? null;

    const { data, error } = await supabase.from("profiles").update(patch).eq("id", uid).select("*").single();
    if (error) throw error;

    return mapRow(data);
  }
}
