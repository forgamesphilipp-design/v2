// FILE: src/entities/profile/mappers.ts

import type { Profile } from "./model";

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapProfileRow(row: ProfileRow): Profile {
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
