import type { Exercise } from '@/interfaces';

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const STOP_WORDS = new Set(['de', 'la', 'el', 'los', 'las', 'en', 'del', 'al', 'con', 'para', 'por', 'un', 'una', 'unos', 'unas', 'y', 'o', 'u']);
const singularize = (t: string): string => (t.endsWith('s') && t.length > 3 ? t.slice(0, -1) : t);
const tokenize = (s: string): string[] => normalize(s)
  .split(/[^a-z0-9]+/)
  .filter(Boolean)
  .map(singularize)
  .filter(t => !STOP_WORDS.has(t));

const jaccard = (a: string[], b: string[]): number => {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = [...setA].filter(x => setB.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni === 0 ? 0 : inter / uni;
};

export interface ExerciseSuggestion { id: string; name: string; score: number }

export const findExerciseWithSuggestions = (text: string, exercises: Exercise[]): { exercise: Exercise | null; suggestions: ExerciseSuggestion[] } => {
  const q = normalize(text);

  // Fuzzy por nombre/descripcion/id del ejercicio (todo viene de Firebase)
  const qTokens = tokenize(text);
  const scored = exercises
    .map((e) => {
      const nameNorm = normalize(e.name ?? '');
      const idNorm = normalize(e.id ?? '');
      const descNorm = normalize((e as any).description ?? '');
      const nameScore = jaccard(qTokens, tokenize(nameNorm));
      const idScore = jaccard(qTokens, tokenize(idNorm));
      const descScore = jaccard(qTokens, tokenize(descNorm));
      const substringBoost = qTokens.filter(t => nameNorm.includes(t) || idNorm.includes(t)).length >= 2 ? 0.3 : 0;
      return { e, score: Math.max(nameScore, idScore, descScore) + substringBoost };
    })
    .filter(x => x.score > 0.05)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    const top = scored[0]!.e;
    const suggestions = scored.slice(0, 3).map(s => ({ id: s.e.id, name: s.e.name, score: Number(s.score.toFixed(2)) }));
    return { exercise: top, suggestions };
  }
  return { exercise: null, suggestions: [] };
};

export const parseExercise = (text: string, exercises: Exercise[]): Exercise | null => {
  return findExerciseWithSuggestions(text, exercises).exercise;
};


