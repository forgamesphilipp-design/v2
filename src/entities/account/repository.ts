// src/entities/account/repository.ts

export interface AccountRepository {
  /**
   * Hard deletes the currently authenticated account.
   * Backend should delete:
   * - Auth user
   * - profiles row
   * - moments rows
   * - storage objects under users/<uid>/photos/*
   */
  deleteMyAccount(): Promise<void>;
}
