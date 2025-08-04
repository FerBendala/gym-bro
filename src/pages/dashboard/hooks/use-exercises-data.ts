import { useMemo, useState } from 'react';

import { KNOWN_EXERCISE_DISTRIBUTIONS } from '@/constants/exercise.constants';
import type { WorkoutRecord } from '@/interfaces';
import { calculateExerciseProgress } from '@/utils';

interface ExerciseAnalysis {
  name: string;
  categories: string[];
  totalVolume: number;
  maxWeight: number;
  avgWeight: number;
  progress: number;
  progressPercent: number;
  frequency: number;
  intensity: number;
  firstWeight: number;
  lastWeight: number;
  lastDate: Date;
}

interface CategoryWithCount {
  id: string;
  name: string;
  count: number;
}

interface GlobalMetrics {
  totalVolume: number;
  avgProgress: number;
  exercisesImproving: number;
  maxWeightExercise: { maxWeight: number; name: string };
  totalSessions: number;
}

export const useExercisesData = (records: WorkoutRecord[]) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Función para obtener la categoría dominante de un ejercicio
  const getDominantCategory = (exerciseName: string): string => {
    const distribution = KNOWN_EXERCISE_DISTRIBUTIONS[exerciseName];
    if (distribution) {
      // Encontrar la categoría con mayor porcentaje
      const dominantCategory = Object.entries(distribution).reduce((max, [category, percentage]) =>
        percentage > max.percentage ? { category, percentage } : max,
      { category: 'Sin categoría', percentage: 0 },
      );
      return dominantCategory.category;
    }
    // Si no hay distribución conocida, usar la primera categoría
    return 'Sin categoría';
  };

  const exerciseAnalysis = useMemo((): ExerciseAnalysis[] => {
    if (records.length === 0) return [];

    // Agrupar por ejercicio
    const exerciseGroups = records.reduce((acc, record) => {
      const exerciseName = record.exercise?.name || 'Ejercicio desconocido';
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, WorkoutRecord[]>);

    // Analizar cada ejercicio
    return Object.entries(exerciseGroups).map(([exerciseName, exerciseRecords]) => {
      const totalVolume = exerciseRecords.reduce((sum, record) =>
        sum + (record.weight * record.reps * record.sets), 0,
      );

      const maxWeight = Math.max(...exerciseRecords.map(r => r.weight));
      const avgWeight = exerciseRecords.reduce((sum, r) => sum + r.weight, 0) / exerciseRecords.length;

      // Calcular frecuencia como sesiones únicas por fecha
      const uniqueSessions = new Set(exerciseRecords.map(r => r.date.toDateString()));
      const frequency = uniqueSessions.size;

      // Calcular intensidad correctamente (maxWeight / avgWeight * 100, pero limitado a 100%)
      const intensity = Math.min((maxWeight / avgWeight) * 100, 100);

      const { absoluteProgress: progress, percentProgress: progressPercent } = calculateExerciseProgress(exerciseRecords);

      const dominantCategory = getDominantCategory(exerciseName);
      const categories = [dominantCategory];

      return {
        name: exerciseName,
        categories,
        totalVolume,
        maxWeight,
        avgWeight,
        progress,
        progressPercent,
        frequency,
        intensity,
        firstWeight: exerciseRecords[0].weight,
        lastWeight: exerciseRecords[exerciseRecords.length - 1].weight,
        lastDate: new Date(Math.max(...exerciseRecords.map(r => r.date.getTime()))),
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [records]);

  const categoriesWithCount = useMemo((): CategoryWithCount[] => {
    const categories = [
      { id: 'all', name: 'Todas', count: exerciseAnalysis.length },
    ];

    const uniqueCategories = Array.from(new Set(exerciseAnalysis.flatMap(ex => ex.categories)));
    uniqueCategories.forEach(category => {
      const count = exerciseAnalysis.filter(ex => ex.categories.includes(category)).length;
      if (count > 0) {
        categories.push({ id: category, name: category, count });
      }
    });

    return categories;
  }, [exerciseAnalysis]);

  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'all') {
      return exerciseAnalysis;
    }
    return exerciseAnalysis.filter(ex => ex.categories.includes(selectedCategory));
  }, [exerciseAnalysis, selectedCategory]);

  const allExercises = filteredExercises;

  const unknownRecords = records.filter(record =>
    !record.exercise?.name || record.exercise.name === 'Ejercicio desconocido',
  );

  const globalMetrics = useMemo((): GlobalMetrics => {
    const totalVolume = allExercises.reduce((sum, ex) => sum + ex.totalVolume, 0);
    const avgProgress = allExercises.length > 0 ? allExercises.reduce((sum, ex) => sum + ex.progressPercent, 0) / allExercises.length : 0;
    const exercisesImproving = allExercises.filter(ex => ex.progressPercent > 0).length;
    const maxWeightExercise = allExercises.reduce((max, ex) => ex.maxWeight > max.maxWeight ? ex : max, { maxWeight: 0, name: 'N/A' });
    const totalSessions = allExercises.reduce((sum, ex) => sum + ex.frequency, 0);

    return {
      totalVolume,
      avgProgress,
      exercisesImproving,
      maxWeightExercise,
      totalSessions,
    };
  }, [allExercises]);

  return {
    exerciseAnalysis,
    categoriesWithCount,
    selectedCategory,
    setSelectedCategory,
    allExercises,
    unknownRecords,
    globalMetrics,
  };
};
