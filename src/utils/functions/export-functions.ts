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
  return {
    'metadata.csv': objectToCSV([data.metadata] as unknown as Record<string, unknown>[]),
    'exercises.csv': objectToCSV(data.exercises as unknown as Record<string, unknown>[]),
    'workout_records.csv': objectToCSV(data.workoutRecords as unknown as Record<string, unknown>[]),
    'exercises_by_day.csv': objectToCSV(data.exercisesByDay.map(day => ({
      dayOfWeek: day.dayOfWeek,
      totalVolume: day.totalVolume,
      averageVolume: day.averageVolume,
      workoutCount: day.workoutCount,
      exercisesCount: day.exercises.length,
    })) as unknown as Record<string, unknown>[]),
    'volume_by_category.csv': objectToCSV(data.volumeAnalysis.volumeByCategory as unknown as Record<string, unknown>[]),
    'volume_by_exercise.csv': objectToCSV(data.volumeAnalysis.volumeByExercise as unknown as Record<string, unknown>[]),
    'weekly_data.csv': objectToCSV(data.weeklyData.map(week => ({
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      totalVolume: week.totalVolume,
      workoutCount: week.workoutCount,
      averageVolumePerWorkout: week.averageVolumePerWorkout,
      uniqueExercises: week.uniqueExercises,
    })) as unknown as Record<string, unknown>[]),
    'category_metrics.csv': objectToCSV(data.categoryMetrics as unknown as Record<string, unknown>[]),
    'monthly_stats.csv': objectToCSV(data.monthlyStats as unknown as Record<string, unknown>[]),
    'personal_records.csv': objectToCSV(data.progressSummary.personalRecords as unknown as Record<string, unknown>[]),
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

  // Hoja de ejercicios
  const exercisesWS = XLSX.utils.json_to_sheet(data.exercises);
  XLSX.utils.book_append_sheet(workbook, exercisesWS, 'Ejercicios');

  // Hoja de registros de entrenamientos
  const workoutRecordsWS = XLSX.utils.json_to_sheet(data.workoutRecords);
  XLSX.utils.book_append_sheet(workbook, workoutRecordsWS, 'Entrenamientos');

  // Hoja de ejercicios por día
  const exercisesByDayFlat = data.exercisesByDay.flatMap(day =>
    day.exercises.map(exercise => ({
      dayOfWeek: day.dayOfWeek,
      exerciseName: exercise.exerciseName,
      categories: exercise.categories.join(', '),
      frequency: exercise.frequency,
      averageVolume: exercise.averageVolume,
      totalVolume: exercise.totalVolume,
      dayTotalVolume: day.totalVolume,
      dayWorkoutCount: day.workoutCount,
    })),
  );
  const exercisesByDayWS = XLSX.utils.json_to_sheet(exercisesByDayFlat);
  XLSX.utils.book_append_sheet(workbook, exercisesByDayWS, 'Ejercicios por Día');

  // Hoja de análisis de volumen por categoría
  const volumeByCategoryWS = XLSX.utils.json_to_sheet(data.volumeAnalysis.volumeByCategory);
  XLSX.utils.book_append_sheet(workbook, volumeByCategoryWS, 'Volumen por Categoría');

  // Hoja de análisis de volumen por ejercicio
  const volumeByExerciseWS = XLSX.utils.json_to_sheet(data.volumeAnalysis.volumeByExercise.map(ex => ({
    ...ex,
    categories: ex.categories.join(', '),
  })));
  XLSX.utils.book_append_sheet(workbook, volumeByExerciseWS, 'Volumen por Ejercicio');

  // Hoja de datos semanales
  const weeklyDataFlat = data.weeklyData.flatMap(week =>
    week.categoryBreakdown.map(category => ({
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekTotalVolume: week.totalVolume,
      weekWorkoutCount: week.workoutCount,
      weekAverageVolume: week.averageVolumePerWorkout,
      weekUniqueExercises: week.uniqueExercises,
      category: category.category,
      categoryVolume: category.volume,
      categoryPercentage: category.percentage,
    })),
  );
  const weeklyDataWS = XLSX.utils.json_to_sheet(weeklyDataFlat);
  XLSX.utils.book_append_sheet(workbook, weeklyDataWS, 'Datos Semanales');

  // Hoja de métricas por categoría
  const categoryMetricsWS = XLSX.utils.json_to_sheet(data.categoryMetrics.map(metric => ({
    ...metric,
    recommendations: metric.recommendations.join('; '),
  })));
  XLSX.utils.book_append_sheet(workbook, categoryMetricsWS, 'Métricas Categorías');

  // Hoja de estadísticas mensuales
  const monthlyStatsWS = XLSX.utils.json_to_sheet(data.monthlyStats.map(stat => ({
    ...stat,
    improvementAreas: stat.improvementAreas.join('; '),
  })));
  XLSX.utils.book_append_sheet(workbook, monthlyStatsWS, 'Estadísticas Mensuales');

  // Hoja de resumen de progreso
  const progressSummaryWS = XLSX.utils.json_to_sheet([{
    overallProgress: data.progressSummary.overallProgress,
    strengthGains: data.progressSummary.strengthGains,
    volumeIncrease: data.progressSummary.volumeIncrease,
    consistencyScore: data.progressSummary.consistencyScore,
    topPerformingCategories: data.progressSummary.topPerformingCategories.join(', '),
    areasForImprovement: data.progressSummary.areasForImprovement.join(', '),
  }]);
  XLSX.utils.book_append_sheet(workbook, progressSummaryWS, 'Resumen Progreso');

  // Hoja de récords personales
  const personalRecordsWS = XLSX.utils.json_to_sheet(data.progressSummary.personalRecords);
  XLSX.utils.book_append_sheet(workbook, personalRecordsWS, 'Récords Personales');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};
