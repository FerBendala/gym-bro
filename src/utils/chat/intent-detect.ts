export type ChatIntent =
  | 'trend-overview'
  | 'normalized-volume-trend'
  | 'pr-prediction'
  | 'category-volume'
  | 'category-volume-range'
  | 'recommendations'
  | 'recent-workout'
  | 'exercises-list'
  | 'projection-request'
  | 'projection-exercise'
  | 'general';

export const detectIntent = (question: string): ChatIntent => {
  const q = question.toLowerCase();
  if (q.includes('tendencia') && (q.includes('fuerza') || q.includes('volumen'))) return 'trend-overview';
  if (q.includes('normaliz') && q.includes('volumen')) return 'normalized-volume-trend';
  if (q.includes('pr') || q.includes('récord')) return 'pr-prediction';
  if (q.includes('categor') || q.includes('grupo')) return 'category-volume';
  if ((q.includes('semanas') || q.includes('últim') || q.includes('ultima') || q.includes('últimas')) && q.includes('categor')) return 'category-volume-range';
  if (q.includes('recomend')) return 'recommendations';
  if (q.includes('últim') && (q.includes('entreno') || q.includes('entrenamiento'))) return 'recent-workout';
  if (q.includes('ejercicio') && (q.includes('hago') || q.includes('listar') || q.includes('lista'))) return 'exercises-list';
  // Priorizar detección con ejercicio explícito antes que genérica
  if ((q.includes('proyecc') || q.includes('plan') || q.includes('programa')) && (q.includes('press') || q.includes('banca') || q.includes('sentadilla') || q.includes('peso muerto') || q.includes('militar'))) return 'projection-exercise';
  if (q.includes('proyecc') || q.includes('plan') || q.includes('programa')) return 'projection-request';
  return 'general';
};


