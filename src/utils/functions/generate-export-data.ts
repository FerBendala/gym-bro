import { format, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';

import { calculateOptimal1RM } from './calculate-1rm.utils';
import type { ExportData } from './export-interfaces';
import { roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';

import type { Exercise, WorkoutRecord } from '@/interfaces';

/**
 * Genera datos de exportación enfocados en análisis específico
 */
export const generateExportData = async (
  exercises: Exercise[],
  workoutRecords: WorkoutRecord[],
): Promise<ExportData> => {
  const now = new Date();

  // Incluir TODOS los registros, no solo los "válidos"
  const allRecords = workoutRecords;
  const validRecords = workoutRecords.filter(record => record.exercise);
  const invalidRecords = workoutRecords.filter(record => !record.exercise);

  // Log de registros problemáticos para debugging
  if (invalidRecords.length > 0) {
    console.warn(`Se encontraron ${invalidRecords.length} registros con ejercicios no válidos:`,
      invalidRecords.map(r => ({ id: r.id, exerciseId: r.exerciseId, date: r.date }))
    );
  }

  // Ordenar TODOS los registros por fecha (más reciente primero)
  const sortedRecords = [...allRecords].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Log de todos los registros para debugging
  console.log('📊 Registros válidos encontrados:', sortedRecords.length);
  console.log('📅 Rango de fechas:', {
    from: sortedRecords.length > 0 ? format(new Date(sortedRecords[0].date), 'dd/MM/yyyy', { locale: es }) : 'N/A',
    to: sortedRecords.length > 0 ? format(new Date(sortedRecords[sortedRecords.length - 1].date), 'dd/MM/yyyy', { locale: es }) : 'N/A'
  });

  // Mostrar los últimos 5 registros
  const lastRecords = sortedRecords.slice(-5);
  console.log('🔄 Últimos 5 registros:', lastRecords.map(r => ({
    exercise: r.exercise?.name,
    date: format(new Date(r.date), 'dd/MM/yyyy', { locale: es }),
    weight: r.weight,
    reps: r.reps,
    sets: r.sets
  })));

  // Metadata
  const totalVolume = sortedRecords.reduce((sum, record) =>
    sum + calculateVolume(record), 0,
  );

  const metadata = {
    exportDate: format(now, 'dd/MM/yyyy HH:mm', { locale: es }),
    totalExercises: exercises.length,
    totalWorkouts: sortedRecords.length,
    totalVolume,
    invalidRecordsCount: invalidRecords.length,
    dateRange: {
      from: sortedRecords.length > 0 ? format(new Date(sortedRecords[0].date), 'dd/MM/yyyy', { locale: es }) : '',
      to: sortedRecords.length > 0 ? format(new Date(sortedRecords[sortedRecords.length - 1].date), 'dd/MM/yyyy', { locale: es }) : '',
    },
    appVersion: '1.0.0',
  };

  // 1. DÍAS DE LA SEMANA QUE SE ENTRENAN CON SUS EJERCICIOS Y VOLÚMENES
  const trainingDays = generateTrainingDaysData(sortedRecords, exercises);

  // 2. EJERCICIOS CON PESO POR SESIÓN (EVOLUCIÓN) Y VOLUMEN TOTAL
  const exercisesEvolution = generateExercisesEvolutionData(sortedRecords, exercises);

  // 3. PORCENTAJES POR GRUPO MUSCULAR DEFINIDOS Y REALMENTE HECHOS
  const muscleGroupAnalysis = generateMuscleGroupAnalysisData(sortedRecords, exercises);

  // 4. BALANCE GENERAL DE RENDIMIENTO
  const performanceBalance = generatePerformanceBalanceData(sortedRecords, exercises);

  return {
    metadata,
    trainingDays,
    exercisesEvolution,
    muscleGroupAnalysis,
    performanceBalance,
  };
};

/**
 * 1. Genera datos de días de entrenamiento
 */
function generateTrainingDaysData(records: WorkoutRecord[], exercises: Exercise[]) {
  const daysMap = new Map<string, {
    dayName: string;
    totalWorkouts: number;
    totalVolume: number;
    exercises: Map<string, {
      exerciseName: string;
      categories: string[];
      totalVolume: number;
      workoutCount: number;
      averageWeight: number;
      maxWeight: number;
      lastWorkout: string;
      weights: number[];
    }>;
    muscleGroups: Map<string, { volume: number; count: number }>;
  }>();

  // Inicializar días de la semana
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  dayNames.forEach((dayName, index) => {
    const dayOfWeek = format(new Date(2024, 0, index + 1), 'EEEE', { locale: es });
    daysMap.set(dayOfWeek, {
      dayName,
      totalWorkouts: 0,
      totalVolume: 0,
      exercises: new Map(),
      muscleGroups: new Map(),
    });
  });

  // Procesar registros
  records.forEach(record => {
    const dayOfWeek = format(new Date(record.date), 'EEEE', { locale: es });
    const dayData = daysMap.get(dayOfWeek);
    if (!dayData) return;

    const volume = calculateVolume(record);
    const exerciseName = record.exercise?.name || 'Ejercicio no encontrado';
    const categories = record.exercise?.categories || [];

    // Actualizar estadísticas del día
    dayData.totalWorkouts++;
    dayData.totalVolume += volume;

    // Actualizar ejercicio
    if (!dayData.exercises.has(exerciseName)) {
      dayData.exercises.set(exerciseName, {
        exerciseName,
        categories,
        totalVolume: 0,
        workoutCount: 0,
        averageWeight: 0,
        maxWeight: 0,
        lastWorkout: '',
        weights: [],
      });
    }

    const exerciseData = dayData.exercises.get(exerciseName)!;
    exerciseData.totalVolume += volume;
    exerciseData.workoutCount++;
    exerciseData.weights.push(record.weight);
    exerciseData.lastWorkout = format(new Date(record.date), 'dd/MM/yyyy', { locale: es });

    // Actualizar grupos musculares
    categories.forEach(category => {
      if (!dayData.muscleGroups.has(category)) {
        dayData.muscleGroups.set(category, { volume: 0, count: 0 });
      }
      const groupData = dayData.muscleGroups.get(category)!;
      groupData.volume += volume;
      groupData.count++;
    });
  });

  // Convertir a formato final
  return Array.from(daysMap.entries()).map(([dayOfWeek, dayData]) => {
    const exercisesArray = Array.from(dayData.exercises.values()).map(exercise => ({
      ...exercise,
      averageWeight: exercise.weights.length > 0 ?
        roundToDecimals(exercise.weights.reduce((sum, w) => sum + w, 0) / exercise.weights.length) : 0,
      maxWeight: exercise.weights.length > 0 ? Math.max(...exercise.weights) : 0,
    }));

    const muscleGroupsArray = Array.from(dayData.muscleGroups.entries()).map(([group, data]) => ({
      group,
      volume: roundToDecimals(data.volume),
      percentage: roundToDecimals((data.volume / dayData.totalVolume) * 100),
    }));

    return {
      dayOfWeek,
      dayName: dayData.dayName,
      totalWorkouts: dayData.totalWorkouts,
      totalVolume: roundToDecimals(dayData.totalVolume),
      exercises: exercisesArray,
      muscleGroups: muscleGroupsArray,
    };
  });
}

/**
 * 2. Genera datos de evolución de ejercicios
 */
function generateExercisesEvolutionData(records: WorkoutRecord[], exercises: Exercise[]) {
  const exercisesMap = new Map<string, {
    exerciseName: string;
    categories: string[];
    totalVolume: number;
    totalWorkouts: number;
    sessions: {
      date: string;
      weight: number;
      reps: number;
      sets: number;
      volume: number;
      estimated1RM: number;
      weekNumber: number;
    }[];
    weights: number[];
    firstWeight: number;
    lastWeight: number;
    maxWeight: number;
  }>();

  // Procesar registros por ejercicio
  records.forEach(record => {
    // Intentar encontrar el ejercicio por ID si no está resuelto
    let exerciseName = record.exercise?.name;
    let categories = record.exercise?.categories || [];

    if (!exerciseName && record.exerciseId) {
      const foundExercise = exercises.find(ex => ex.id === record.exerciseId);
      if (foundExercise) {
        exerciseName = foundExercise.name;
        categories = foundExercise.categories;
      }
    }

    exerciseName = exerciseName || 'Ejercicio no encontrado';
    const volume = calculateVolume(record);
    const estimated1RM = calculateOptimal1RM(record.weight, record.reps);
    const weekNumber = getWeek(new Date(record.date), { locale: es });

    if (!exercisesMap.has(exerciseName)) {
      exercisesMap.set(exerciseName, {
        exerciseName,
        categories,
        totalVolume: 0,
        totalWorkouts: 0,
        sessions: [],
        weights: [],
        firstWeight: 0,
        lastWeight: 0,
        maxWeight: 0,
      });
    }

    const exerciseData = exercisesMap.get(exerciseName)!;
    exerciseData.totalVolume += volume;
    exerciseData.totalWorkouts++;
    exerciseData.weights.push(record.weight);

    exerciseData.sessions.push({
      date: format(new Date(record.date), 'dd/MM/yyyy', { locale: es }),
      weight: record.weight,
      reps: record.reps,
      sets: record.sets,
      volume: roundToDecimals(volume),
      estimated1RM: roundToDecimals(estimated1RM),
      weekNumber,
    });
  });

  // Calcular evolución
  return Array.from(exercisesMap.values()).map(exercise => {
    const sortedWeights = [...exercise.weights].sort((a, b) => a - b);
    const firstWeight = sortedWeights[0] || 0;
    const lastWeight = sortedWeights[sortedWeights.length - 1] || 0;
    const maxWeight = Math.max(...exercise.weights);
    const averageWeight = exercise.weights.length > 0 ?
      exercise.weights.reduce((sum, w) => sum + w, 0) / exercise.weights.length : 0;
    const progressPercentage = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight) * 100 : 0;

    // Agrupar por semana para progresión
    const weeklyData = new Map<number, { weights: number[]; maxWeight: number }>();
    exercise.sessions.forEach(session => {
      if (!weeklyData.has(session.weekNumber)) {
        weeklyData.set(session.weekNumber, { weights: [], maxWeight: 0 });
      }
      const weekData = weeklyData.get(session.weekNumber)!;
      weekData.weights.push(session.weight);
      weekData.maxWeight = Math.max(weekData.maxWeight, session.weight);
    });

    const weightProgression = Array.from(weeklyData.entries()).map(([week, data]) => ({
      week,
      averageWeight: roundToDecimals(data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length),
      maxWeight: data.maxWeight,
    }));

    return {
      exerciseName: exercise.exerciseName,
      categories: exercise.categories,
      totalVolume: roundToDecimals(exercise.totalVolume),
      totalWorkouts: exercise.totalWorkouts,
      sessions: exercise.sessions,
      evolution: {
        firstWeight,
        lastWeight,
        maxWeight,
        progressPercentage: roundToDecimals(progressPercentage),
        averageWeight: roundToDecimals(averageWeight),
        weightProgression,
      },
    };
  });
}

/**
 * 3. Genera análisis de grupos musculares
 */
function generateMuscleGroupAnalysisData(records: WorkoutRecord[], exercises: Exercise[]) {
  const totalVolume = records.reduce((sum, record) => sum + calculateVolume(record), 0);

  // Porcentajes definidos (ejemplo - se pueden ajustar)
  const definedPercentages = [
    { group: 'Pecho', targetPercentage: 20 },
    { group: 'Espalda', targetPercentage: 20 },
    { group: 'Piernas', targetPercentage: 25 },
    { group: 'Hombros', targetPercentage: 15 },
    { group: 'Bíceps', targetPercentage: 10 },
    { group: 'Tríceps', targetPercentage: 10 },
  ];

  // Calcular porcentajes reales
  const actualVolumes = new Map<string, { volume: number; count: number }>();

  records.forEach(record => {
    const volume = calculateVolume(record);
    const categories = record.exercise?.categories || [];

    categories.forEach(category => {
      // Mapear "Brazos" a "Bíceps" y "Tríceps" basado en el ejercicio
      if (category === 'Brazos') {
        const exerciseName = record.exercise?.name || '';

        // Determinar si es bíceps o tríceps basado en el nombre del ejercicio
        if (exerciseName.toLowerCase().includes('curl') ||
          exerciseName.toLowerCase().includes('bíceps') ||
          exerciseName.toLowerCase().includes('bicep')) {
          // Es ejercicio de bíceps
          if (!actualVolumes.has('Bíceps')) {
            actualVolumes.set('Bíceps', { volume: 0, count: 0 });
          }
          const bicepsData = actualVolumes.get('Bíceps')!;
          bicepsData.volume += volume;
          bicepsData.count++;
        } else if (exerciseName.toLowerCase().includes('extensión') ||
          exerciseName.toLowerCase().includes('tríceps') ||
          exerciseName.toLowerCase().includes('tricep') ||
          exerciseName.toLowerCase().includes('fondos')) {
          // Es ejercicio de tríceps
          if (!actualVolumes.has('Tríceps')) {
            actualVolumes.set('Tríceps', { volume: 0, count: 0 });
          }
          const tricepsData = actualVolumes.get('Tríceps')!;
          tricepsData.volume += volume;
          tricepsData.count++;
        } else {
          // Ejercicios compuestos que trabajan ambos (dividir 50/50)
          if (!actualVolumes.has('Bíceps')) {
            actualVolumes.set('Bíceps', { volume: 0, count: 0 });
          }
          if (!actualVolumes.has('Tríceps')) {
            actualVolumes.set('Tríceps', { volume: 0, count: 0 });
          }
          const bicepsData = actualVolumes.get('Bíceps')!;
          const tricepsData = actualVolumes.get('Tríceps')!;
          bicepsData.volume += volume * 0.5;
          tricepsData.volume += volume * 0.5;
          bicepsData.count++;
          tricepsData.count++;
        }
      } else {
        // Otras categorías se mantienen igual
        if (!actualVolumes.has(category)) {
          actualVolumes.set(category, { volume: 0, count: 0 });
        }
        const data = actualVolumes.get(category)!;
        data.volume += volume;
        data.count++;
      }
    });
  });

  const actualPercentages = Array.from(actualVolumes.entries()).map(([group, data]) => ({
    group,
    actualVolume: roundToDecimals(data.volume),
    actualPercentage: roundToDecimals((data.volume / totalVolume) * 100),
    workoutCount: data.count,
  }));

  // Comparar definido vs real
  const comparison = definedPercentages.map(defined => {
    const actual = actualPercentages.find(a => a.group === defined.group);
    const actualPercentage = actual?.actualPercentage || 0;
    const difference = actualPercentage - defined.targetPercentage;

    let status: 'above' | 'below' | 'balanced';
    if (Math.abs(difference) < 5) status = 'balanced';
    else if (difference > 0) status = 'above';
    else status = 'below';

    return {
      group: defined.group,
      targetPercentage: defined.targetPercentage,
      actualPercentage,
      difference: roundToDecimals(difference),
      status,
    };
  });

  // Generar recomendaciones
  const recommendations = comparison.map(comp => {
    let message = '';
    let priority: 'high' | 'medium' | 'low' = 'low';

    if (comp.status === 'below') {
      message = `Aumentar volumen de ${comp.group}. Diferencia: ${Math.abs(comp.difference)}%`;
      priority = Math.abs(comp.difference) > 10 ? 'high' : 'medium';
    } else if (comp.status === 'above') {
      message = `Reducir volumen de ${comp.group}. Diferencia: ${comp.difference}%`;
      priority = comp.difference > 15 ? 'high' : 'medium';
    } else {
      message = `${comp.group} está bien balanceado`;
      priority = 'low';
    }

    return { group: comp.group, message, priority };
  });

  return {
    totalVolume: roundToDecimals(totalVolume),
    definedPercentages,
    actualPercentages,
    comparison,
    recommendations,
  };
}

/**
 * 4. Genera balance general de rendimiento
 */
function generatePerformanceBalanceData(records: WorkoutRecord[], exercises: Exercise[]) {
  const totalVolume = records.reduce((sum, record) => sum + calculateVolume(record), 0);
  const totalWorkouts = records.length;
  const averageVolumePerWorkout = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;

  // Calcular consistencia (días consecutivos de entrenamiento)
  const sortedDates = [...new Set(records.map(r => format(new Date(r.date), 'yyyy-MM-dd')))].sort();
  let maxConsecutiveDays = 0;
  let currentConsecutiveDays = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentConsecutiveDays++;
    } else {
      maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);
      currentConsecutiveDays = 1;
    }
  }
  maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays);

  const consistencyScore = Math.min(100, (maxConsecutiveDays / 7) * 100);

  // Calcular progreso de fuerza
  const exercisesWithProgress = exercises.filter(exercise => {
    const exerciseRecords = records.filter(r => r.exercise?.name === exercise.name);
    if (exerciseRecords.length < 2) return false;

    const sortedRecords = exerciseRecords.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstWeight = sortedRecords[0].weight;
    const lastWeight = sortedRecords[sortedRecords.length - 1].weight;
    return lastWeight > firstWeight;
  });

  const strengthProgress = exercises.length > 0 ?
    (exercisesWithProgress.length / exercises.length) * 100 : 0;

  // Calcular progreso de volumen
  const recentRecords = records.slice(-10); // Últimos 10 entrenamientos
  const recentVolume = recentRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
  const olderRecords = records.slice(0, -10); // Registros anteriores
  const olderVolume = olderRecords.length > 0 ?
    olderRecords.reduce((sum, r) => sum + calculateVolume(r), 0) / olderRecords.length : 0;

  const volumeProgress = olderVolume > 0 ?
    ((recentVolume / recentRecords.length - olderVolume) / olderVolume) * 100 : 0;

  // Top mejoras
  const topImprovements = exercises.map(exercise => {
    const exerciseRecords = records.filter(r => r.exercise?.name === exercise.name);
    if (exerciseRecords.length < 2) return null;

    const sortedRecords = exerciseRecords.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstWeight = sortedRecords[0].weight;
    const lastWeight = sortedRecords[sortedRecords.length - 1].weight;
    const progressPercentage = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight) * 100 : 0;

    return {
      exerciseName: exercise.name,
      progressPercentage: roundToDecimals(progressPercentage),
      weightGain: lastWeight - firstWeight,
    };
  }).filter(Boolean).sort((a, b) => b!.progressPercentage - a!.progressPercentage).slice(0, 5);

  // Distribución de volumen por categoría
  const volumeByCategory = new Map<string, number>();
  records.forEach(record => {
    const volume = calculateVolume(record);
    const categories = record.exercise?.categories || [];
    categories.forEach(category => {
      volumeByCategory.set(category, (volumeByCategory.get(category) || 0) + volume);
    });
  });

  const volumeDistribution = Array.from(volumeByCategory.entries()).map(([category, volume]) => ({
    category,
    volume: roundToDecimals(volume),
    percentage: roundToDecimals((volume / totalVolume) * 100),
  }));

  // Calcular score de balance
  const strengthScore = strengthProgress;
  const volumeScore = Math.max(0, Math.min(100, volumeProgress + 50)); // Normalizar a 0-100
  const consistencyScoreNormalized = consistencyScore;

  const balanceScore = Math.round((strengthScore + volumeScore + consistencyScoreNormalized) / 3);

  let level: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  let description = '';
  let recommendations: string[] = [];

  if (balanceScore >= 80) {
    level = 'excellent';
    description = 'Excelente rendimiento general. Mantén la consistencia.';
    recommendations = ['Continúa con tu rutina actual', 'Considera aumentar la intensidad gradualmente'];
  } else if (balanceScore >= 60) {
    level = 'good';
    description = 'Buen rendimiento. Hay áreas de mejora.';
    recommendations = ['Enfócate en ejercicios con menor progreso', 'Aumenta la frecuencia de entrenamiento'];
  } else if (balanceScore >= 40) {
    level = 'fair';
    description = 'Rendimiento regular. Necesitas mejorar varios aspectos.';
    recommendations = ['Establece una rutina más consistente', 'Enfócate en la progresión de peso'];
  } else {
    level = 'needs_improvement';
    description = 'Necesitas mejorar significativamente tu rendimiento.';
    recommendations = ['Establece una rutina básica', 'Enfócate en la consistencia antes que la intensidad'];
  }

  return {
    overall: {
      totalVolume: roundToDecimals(totalVolume),
      totalWorkouts,
      averageVolumePerWorkout: roundToDecimals(averageVolumePerWorkout),
      consistencyScore: roundToDecimals(consistencyScore),
      strengthProgress: roundToDecimals(strengthProgress),
      volumeProgress: roundToDecimals(volumeProgress),
    },
    strengthMetrics: {
      totalExercises: exercises.length,
      exercisesWithProgress: exercisesWithProgress.length,
      averageProgressPercentage: roundToDecimals(strengthProgress),
      topImprovements: topImprovements as any[],
    },
    volumeMetrics: {
      weeklyAverage: roundToDecimals(totalVolume / Math.max(1, Math.ceil(totalWorkouts / 7))),
      monthlyTrend: (volumeProgress > 5 ? 'increasing' : volumeProgress < -5 ? 'decreasing' : 'stable') as 'increasing' | 'decreasing' | 'stable',
      volumeDistribution,
    },
    balanceScore: {
      score: balanceScore,
      level,
      description,
      recommendations,
    },
  };
}
