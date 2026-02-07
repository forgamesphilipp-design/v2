// FILE: src/entities/profile/repository.ts

import type { Profile } from "./model";

export type UpdateProfileInput = {
  displayName?: string | null;
  avatarUrl?: string | null;
  onboardedAt?: string | null;
};

export interface ProfileRepository {
  getMyProfile(): Promise<Profile | null>;
  updateMyProfile(input: UpdateProfileInput): Promise<Profile>;
}
