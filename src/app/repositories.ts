// This file is (also) for SUPABASE, Moments Cloud storage
import { MomentsRepositoryMemory } from "../entities/moments/repositoryMemory";
import { createQuizRepositoryMemory } from "../entities/quiz/repositoryMemory";
import { createGeoRepositoryMemory } from "../entities/geo/repositoryMemory";

export const repositories = {
  moments: new MomentsRepositoryMemory(),
  quiz: createQuizRepositoryMemory(),
  geo: createGeoRepositoryMemory(),
};
