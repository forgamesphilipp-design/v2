// FILE: src/app/repositories.ts

// Composition root for repositories.
// Switch implementations ONLY here.

import { MomentsRepositoryCloud } from "../entities/moments/repositoryCloud";
import { ProfileRepositoryCloud } from "../entities/profile/repositoryCloud";
import { createQuizRepositoryMemory } from "../entities/quiz/repositoryMemory";
import { createGeoRepositoryMemory } from "../entities/geo/repositoryMemory";

export const repositories = {
  // Cloud (source of truth)
  moments: new MomentsRepositoryCloud(),
  profile: new ProfileRepositoryCloud(),

  // Memory (demo / later replace)
  quiz: createQuizRepositoryMemory(),
  geo: createGeoRepositoryMemory(),
};
