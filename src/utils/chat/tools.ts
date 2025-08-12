import { calculateImprovement, getBaseline1RM, getCurrentWeight } from '@/utils/functions/workout-utils';
import { calcCategoryVolume } from './calc-category-volume';
import { parseCategory } from './parse-category';
import { findExerciseWithSuggestions } from './parse-exercise';
import { parseTimeRange } from './parse-time-range';
import type { ToolResult } from './tool-types';
import { getUserContext } from './user-context';

export const tools = {
  async categoryVolume(args: Record<string, unknown>): Promise<ToolResult> {
    const q = String(args.query ?? '');
    const ctx = await getUserContext();
    const range = parseTimeRange(q);
    const category = parseCategory(q);
    if (!range || !category) return { ok: false, content: 'Faltan rango o categoría' };
    const res = calcCategoryVolume(ctx.records, category, range.start, range.end);
    return { ok: true, content: `Volumen en ${category} (${range.label}): ${res.totalVolume.toFixed(0)}. Sesiones: ${res.workouts}.` };
  },

  async exerciseProjection(args: Record<string, unknown>): Promise<ToolResult> {
    const q = String(args.query ?? '');
    const ctx = await getUserContext();
    let { exercise: ex, suggestions } = findExerciseWithSuggestions(q, ctx.exercises);
    if (!ex) {
      // Heurística extra para "press de pierna(s)"
      const n = q.toLowerCase();
      if (n.includes('press') && (n.includes('pierna') || n.includes('piernas') || n.includes('leg'))) {
        const candidates = ctx.exercises.filter(e => (e.name?.toLowerCase().includes('press') && (e.name?.toLowerCase().includes('pierna') || e.name?.toLowerCase().includes('piernas') || e.name?.toLowerCase().includes('leg'))) || (e.id?.toLowerCase().includes('leg') && e.id?.toLowerCase().includes('press')));
        if (candidates.length > 0) {
          // Elegir por mayor frecuencia en registros
          const freq: Record<string, number> = {};
          for (const r of ctx.records) freq[r.exerciseId] = (freq[r.exerciseId] ?? 0) + 1;
          candidates.sort((a, b) => (freq[b.id] ?? 0) - (freq[a.id] ?? 0));
          ex = candidates[0]!;
        }
      }
    }
    if (!ex) {
      if (suggestions.length > 0) {
        const s = suggestions.map(x => `${x.name} (${x.id})`).join(', ');
        return { ok: false, content: `No identifiqué el ejercicio. ¿Te refieres a: ${s}?` };
      }
      return { ok: false, content: 'No identifiqué el ejercicio.' };
    }
    const exRecords = ctx.records.filter(r => r.exerciseId === ex.id);
    const baseline = getBaseline1RM(exRecords);
    const current = getCurrentWeight(exRecords, 30);
    const improvement = calculateImprovement(current, baseline);
    const trendBoost = Math.max(-2, Math.min(5, improvement / 10));
    const projected = Math.max(current, current * (1 + trendBoost / 100));
    return { ok: true, content: `Proyección (2 semanas) para ${ex.name || ex.id}: actual ~${current.toFixed(1)}kg, objetivo ~${projected.toFixed(1)}kg.` };
  },
};


