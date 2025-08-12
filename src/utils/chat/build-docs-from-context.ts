import { buildCategoryMetricsDocs } from './build-category-metrics-docs';
import { getCentralizedMetrics } from './get-centralized-metrics';
import type { UserContext } from './user-context';

export const buildDocsFromContext = (ctx: UserContext): string[] => {
  const lines: string[] = [];
  lines.push(`Resumen: entrenos totales ${ctx.summary.workouts}; último entreno ${ctx.summary.lastWorkout ?? 'N/A'}`);
  lines.push(`Predicciones: ${ctx.predictionsText}`);
  const central = getCentralizedMetrics(ctx.records, ctx.exercises);
  lines.push(`Centralizado: fuerza ${central.strengthTrend.toFixed(2)}, volumen(normalizado) ${central.volumeTrend.toFixed(2)}%, crecimiento mensual ${central.monthlyGrowth.toFixed(2)}%`);
  // Añadir métricas por categoría derivadas
  lines.push(...buildCategoryMetricsDocs(ctx.records));
  for (const rec of ctx.records.slice(0, 200)) {
    lines.push(`Entreno: ${rec.date.toISOString().slice(0, 10)} ejercicio ${rec.exercise?.name ?? rec.exerciseId} peso ${rec.weight} reps ${rec.reps} sets ${rec.sets}`);
  }
  return lines;
};


