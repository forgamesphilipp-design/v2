// FILE: src/entities/profile/model.ts

export type Profile = {
  id: string; // uuid
  email: string | null;

  displayName: string | null;
  avatarUrl: string | null;

  onboardedAt: string | null;

  createdAt: string;
  updatedAt: string;
};
