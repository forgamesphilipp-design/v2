// FILE: src/entities/profile/repositoryCloud.ts

import { supabase } from "../../app/supabaseClient";
import type { ProfileRepository, UpdateProfileInput } from "./repository";
import type { Profile } from "./model";
import { toError } from "../../shared/supabase/errors";
import { mapProfileRow, type ProfileRow } from "./mappers";

export class ProfileRepositoryCloud implements ProfileRepository {
  async getMyProfile(): Promise<Profile | null> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw toError(userErr);

    const uid = userRes.user?.id;
    if (!uid) return null;

    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) throw toError(error);
    if (!data) return null;

    return mapProfileRow(data as ProfileRow);
  }

  async updateMyProfile(input: UpdateProfileInput): Promise<Profile> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw toError(userErr);

    const uid = userRes.user?.id;
    if (!uid) throw new Error("Not authenticated");

    const patch: any = {};
    if ("displayName" in input) patch.display_name = input.displayName ?? null;
    if ("avatarUrl" in input) patch.avatar_url = input.avatarUrl ?? null;
    if ("onboardedAt" in input) patch.onboarded_at = input.onboardedAt ?? null;

    const { data, error } = await supabase.from("profiles").update(patch).eq("id", uid).select("*").single();
    if (error) throw toError(error);

    return mapProfileRow(data as ProfileRow);
  }
}
