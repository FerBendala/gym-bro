import type { WorkoutRecord } from '@/interfaces';
import { getMaxWeight } from './workout-utils';

/**
 * Calcula las métricas de rendimiento para una categoría
 */
export const calculateCategoryPerformanceMetrics = (categoryRecords: WorkoutRecord[]) => {
  if (categoryRecords.length === 0) {
    return {
      bestSession: { date: new Date(), volume: 0, maxWeight: 0 },
      averageSessionVolume: 0,
      volumePerWorkout: 0,
      sessionsAboveAverage: 0
    };
  }

  // Agrupar por sesión (por fecha)
  const sessionMap: Record<string, WorkoutRecord[]> = {};
  categoryRecords.forEach(record => {
    const dateKey = new Date(record.date).toDateString();
    if (!sessionMap[dateKey]) sessionMap[dateKey] = [];
    sessionMap[dateKey].push(record);
  });

  const sessions = Object.entries(sessionMap).map(([dateStr, records]) => ({
    date: new Date(dateStr),
    volume: records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    maxWeight: getMaxWeight(records)
  }));

  const bestSession = sessions.reduce((best, session) =>
    session.volume > best.volume ? session : best
  );

  const averageSessionVolume = sessions.reduce((sum, s) => sum + s.volume, 0) / sessions.length;
  const volumePerWorkout = averageSessionVolume;
  const sessionsAboveAverage = sessions.filter(s => s.volume > averageSessionVolume).length;

  return {
    bestSession,
    averageSessionVolume: Math.round(averageSessionVolume),
    volumePerWorkout: Math.round(volumePerWorkout),
    sessionsAboveAverage
  };
}; 