
/**
 * Calcula 1RM usando la fórmula de Brzycki
 * Más precisa para repeticiones bajas (1-10)
 */
export const calculate1RMBrzycki = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;
  return weight / (1.0278 - 0.0278 * reps);
};

/**
 * Calcula 1RM usando la fórmula de Epley
 * Más precisa para repeticiones altas (10+)
 */
export const calculate1RMEpley = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
};

/**
 * Calcula 1RM usando la fórmula óptima basada en el número de repeticiones
 * Usa Epley para reps altas y Brzycki para reps bajas
 */
export const calculateOptimal1RM = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;

  // Usar Epley para repeticiones altas (más de 10)
  if (reps > 10) {
    return calculate1RMEpley(weight, reps);
  }

  // Usar Brzycki para repeticiones bajas (1-10)
  return calculate1RMBrzycki(weight, reps);
};

/**
 * Calcula 1RM estimado para estadísticas
 * Alias para calculateOptimal1RM para mantener compatibilidad
 */
export const calculateEstimated1RM = (weight: number, reps: number): number => {
  return calculateOptimal1RM(weight, reps);
};

/**
 * Calcula 1RM estimado para estadísticas (alias)
 * Mantiene compatibilidad con código existente
 */
export const calculateEstimated1RMStats = (weight: number, reps: number): number => {
  return calculateOptimal1RM(weight, reps);
}; 