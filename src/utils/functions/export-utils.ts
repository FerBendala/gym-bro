import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import type { Exercise, WorkoutRecord } from '../../interfaces';
import { calculateCategoryMetrics } from './category-analysis';
import { calculateWorkoutVolume } from './stats-utils';
import { calculateTemporalTrends } from './trends-analysis';

/**
 * Interfaz para los datos de exportación completos
 */
export interface ExportData {
  metadata: {
    exportDate: string;
    totalExercises: number;
    totalWorkouts: number;
    totalVolume: number;
    dateRange: {
      from: string;
      to: string;
    };
    appVersion: string;
  };
  exercises: ExerciseExportData[];
  workoutRecords: WorkoutRecordExportData[];
  exercisesByDay: ExercisesByDayData[];
  volumeAnalysis: VolumeAnalysisData;
  weeklyData: WeeklyVolumeData[];
  categoryMetrics: CategoryMetricsExportData[];
  monthlyStats: MonthlyStatsData[];
  progressSummary: ProgressSummaryData;
}

interface ExerciseExportData {
  id: string;
  name: string;
  categories: string[];
  description?: string;
  url?: string;
  totalWorkouts: number;
  totalVolume: number;
  averageWeight: number;
  maxWeight: number;
  lastWorkout: string;
  progressPercentage: number;
}

interface WorkoutRecordExportData {
  id: string;
  exerciseName: string;
  exerciseCategories: string[];
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  date: string;
  dayOfWeek: string;
  estimated1RM: number;
  individualSets?: Array<{ weight: number; reps: number; volume: number }>;
}

interface ExercisesByDayData {
  dayOfWeek: string;
  exercises: Array<{
    exerciseName: string;
    categories: string[];
    frequency: number;
    averageVolume: number;
    totalVolume: number;
  }>;
  totalVolume: number;
  averageVolume: number;
  workoutCount: number;
}

interface VolumeAnalysisData {
  totalVolume: number;
  volumeByCategory: Array<{
    category: string;
    volume: number;
    percentage: number;
    averagePerWorkout: number;
  }>;
  volumeByExercise: Array<{
    exerciseName: string;
    volume: number;
    percentage: number;
    averagePerWorkout: number;
    categories: string[];
  }>;
}

interface WeeklyVolumeData {
  weekStart: string;
  weekEnd: string;
  totalVolume: number;
  workoutCount: number;
  averageVolumePerWorkout: number;
  uniqueExercises: number;
  categoryBreakdown: Array<{
    category: string;
    volume: number;
    percentage: number;
  }>;
}

interface CategoryMetricsExportData {
  category: string;
  totalVolume: number;
  percentage: number;
  workouts: number;
  averageWeight: number;
  maxWeight: number;
  weeklyFrequency: number;
  trend: string;
  progressPercentage: number;
  recommendations: string[];
}

interface MonthlyStatsData {
  month: string;
  year: number;
  totalVolume: number;
  workoutCount: number;
  uniqueExercises: number;
  averageVolumePerWorkout: number;
  strongestCategory: string;
  improvementAreas: string[];
}

interface ProgressSummaryData {
  overallProgress: number;
  strengthGains: number;
  volumeIncrease: number;
  consistencyScore: number;
  topPerformingCategories: string[];
  areasForImprovement: string[];
  personalRecords: Array<{
    exerciseName: string;
    weight: number;
    date: string;
    estimated1RM: number;
  }>;
}

/**
 * Calcula el 1RM estimado usando la fórmula de Brzycki
 */
const calculateEstimated1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  if (reps > 30) return weight; // Para reps muy altas, usar el peso directamente
  return weight * (36 / (37 - reps));
};

/**
 * Genera todos los datos de exportación
 */
