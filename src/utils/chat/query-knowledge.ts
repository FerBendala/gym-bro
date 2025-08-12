import type { KnowledgeBase } from './build-knowledge-base';
import { embedTexts } from './embed-texts';

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a: number[]) => Math.sqrt(dot(a, a));
const cosine = (a: number[], b: number[]) => dot(a, b) / (norm(a) * norm(b) + 1e-8);

export const queryKnowledge = async (kb: KnowledgeBase, query: string, k = 5): Promise<string[]> => {
  const [qv] = await embedTexts([query]);
  const scored = kb.vectors.map((v, i) => ({ i, s: cosine(qv, v) }));
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, k);
  // Re-ranking simple por longitud y diversidad semántica básica
  const reranked = top
    .map(({ i, s }) => {
      const text = kb.docs[i];
      const lengthBonus = Math.min(0.1, text.length / 2000);
      return { i, score: s + lengthBonus };
    })
    .sort((a, b) => b.score - a.score);
  return reranked.map(({ i }) => kb.docs[i]);
};


