// FILE: src/app/repositories.ts

// Composition root for repositories
// Switch implementations ONLY here

import { MomentsRepositoryCloud } from "../entities/moments/repositoryCloud";
import { createQuizRepositoryMemory } from "../entities/quiz/repositoryMemory";
import { createGeoRepositoryMemory } from "../entities/geo/repositoryMemory";
import { ProfileRepositoryCloud } from "../entities/profile/repositoryCloud";

export const repositories = {
  // ✅ Cloud is now the source of truth
  moments: new MomentsRepositoryCloud(),
  profile: new ProfileRepositoryCloud(),

  quiz: createQuizRepositoryMemory(),
  geo: createGeoRepositoryMemory(),
};