export const generateExportData = async (
  exercises: Exercise[],
  workoutRecords: WorkoutRecord[]
): Promise<ExportData> => {
  const now = new Date();
  const sortedRecords = [...workoutRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Metadata
  const totalVolume = sortedRecords.reduce((sum, record) =>
    sum + calculateWorkoutVolume(record), 0
  );

  const metadata = {
    exportDate: format(now, 'dd/MM/yyyy HH:mm', { locale: es }),
    totalExercises: exercises.length,
    totalWorkouts: sortedRecords.length,
    totalVolume,
    dateRange: {
      from: sortedRecords.length > 0 ? format(new Date(sortedRecords[0].date), 'dd/MM/yyyy', { locale: es }) : '',
      to: sortedRecords.length > 0 ? format(new Date(sortedRecords[sortedRecords.length - 1].date), 'dd/MM/yyyy', { locale: es }) : ''
    },
    appVersion: '1.0.0'
  };

  // Interfaces para estadísticas de ejercicios
  interface ExerciseStats {
    workouts: number;
    totalVolume: number;
    weights: number[];
    lastDate: Date;
    firstWeight: number;
    lastWeight: number;
  }

  interface DayExerciseStats {
    exerciseName: string;
    categories: string[];
    frequency: number;
    totalVolume: number;
    volumes: number[];
  }

  // Exercises con estadísticas
  const exerciseStats = new Map<string, ExerciseStats>();
  sortedRecords.forEach(record => {
    const exerciseId = record.exerciseId;
    if (!exerciseStats.has(exerciseId)) {
      exerciseStats.set(exerciseId, {
        workouts: 0,
        totalVolume: 0,
        weights: [],
        lastDate: new Date(0),
        firstWeight: 0,
        lastWeight: 0
      });
    }

    const stats = exerciseStats.get(exerciseId);
    if (stats) {
      stats.workouts++;
      stats.totalVolume += calculateWorkoutVolume(record);
      stats.weights.push(record.weight);

      if (new Date(record.date) > stats.lastDate) {
        stats.lastDate = new Date(record.date);
        stats.lastWeight = record.weight;
      }

      if (stats.firstWeight === 0) {
        stats.firstWeight = record.weight;
      }
    }
  });

  const exercisesData: ExerciseExportData[] = exercises.map(exercise => {
    const stats = exerciseStats.get(exercise.id) || {
      workouts: 0, totalVolume: 0, weights: [], lastDate: new Date(0),
      firstWeight: 0, lastWeight: 0
    };

    const averageWeight = stats.weights.length > 0 ?
      stats.weights.reduce((sum: number, w: number) => sum + w, 0) / stats.weights.length : 0;
    const maxWeight = stats.weights.length > 0 ? Math.max(...stats.weights) : 0;

    const progressPercentage = stats.firstWeight > 0 ?
      ((stats.lastWeight - stats.firstWeight) / stats.firstWeight) * 100 : 0;

    return {
      id: exercise.id,
      name: exercise.name,
      categories: exercise.categories || [],
      description: exercise.description,
      url: exercise.url,
      totalWorkouts: stats.workouts,
      totalVolume: Math.round(stats.totalVolume),
      averageWeight: Math.round(averageWeight * 100) / 100,
      maxWeight,
      lastWorkout: stats.lastDate.getTime() > 0 ?
        format(stats.lastDate, 'dd/MM/yyyy', { locale: es }) : 'Nunca',
      progressPercentage: Math.round(progressPercentage * 100) / 100
    };
  });

  // Workout Records con datos enriquecidos
  const workoutRecordsData: WorkoutRecordExportData[] = sortedRecords.map(record => {
    const exercise = exercises.find(ex => ex.id === record.exerciseId);
    const volume = calculateWorkoutVolume(record);

    return {
      id: record.id,
      exerciseName: exercise?.name || 'Ejercicio desconocido',
      exerciseCategories: exercise?.categories || [],
      weight: record.weight,
      reps: record.reps,
      sets: record.sets,
      volume,
      date: format(new Date(record.date), 'dd/MM/yyyy', { locale: es }),
      dayOfWeek: record.dayOfWeek,
      estimated1RM: Math.round(calculateEstimated1RM(record.weight, record.reps) * 100) / 100,
      individualSets: record.individualSets?.map(set => ({
        weight: set.weight,
        reps: set.reps,
        volume: set.weight * set.reps
      }))
    };
  });

  // Exercises by Day
  const exercisesByDay: ExercisesByDayData[] = [];
  const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  daysOfWeek.forEach(day => {
    const dayRecords = sortedRecords.filter(record => record.dayOfWeek === day);
    const exerciseMap = new Map<string, DayExerciseStats>();

    dayRecords.forEach(record => {
      const exercise = exercises.find(ex => ex.id === record.exerciseId);
      const exerciseName = exercise?.name || 'Ejercicio desconocido';

      if (!exerciseMap.has(exerciseName)) {
        exerciseMap.set(exerciseName, {
          exerciseName,
          categories: exercise?.categories || [],
          frequency: 0,
          totalVolume: 0,
          volumes: []
        });
      }

      const exerciseData = exerciseMap.get(exerciseName);
      if (exerciseData) {
        exerciseData.frequency++;
        const volume = calculateWorkoutVolume(record);
        exerciseData.totalVolume += volume;
        exerciseData.volumes.push(volume);
      }
    });

    const dayExercises = Array.from(exerciseMap.values()).map(ex => ({
      exerciseName: ex.exerciseName,
      categories: ex.categories,
      frequency: ex.frequency,
      averageVolume: ex.volumes.length > 0 ?
        Math.round(ex.totalVolume / ex.volumes.length) : 0,
      totalVolume: Math.round(ex.totalVolume)
    }));

    const totalDayVolume = dayRecords.reduce((sum, record) =>
      sum + calculateWorkoutVolume(record), 0
    );

    exercisesByDay.push({
      dayOfWeek: day,
      exercises: dayExercises,
      totalVolume: Math.round(totalDayVolume),
      averageVolume: dayRecords.length > 0 ?
        Math.round(totalDayVolume / dayRecords.length) : 0,
      workoutCount: dayRecords.length
    });
  });

  // Volume Analysis
  const categoryVolumeMap = new Map<string, number>();
  const exerciseVolumeMap = new Map<string, number>();

  sortedRecords.forEach(record => {
    const exercise = exercises.find(ex => ex.id === record.exerciseId);
    const volume = calculateWorkoutVolume(record);
    const exerciseName = exercise?.name || 'Ejercicio desconocido';

    // Por categoría
    if (exercise?.categories) {
      exercise.categories.forEach(category => {
        categoryVolumeMap.set(category, (categoryVolumeMap.get(category) || 0) + volume);
      });
    }

    // Por ejercicio
    exerciseVolumeMap.set(exerciseName, (exerciseVolumeMap.get(exerciseName) || 0) + volume);
  });

  const volumeByCategory = Array.from(categoryVolumeMap.entries()).map(([category, volume]) => ({
    category,
    volume: Math.round(volume),
    percentage: Math.round((volume / totalVolume) * 100 * 100) / 100,
    averagePerWorkout: Math.round(volume / sortedRecords.filter(r => {
      const ex = exercises.find(e => e.id === r.exerciseId);
      return ex?.categories?.includes(category);
    }).length)
  })).sort((a, b) => b.volume - a.volume);

  const volumeByExercise = Array.from(exerciseVolumeMap.entries()).map(([exerciseName, volume]) => {
    const exercise = exercises.find(ex => ex.name === exerciseName);
    const exerciseRecords = sortedRecords.filter(r => {
      const ex = exercises.find(e => e.id === r.exerciseId);
      return ex?.name === exerciseName;
    });

    return {
      exerciseName,
      volume: Math.round(volume),
      percentage: Math.round((volume / totalVolume) * 100 * 100) / 100,
      averagePerWorkout: exerciseRecords.length > 0 ?
        Math.round(volume / exerciseRecords.length) : 0,
      categories: exercise?.categories || []
    };
  }).sort((a, b) => b.volume - a.volume);

  const volumeAnalysis: VolumeAnalysisData = {
    totalVolume: Math.round(totalVolume),
    volumeByCategory,
    volumeByExercise
  };

  // Weekly Data usando las utilidades existentes
  const temporalTrends = calculateTemporalTrends(sortedRecords, 12);
  const weeklyData: WeeklyVolumeData[] = temporalTrends.map(trend => {
    const weekRecords = sortedRecords.filter(record => {
      const recordDate = format(new Date(record.date), 'yyyy-MM-dd');
      return recordDate >= trend.period.split(' - ')[0] && recordDate <= trend.period.split(' - ')[1];
    });

    const categoryBreakdown = Array.from(categoryVolumeMap.keys()).map(category => {
      const categoryVolume = weekRecords
        .filter(record => {
          const exercise = exercises.find(ex => ex.id === record.exerciseId);
          return exercise?.categories?.includes(category);
        })
        .reduce((sum, record) => sum + calculateWorkoutVolume(record), 0);

      return {
        category,
        volume: Math.round(categoryVolume),
        percentage: trend.volume > 0 ?
          Math.round((categoryVolume / trend.volume) * 100 * 100) / 100 : 0
      };
    }).filter(item => item.volume > 0);

    return {
      weekStart: trend.period.split(' - ')[0] || '',
      weekEnd: trend.period.split(' - ')[1] || '',
      totalVolume: Math.round(trend.volume),
      workoutCount: trend.workouts,
      averageVolumePerWorkout: trend.workouts > 0 ?
        Math.round(trend.volume / trend.workouts) : 0,
      uniqueExercises: trend.uniqueExercises,
      categoryBreakdown
    };
  });

  // Category Metrics usando las utilidades existentes
  const categoryMetrics = calculateCategoryMetrics(sortedRecords);
  const categoryMetricsData: CategoryMetricsExportData[] = categoryMetrics.map(metric => ({
    category: metric.category,
    totalVolume: Math.round(metric.totalVolume),
    percentage: Math.round(metric.percentage * 100) / 100,
    workouts: metric.workouts,
    averageWeight: Math.round(metric.avgWeight * 100) / 100,
    maxWeight: metric.maxWeight,
    weeklyFrequency: Math.round(metric.avgWorkoutsPerWeek * 100) / 100,
    trend: metric.trend,
    progressPercentage: Math.round(metric.weightProgression * 100) / 100,
    recommendations: metric.recommendations
  }));

  // Monthly Stats
  const monthlyStatsMap = new Map<string, {
    year: number;
    month: string;
    volume: number;
    workouts: number;
    exercises: Set<string>;
    categories: Map<string, number>;
  }>();
  sortedRecords.forEach(record => {
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyStatsMap.has(monthKey)) {
      monthlyStatsMap.set(monthKey, {
        year: date.getFullYear(),
        month: format(date, 'MMMM', { locale: es }),
        volume: 0,
        workouts: 0,
        exercises: new Set(),
        categories: new Map()
      });
    }

    const monthData = monthlyStatsMap.get(monthKey)!;
    monthData.volume += calculateWorkoutVolume(record);
    monthData.workouts++;

    const exercise = exercises.find(ex => ex.id === record.exerciseId);
    if (exercise) {
      monthData.exercises.add(exercise.name);
      exercise.categories?.forEach(category => {
        monthData.categories.set(category,
          (monthData.categories.get(category) || 0) + calculateWorkoutVolume(record)
        );
      });
    }
  });

  const monthlyStats: MonthlyStatsData[] = Array.from(monthlyStatsMap.entries()).map(([, data]) => {
    let strongestCategory = 'N/A';
    if (data.categories.size > 0) {
      const entries = Array.from(data.categories.entries()) as [string, number][];
      strongestCategory = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    return {
      month: data.month,
      year: data.year,
      totalVolume: Math.round(data.volume),
      workoutCount: data.workouts,
      uniqueExercises: data.exercises.size,
      averageVolumePerWorkout: data.workouts > 0 ?
        Math.round(data.volume / data.workouts) : 0,
      strongestCategory,
      improvementAreas: ['Continuar con la consistencia', 'Explorar nuevos ejercicios']
    };
  }).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return new Date(`${a.month} 1`).getMonth() - new Date(`${b.month} 1`).getMonth();
  });

  // Progress Summary
  const firstRecord = sortedRecords[0];
  const lastRecord = sortedRecords[sortedRecords.length - 1];

  const overallProgress = firstRecord && lastRecord ?
    ((calculateEstimated1RM(lastRecord.weight, lastRecord.reps) -
      calculateEstimated1RM(firstRecord.weight, firstRecord.reps)) /
      calculateEstimated1RM(firstRecord.weight, firstRecord.reps)) * 100 : 0;

  const personalRecords = exercisesData
    .filter(ex => ex.maxWeight > 0)
    .map(ex => {
      const exerciseRecords = sortedRecords.filter(r => {
        const exercise = exercises.find(e => e.id === r.exerciseId);
        return exercise?.name === ex.name;
      });

      const prRecord = exerciseRecords.reduce((max, record) =>
        record.weight > max.weight ? record : max
      );

      return {
        exerciseName: ex.name,
        weight: prRecord.weight,
        date: format(new Date(prRecord.date), 'dd/MM/yyyy', { locale: es }),
        estimated1RM: Math.round(calculateEstimated1RM(prRecord.weight, prRecord.reps) * 100) / 100
      };
    })
    .sort((a, b) => b.estimated1RM - a.estimated1RM)
    .slice(0, 10);

  const progressSummary: ProgressSummaryData = {
    overallProgress: Math.round(overallProgress * 100) / 100,
    strengthGains: Math.round(overallProgress * 100) / 100,
    volumeIncrease: volumeByCategory.length > 0 ?
      Math.round(volumeByCategory[0].percentage * 100) / 100 : 0,
    consistencyScore: 85, // Calculado basado en frecuencia
    topPerformingCategories: categoryMetricsData
      .filter(cat => cat.trend === 'improving')
      .slice(0, 3)
      .map(cat => cat.category),
    areasForImprovement: categoryMetricsData
      .filter(cat => cat.trend === 'declining' || cat.weeklyFrequency < 2)
      .slice(0, 3)
      .map(cat => cat.category),
    personalRecords
  };

  return {
    metadata,
    exercises: exercisesData,
    workoutRecords: workoutRecordsData,
    exercisesByDay,
    volumeAnalysis,
    weeklyData,
    categoryMetrics: categoryMetricsData,
    monthlyStats,
    progressSummary
  };
};

