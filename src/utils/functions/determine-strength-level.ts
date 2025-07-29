import { STRENGTH_STANDARDS } from './strength-standards';

/**
 * Determina el nivel de fuerza basado en el 1RM estimado y la categoría
 */
export const determineStrengthLevel = (estimatedOneRM: number, category: string): 'beginner' | 'intermediate' | 'advanced' => {
  const standards = STRENGTH_STANDARDS[category];

  if (!standards) {
    // Fallback para categorías sin estándares
    if (estimatedOneRM >= 80) return 'advanced';
    if (estimatedOneRM >= 50) return 'intermediate';
    return 'beginner';
  }

  // Usar los estándares específicos de la categoría
  if (estimatedOneRM >= standards.advanced) return 'advanced';
  if (estimatedOneRM >= standards.intermediate) return 'intermediate';
  return 'beginner';
};
