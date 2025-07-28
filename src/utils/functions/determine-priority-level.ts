import { getStrengthLevelLabel } from './antagonist-analysis';

/**
 * Determina el nivel de prioridad para un grupo muscular
 * Enfocado principalmente en el balance de volumen, con factores secundarios
 */
export const determinePriorityLevel = (
  deviation: number,
  weeklyFrequency: number,
  progressTrend: 'improving' | 'stable' | 'declining',
  isBalanced: boolean
): 'low' | 'medium' | 'high' | 'critical' => {
  // Si está balanceado, prioridad máxima es 'medium' (solo por factores secundarios)
  if (isBalanced) {
    if (weeklyFrequency < 1) return 'medium'; // Frecuencia muy baja
    if (progressTrend === 'declining') return 'medium'; // Tendencia negativa
    return 'low'; // Bien balanceado y sin problemas
  }

  // Si no está balanceado, prioridad basada en desviación
  if (Math.abs(deviation) > 15) return 'critical';
  if (Math.abs(deviation) > 10) return 'high';
  if (Math.abs(deviation) > 5) return 'medium';

  // Casos edge: frecuencia muy baja o tendencia muy negativa
  if (weeklyFrequency < 1) return 'critical';
  if (progressTrend === 'declining' && Math.abs(deviation) > 3) return 'high';

  return 'low';
};

/**
 * Determina la etapa de desarrollo para un grupo muscular
 * Actualizada para usar los nuevos estándares de fuerza
 */
export const determineDevelopmentStage = (
  strengthIndex: number,
  weeklyFrequency: number,
  volume: number
): 'beginner' | 'intermediate' | 'advanced' | 'neglected' => {
  // Si no hay volumen o frecuencia muy baja, está descuidado
  if (volume === 0 || weeklyFrequency < 0.5) return 'neglected';

  // Usar la nueva función de etiquetas de nivel
  const strengthLevel = getStrengthLevelLabel(strengthIndex);

  // Mapear a los tipos esperados por la interfaz
  switch (strengthLevel) {
    case 'elite':
    case 'avanzado':
      return 'advanced';
    case 'intermedio':
      return 'intermediate';
    default:
      return 'beginner';
  }
}; 