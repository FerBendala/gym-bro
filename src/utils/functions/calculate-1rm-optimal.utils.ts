import { calculate1RMBrzycki, calculate1RMEpley } from "./index";

/**
 * Calcula el 1RM usando el método más apropiado según las repeticiones
 * - 1-5 reps: Epley
 * - 6+ reps: Brzycki (más preciso para altas repeticiones)
 */
export const calculateOptimal1RM = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;

  // Para repeticiones bajas, usar Epley
  if (reps <= 5) {
    return calculate1RMEpley(weight, reps);
  }

  // Para repeticiones altas, usar Brzycki
  return calculate1RMBrzycki(weight, reps);
};