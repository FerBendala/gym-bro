import type { WorkoutRecord } from '@/interfaces';

/**
 * Utilidades específicas para el ExerciseCard
 * Centraliza cálculos y transformaciones de datos
 */
export const exerciseCardUtils = {
  /**
   * Calcula estadísticas del último entrenamiento
   */
  calculateLastWorkoutStats(records: WorkoutRecord[]) {
    if (!records || records.length === 0) {
      return null;
    }

    const expandedSeries = this.expandWorkoutSeries(records);

    return {
      totalVolume: expandedSeries.reduce((sum, series) => sum + series.volume, 0),
      totalSets: expandedSeries.length,
      averageWeight: expandedSeries.reduce((sum, series) => sum + series.weight, 0) / expandedSeries.length,
      maxWeight: Math.max(...expandedSeries.map(series => series.weight)),
      date: records[0]?.date
    };
  },

  /**
   * Expande las series de entrenamiento para mostrar cada una individualmente
   */
  expandWorkoutSeries(records: WorkoutRecord[]) {
    const expandedSeries: Array<{
      weight: number;
      reps: number;
      volume: number;
      recordIndex: number;
      setIndex: number;
    }> = [];

    records.forEach((record, recordIndex) => {
      if (record.individualSets && record.individualSets.length > 0) {
        // Modo avanzado: cada serie individual
        record.individualSets.forEach((set, setIndex) => {
          expandedSeries.push({
            weight: set.weight,
            reps: set.reps,
            volume: set.weight * set.reps,
            recordIndex,
            setIndex
          });
        });
      } else {
        // Modo tradicional: múltiples series iguales
        for (let i = 0; i < record.sets; i++) {
          expandedSeries.push({
            weight: record.weight,
            reps: record.reps,
            volume: record.weight * record.reps,
            recordIndex,
            setIndex: i
          });
        }
      }
    });

    return expandedSeries;
  },

  /**
   * Obtiene el último registro y series del último día de entrenamiento
   */
  getLastWorkoutData(exerciseId: string, workoutRecords: WorkoutRecord[], exerciseObj?: any) {
    if (!exerciseId || !workoutRecords) {
      return { lastRecord: null, lastWorkoutSeries: [] };
    }

    // Filtrar por exerciseId y ordenar por fecha descendente
    const filtered = workoutRecords
      .filter(r => r.exerciseId === exerciseId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (filtered.length === 0) {
      return { lastRecord: null, lastWorkoutSeries: [] };
    }

    // Obtener el último registro para compatibilidad
    let lastRecord = filtered[0];
    if (lastRecord && exerciseObj) {
      lastRecord = { ...lastRecord, exercise: exerciseObj };
    }

    // Obtener todas las series del último día de entrenamiento
    const lastWorkoutDate = filtered[0].date;
    const lastWorkoutDateString = lastWorkoutDate.toDateString();

    const lastDaySeries = filtered
      .filter(r => r.date.toDateString() === lastWorkoutDateString)
      .map(r => exerciseObj ? { ...r, exercise: exerciseObj } : r)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return { lastRecord, lastWorkoutSeries: lastDaySeries };
  },

  /**
   * Calcula estadísticas en tiempo real para el formulario
   */
  calculateFormStats(weight: number, reps: number, sets: number) {
    const totalReps = reps * sets;
    const totalVolume = weight * totalReps;

    return {
      totalReps,
      totalVolume,
      sets
    };
  },

  /**
   * Calcula estadísticas para series individuales
   */
  calculateAdvancedFormStats(sets: Array<{ weight: number; reps: number }>) {
    const totalSets = sets.length;
    const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
    const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

    return {
      totalSets,
      totalReps,
      totalVolume
    };
  }
}; 