import type { Exercise } from '@/interfaces';
import type { ExerciseEmbeddingIndex } from './build-exercise-embeddings';
import { embedTexts } from './embed-texts';

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a: number[]) => Math.sqrt(dot(a, a));
const cosine = (a: number[], b: number[]) => dot(a, b) / (norm(a) * norm(b) + 1e-8);

export interface ExerciseSearchHit { id: string; name: string; score: number }

export const searchExercise = async (
  query: string,
  exercises: Exercise[],
  index: ExerciseEmbeddingIndex,
  k = 3,
): Promise<ExerciseSearchHit[]> => {
  const [qv] = await embedTexts([query]);
  const scored = index.vectors.map((v, i) => ({ i, score: cosine(qv, v) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(({ i, score }) => ({ id: index.ids[i]!, name: index.names[i]!, score }));
};


