// Composition root for repositories
// Switch implementations ONLY here

import { MomentsRepositoryCloud } from "../entities/moments/repositoryCloud";
import { createQuizRepositoryMemory } from "../entities/quiz/repositoryMemory";
import { createGeoRepositoryMemory } from "../entities/geo/repositoryMemory";

export const repositories = {
  // ✅ Cloud is now the source of truth
  moments: new MomentsRepositoryCloud(),
  quiz: createQuizRepositoryMemory(),
  geo: createGeoRepositoryMemory(),
};
