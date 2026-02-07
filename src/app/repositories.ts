// This file is (also) for SUPABASE, Moments Cloud storage
import { createMomentsRepositoryMemory } from "../entities/moments/repositoryMemory";
import { createQuizRepositoryMemory } from "../entities/quiz/repositoryMemory";

export const repositories = {
  moments: createMomentsRepositoryMemory(),
  quiz: createQuizRepositoryMemory(),
};
