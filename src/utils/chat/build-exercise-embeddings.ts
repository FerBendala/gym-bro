import type { Exercise } from '@/interfaces';
import { embedTexts } from './embed-texts';

export interface ExerciseEmbeddingIndex {
  ids: string[];
  names: string[];
  vectors: number[][];
}

export const buildExerciseEmbeddings = async (exercises: Exercise[]): Promise<ExerciseEmbeddingIndex> => {
  const texts = exercises.map((e) => {
    const alias = (e as unknown as { aliases?: string[] }).aliases?.join(' ') ?? '';
    const desc = e.description ?? '';
    return `${e.name} ${alias} ${desc}`.trim();
  });
  const vectors = await embedTexts(texts);
  return {
    ids: exercises.map((e) => e.id),
    names: exercises.map((e) => e.name),
    vectors,
  };
};