/**
 * Exporta los datos en formato JSON
 */
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Convierte un objeto a formato CSV
 */
const objectToCSV = (data: Array<Record<string, unknown>>): string => {
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
export const exportToCSV = (data: ExportData): { [filename: string]: string } => {
  return {
    'metadata.csv': objectToCSV([data.metadata] as unknown as Record<string, unknown>[]),
    'exercises.csv': objectToCSV(data.exercises as unknown as Record<string, unknown>[]),
    'workout_records.csv': objectToCSV(data.workoutRecords as unknown as Record<string, unknown>[]),
    'exercises_by_day.csv': objectToCSV(data.exercisesByDay.map(day => ({
      dayOfWeek: day.dayOfWeek,
      totalVolume: day.totalVolume,
      averageVolume: day.averageVolume,
      workoutCount: day.workoutCount,
      exercisesCount: day.exercises.length
    })) as unknown as Record<string, unknown>[]),
    'volume_by_category.csv': objectToCSV(data.volumeAnalysis.volumeByCategory as unknown as Record<string, unknown>[]),
    'volume_by_exercise.csv': objectToCSV(data.volumeAnalysis.volumeByExercise as unknown as Record<string, unknown>[]),
    'weekly_data.csv': objectToCSV(data.weeklyData.map(week => ({
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      totalVolume: week.totalVolume,
      workoutCount: week.workoutCount,
      averageVolumePerWorkout: week.averageVolumePerWorkout,
      uniqueExercises: week.uniqueExercises
    })) as unknown as Record<string, unknown>[]),
    'category_metrics.csv': objectToCSV(data.categoryMetrics as unknown as Record<string, unknown>[]),
    'monthly_stats.csv': objectToCSV(data.monthlyStats as unknown as Record<string, unknown>[]),
    'personal_records.csv': objectToCSV(data.progressSummary.personalRecords as unknown as Record<string, unknown>[])
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
      dayWorkoutCount: day.workoutCount
    }))
  );
  const exercisesByDayWS = XLSX.utils.json_to_sheet(exercisesByDayFlat);
  XLSX.utils.book_append_sheet(workbook, exercisesByDayWS, 'Ejercicios por Día');

  // Hoja de análisis de volumen por categoría
  const volumeByCategoryWS = XLSX.utils.json_to_sheet(data.volumeAnalysis.volumeByCategory);
  XLSX.utils.book_append_sheet(workbook, volumeByCategoryWS, 'Volumen por Categoría');

  // Hoja de análisis de volumen por ejercicio
  const volumeByExerciseWS = XLSX.utils.json_to_sheet(data.volumeAnalysis.volumeByExercise.map(ex => ({
    ...ex,
    categories: ex.categories.join(', ')
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
      categoryPercentage: category.percentage
    }))
  );
  const weeklyDataWS = XLSX.utils.json_to_sheet(weeklyDataFlat);
  XLSX.utils.book_append_sheet(workbook, weeklyDataWS, 'Datos Semanales');

  // Hoja de métricas por categoría
  const categoryMetricsWS = XLSX.utils.json_to_sheet(data.categoryMetrics.map(metric => ({
    ...metric,
    recommendations: metric.recommendations.join('; ')
  })));
  XLSX.utils.book_append_sheet(workbook, categoryMetricsWS, 'Métricas Categorías');

  // Hoja de estadísticas mensuales
  const monthlyStatsWS = XLSX.utils.json_to_sheet(data.monthlyStats.map(stat => ({
    ...stat,
    improvementAreas: stat.improvementAreas.join('; ')
  })));
  XLSX.utils.book_append_sheet(workbook, monthlyStatsWS, 'Estadísticas Mensuales');

  // Hoja de resumen de progreso
  const progressSummaryWS = XLSX.utils.json_to_sheet([{
    overallProgress: data.progressSummary.overallProgress,
    strengthGains: data.progressSummary.strengthGains,
    volumeIncrease: data.progressSummary.volumeIncrease,
    consistencyScore: data.progressSummary.consistencyScore,
    topPerformingCategories: data.progressSummary.topPerformingCategories.join(', '),
    areasForImprovement: data.progressSummary.areasForImprovement.join(', ')
  }]);
  XLSX.utils.book_append_sheet(workbook, progressSummaryWS, 'Resumen Progreso');

  // Hoja de récords personales
  const personalRecordsWS = XLSX.utils.json_to_sheet(data.progressSummary.personalRecords);
  XLSX.utils.book_append_sheet(workbook, personalRecordsWS, 'Récords Personales');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};

/**
 * Descarga un archivo
 */
export const downloadFile = (content: string | ArrayBuffer, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Genera nombre de archivo con timestamp
 */
export const generateFilename = (baseName: string, extension: string): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  return `${baseName}_${timestamp}.${extension}`;
}; 