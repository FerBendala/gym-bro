import * as XLSX from 'xlsx';

import type { ExportData } from './export-interfaces';

/**
 * Exporta los datos en formato JSON
 */
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Convierte un objeto a formato CSV
 */
export const objectToCSV = (data: Record<string, unknown>[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Exporta los datos en formato CSV (múltiples hojas como archivos separados)
 */
export const exportToCSV = (data: ExportData): Record<string, string> => {
  // 1. Días de entrenamiento
  const trainingDaysFlat = data.trainingDays.flatMap(day =>
    day.exercises.map(exercise => ({
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayName,
      totalWorkouts: day.totalWorkouts,
      totalVolume: day.totalVolume,
      exerciseName: exercise.exerciseName,
      categories: exercise.categories.join('; '),
      exerciseTotalVolume: exercise.totalVolume,
      exerciseWorkoutCount: exercise.workoutCount,
      exerciseAverageWeight: exercise.averageWeight,
      exerciseMaxWeight: exercise.maxWeight,
      exerciseLastWorkout: exercise.lastWorkout,
    }))
  );

  // 2. Evolución de ejercicios
  const exercisesEvolutionFlat = data.exercisesEvolution.flatMap(exercise =>
    exercise.sessions.map(session => ({
      exerciseName: exercise.exerciseName,
      categories: exercise.categories.join('; '),
      totalVolume: exercise.totalVolume,
      totalWorkouts: exercise.totalWorkouts,
      sessionDate: session.date,
      sessionWeight: session.weight,
      sessionReps: session.reps,
      sessionSets: session.sets,
      sessionVolume: session.volume,
      sessionEstimated1RM: session.estimated1RM,
      sessionWeekNumber: session.weekNumber,
      evolutionFirstWeight: exercise.evolution.firstWeight,
      evolutionLastWeight: exercise.evolution.lastWeight,
      evolutionMaxWeight: exercise.evolution.maxWeight,
      evolutionProgressPercentage: exercise.evolution.progressPercentage,
      evolutionAverageWeight: exercise.evolution.averageWeight,
    }))
  );

  // 3. Análisis de grupos musculares
  const muscleGroupComparison = data.muscleGroupAnalysis.comparison.map(comp => ({
    group: comp.group,
    targetPercentage: comp.targetPercentage,
    actualPercentage: comp.actualPercentage,
    difference: comp.difference,
    status: comp.status,
  }));

  const muscleGroupRecommendations = data.muscleGroupAnalysis.recommendations.map(rec => ({
    group: rec.group,
    message: rec.message,
    priority: rec.priority,
  }));

  // 4. Balance de rendimiento
  const performanceBalanceOverall = [{
    totalVolume: data.performanceBalance.overall.totalVolume,
    totalWorkouts: data.performanceBalance.overall.totalWorkouts,
    averageVolumePerWorkout: data.performanceBalance.overall.averageVolumePerWorkout,
    consistencyScore: data.performanceBalance.overall.consistencyScore,
    strengthProgress: data.performanceBalance.overall.strengthProgress,
    volumeProgress: data.performanceBalance.overall.volumeProgress,
  }];

  const performanceBalanceScore = [{
    score: data.performanceBalance.balanceScore.score,
    level: data.performanceBalance.balanceScore.level,
    description: data.performanceBalance.balanceScore.description,
    recommendations: data.performanceBalance.balanceScore.recommendations.join('; '),
  }];

  const topImprovements = data.performanceBalance.strengthMetrics.topImprovements.map(improvement => ({
    exerciseName: improvement.exerciseName,
    progressPercentage: improvement.progressPercentage,
    weightGain: improvement.weightGain,
  }));

  const volumeDistribution = data.performanceBalance.volumeMetrics.volumeDistribution.map(dist => ({
    category: dist.category,
    volume: dist.volume,
    percentage: dist.percentage,
  }));

  return {
    'metadata.csv': objectToCSV([data.metadata] as unknown as Record<string, unknown>[]),
    'training_days.csv': objectToCSV(trainingDaysFlat as unknown as Record<string, unknown>[]),
    'exercises_evolution.csv': objectToCSV(exercisesEvolutionFlat as unknown as Record<string, unknown>[]),
    'muscle_group_comparison.csv': objectToCSV(muscleGroupComparison as unknown as Record<string, unknown>[]),
    'muscle_group_recommendations.csv': objectToCSV(muscleGroupRecommendations as unknown as Record<string, unknown>[]),
    'performance_balance_overall.csv': objectToCSV(performanceBalanceOverall as unknown as Record<string, unknown>[]),
    'performance_balance_score.csv': objectToCSV(performanceBalanceScore as unknown as Record<string, unknown>[]),
    'top_improvements.csv': objectToCSV(topImprovements as unknown as Record<string, unknown>[]),
    'volume_distribution.csv': objectToCSV(volumeDistribution as unknown as Record<string, unknown>[]),
  };
};

/**
 * Exporta los datos en formato Excel
 */
export const exportToExcel = (data: ExportData): ArrayBuffer => {
  const workbook = XLSX.utils.book_new();

  // Hoja de metadata
  const metadataWS = XLSX.utils.json_to_sheet([data.metadata]);
  XLSX.utils.book_append_sheet(workbook, metadataWS, 'Metadata');

  // 1. Hoja de días de entrenamiento
  const trainingDaysFlat = data.trainingDays.flatMap(day =>
    day.exercises.map(exercise => ({
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayName,
      totalWorkouts: day.totalWorkouts,
      totalVolume: day.totalVolume,
      exerciseName: exercise.exerciseName,
      categories: exercise.categories.join('; '),
      exerciseTotalVolume: exercise.totalVolume,
      exerciseWorkoutCount: exercise.workoutCount,
      exerciseAverageWeight: exercise.averageWeight,
      exerciseMaxWeight: exercise.maxWeight,
      exerciseLastWorkout: exercise.lastWorkout,
    }))
  );
  const trainingDaysWS = XLSX.utils.json_to_sheet(trainingDaysFlat);
  XLSX.utils.book_append_sheet(workbook, trainingDaysWS, 'Días de Entrenamiento');

  // 2. Hoja de evolución de ejercicios
  const exercisesEvolutionFlat = data.exercisesEvolution.flatMap(exercise =>
    exercise.sessions.map(session => ({
      exerciseName: exercise.exerciseName,
      categories: exercise.categories.join('; '),
      totalVolume: exercise.totalVolume,
      totalWorkouts: exercise.totalWorkouts,
      sessionDate: session.date,
      sessionWeight: session.weight,
      sessionReps: session.reps,
      sessionSets: session.sets,
      sessionVolume: session.volume,
      sessionEstimated1RM: session.estimated1RM,
      sessionWeekNumber: session.weekNumber,
      evolutionFirstWeight: exercise.evolution.firstWeight,
      evolutionLastWeight: exercise.evolution.lastWeight,
      evolutionMaxWeight: exercise.evolution.maxWeight,
      evolutionProgressPercentage: exercise.evolution.progressPercentage,
      evolutionAverageWeight: exercise.evolution.averageWeight,
    }))
  );
  const exercisesEvolutionWS = XLSX.utils.json_to_sheet(exercisesEvolutionFlat);
  XLSX.utils.book_append_sheet(workbook, exercisesEvolutionWS, 'Evolución de Ejercicios');

  // 3. Hoja de análisis de grupos musculares
  const muscleGroupComparisonWS = XLSX.utils.json_to_sheet(data.muscleGroupAnalysis.comparison);
  XLSX.utils.book_append_sheet(workbook, muscleGroupComparisonWS, 'Comparación Grupos Musculares');

  const muscleGroupRecommendationsWS = XLSX.utils.json_to_sheet(data.muscleGroupAnalysis.recommendations);
  XLSX.utils.book_append_sheet(workbook, muscleGroupRecommendationsWS, 'Recomendaciones Grupos');

  // 4. Hoja de balance de rendimiento
  const performanceBalanceOverallWS = XLSX.utils.json_to_sheet([data.performanceBalance.overall]);
  XLSX.utils.book_append_sheet(workbook, performanceBalanceOverallWS, 'Balance General');

  const performanceBalanceScoreWS = XLSX.utils.json_to_sheet([{
    score: data.performanceBalance.balanceScore.score,
    level: data.performanceBalance.balanceScore.level,
    description: data.performanceBalance.balanceScore.description,
    recommendations: data.performanceBalance.balanceScore.recommendations.join('; '),
  }]);
  XLSX.utils.book_append_sheet(workbook, performanceBalanceScoreWS, 'Score de Balance');

  const topImprovementsWS = XLSX.utils.json_to_sheet(data.performanceBalance.strengthMetrics.topImprovements);
  XLSX.utils.book_append_sheet(workbook, topImprovementsWS, 'Top Mejoras');

  const volumeDistributionWS = XLSX.utils.json_to_sheet(data.performanceBalance.volumeMetrics.volumeDistribution);
  XLSX.utils.book_append_sheet(workbook, volumeDistributionWS, 'Distribución Volumen');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};
