/**
 * Obtiene la frecuencia óptima de entrenamiento por categoría muscular
 */
export const getOptimalFrequency = (category: string): number => {
  const frequencies: Record<string, number> = {
    'Pecho': 2.5,      // 2-3 veces por semana
    'Espalda': 2.5,    // 2-3 veces por semana
    'Piernas': 2.0,    // 2 veces por semana (recuperación lenta)
    'Hombros': 3.0,    // 3 veces por semana (recuperación rápida)
    'Brazos': 3.0,     // 3 veces por semana (recuperación rápida)
    'Core': 3.5,       // 3-4 veces por semana (recuperación muy rápida)
  };

  return frequencies[category] || 2.5; // Default 2.5 veces por semana
};
