import { getAllAssignments } from '@/api/services/exercise-assignment-service';
import { calculateImprovement, getBaseline1RM, getCurrentWeight } from '@/utils/functions/workout-utils';
import { format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { calcCategoryVolume } from './calc-category-volume';
import { getCentralizedMetrics } from './get-centralized-metrics';
import { parseCategory } from './parse-category';
import { findExerciseWithSuggestions } from './parse-exercise';
import { parseRelativeDay } from './parse-relative-day';
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

  async centralizedMetrics(): Promise<ToolResult> {
    const ctx = await getUserContext();
    const m = getCentralizedMetrics(ctx.records, ctx.exercises);
    const content = [
      `Tendencia fuerza: ${m.strengthTrend.toFixed(2)}%`,
      `Tendencia volumen (normalizada): ${m.volumeTrend.toFixed(2)}%`,
      `Crecimiento mensual: ${m.monthlyGrowth.toFixed(2)}%`,
      `PR estimado: ${m.prWeight.toFixed(1)}kg (confianza ${m.prConfidence.toFixed(0)}%)`,
      `Riesgo de meseta: ${m.plateauRisk.toFixed(0)}%`,
      `Tiempo a próximo PR: ${m.timeToNextPR.toFixed(1)} semanas`,
      `Análisis: ${m.trendAnalysis}`,
    ].join(' · ');
    return { ok: true, content };
  },

  async historyRange(args: Record<string, unknown>): Promise<ToolResult> {
    const q = String(args.query ?? '');
    const ctx = await getUserContext();
    const rel = parseRelativeDay(q);
    const range = parseTimeRange(q);
    const start = rel?.start ?? range?.start ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 28);
    const end = rel?.end ?? range?.end ?? new Date();
    const filtered = ctx.records
      .filter(r => isWithinInterval(new Date(r.date), { start, end }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filtered.length === 0) return { ok: true, content: 'No hay entrenamientos en el rango.' };
    const lines = filtered.slice(0, 20).map(r => {
      const d = format(new Date(r.date), 'dd MMM', { locale: es });
      const name = r.exercise?.name ?? r.exerciseId;
      const vol = (r.weight * r.reps * r.sets).toFixed(0);
      return `${d} · ${name} · ${r.weight}kg x ${r.reps} x ${r.sets} (vol ${vol})`;
    });
    return { ok: true, content: lines.join('\n') };
  },

  async assignments(): Promise<ToolResult> {
    try {
      const [ctx, assignments] = await Promise.all([getUserContext(), getAllAssignments()]);
      if (!assignments || assignments.length === 0) return { ok: true, content: 'No hay asignaciones configuradas.' };
      const byDay: Record<string, string[]> = {};
      for (const a of assignments) {
        const ex = ctx.exercises.find(e => e.id === a.exerciseId);
        const day = String(a.dayOfWeek);
        if (!byDay[day]) byDay[day] = [];
        byDay[day]!.push(ex?.name ?? a.exerciseId);
      }
      const order = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      const lines = order
        .filter(d => byDay[d]?.length)
        .map(d => `${d}: ${byDay[d]!.join(', ')}`);
      return { ok: true, content: lines.join('\n') };
    } catch (e) {
      return { ok: false, content: 'No pude obtener asignaciones.' };
    }
  },
  async exerciseMaxWeight(args: Record<string, unknown>): Promise<ToolResult> {
    const q = String(args.query ?? '');
    const ctx = await getUserContext();
    const { exercise: ex, suggestions } = findExerciseWithSuggestions(q, ctx.exercises);
    if (!ex) {
      if (suggestions?.length) {
        const s = suggestions.map(x => x.name).join(', ');
        return { ok: false, content: `No identifiqué el ejercicio. ¿Te refieres a: ${s}?` };
      }
      return { ok: false, content: 'No identifiqué el ejercicio.' };
    }
    const exRecords = ctx.records.filter(r => r.exerciseId === ex.id);
    if (exRecords.length === 0) return { ok: true, content: `Sin registros para ${ex.name}.` };
    const max = Math.max(...exRecords.map(r => r.weight));
    const last = exRecords.sort((a, b) => +new Date(b.date) - +new Date(a.date))[0]!;
    return { ok: true, content: `${ex.name}: máximo registrado ${max.toFixed(1)}kg. Último: ${last.weight}kg x ${last.reps} x ${last.sets}.` };
  },
  async dayExercises(args: Record<string, unknown>): Promise<ToolResult> {
    const q = String(args.query ?? '');
    const ctx = await getUserContext();
    const rel = parseRelativeDay(q);
    if (!rel) return { ok: false, content: 'No entendí el día (hoy/ayer/mañana).' };
    const list = ctx.records
      .filter(r => isWithinInterval(new Date(r.date), { start: rel.start, end: rel.end }))
      .map(r => r.exercise?.name ?? r.exerciseId);
    if (list.length === 0) return { ok: true, content: `No hay entrenamientos ${rel.label}.` };
    const unique = Array.from(new Set(list));
    return { ok: true, content: `${rel.label}: ${unique.join(', ')}.` };
  },
  async exerciseVolume(args: Record<string, unknown>): Promise<ToolResult> {
    const q = String(args.query ?? '');
    const ctx = await getUserContext();
    const range = parseTimeRange(q);
    const start = range?.start ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 28);
    const end = range?.end ?? new Date();
    const { exercise: ex, suggestions } = findExerciseWithSuggestions(q, ctx.exercises);
    if (!ex) {
      if (suggestions?.length) {
        const s = suggestions.map(x => x.name).join(', ');
        return { ok: false, content: `No identifiqué el ejercicio. ¿Te refieres a: ${s}?` };
      }
      return { ok: false, content: 'No identifiqué el ejercicio.' };
    }
    const filtered = ctx.records.filter(r => r.exerciseId === ex.id && isWithinInterval(new Date(r.date), { start, end }));
    const totalVolume = filtered.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    return { ok: true, content: `Volumen de ${ex.name} (${range?.label ?? 'últimas 4 semanas'}): ${totalVolume.toFixed(0)} en ${filtered.length} sesiones.` };
  },
};


