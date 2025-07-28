import type { WorkoutRecord } from '../../interfaces';

/**
 * Calcula las rachas de entrenamientos
 */
export const calculateWorkoutStreaks = (records: WorkoutRecord[]): { current: number; longest: number; average: number } => {
  if (records.length === 0) {
    return { current: 0, longest: 0, average: 0 };
  }

  // Ordenar registros por fecha
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Obtener fechas únicas de entrenamiento
  const uniqueDates = [...new Set(sortedRecords.map(r => new Date(r.date).toDateString()))];
  const workoutDates = uniqueDates.map(date => new Date(date));

  // Calcular rachas
  const streaks: number[] = [];
  let currentStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < workoutDates.length; i++) {
    const daysDiff = Math.floor((workoutDates[i].getTime() - workoutDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Día consecutivo
      currentStreak++;
    } else {
      // Se rompió la racha
      streaks.push(currentStreak);
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  // Añadir la última racha
  streaks.push(currentStreak);
  longestStreak = Math.max(longestStreak, currentStreak);

  // Calcular racha actual (días desde último entrenamiento)
  const lastWorkoutDate = workoutDates[workoutDates.length - 1];
  const daysSinceLastWorkout = Math.floor((new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentActiveStreak = daysSinceLastWorkout === 0 ? currentStreak : 0;

  // Calcular promedio de rachas
  const averageStreak = streaks.length > 0 ? Math.round(streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length) : 0;

  return {
    current: currentActiveStreak,
    longest: longestStreak,
    average: averageStreak
  };
}; 