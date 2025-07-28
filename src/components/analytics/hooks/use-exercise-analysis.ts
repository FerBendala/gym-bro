import type { WorkoutRecord } from '@/interfaces';
import { calculateExerciseProgress } from '@/utils';
import { useMemo } from 'react';

interface ExerciseAnalysis {
  name: string;
  categories: string[];
  totalVolume: number;
  maxWeight: number;
  avgWeight: number;
  progress: number;
  progressPercent: number;
  frequency: number;
  firstWeight: number;
  lastWeight: number;
  lastDate: Date;
}

interface CategoryWithCount {
  id: string;
  name: string;
  count: number;
}

/**
 * Hook para análisis de ejercicios
 */
export const useExerciseAnalysis = (records: WorkoutRecord[], selectedCategory: string) => {
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
        sum + (record.weight * record.reps * record.sets), 0
      );

      const maxWeight = Math.max(...exerciseRecords.map(r => r.weight));
      const avgWeight = exerciseRecords.reduce((sum, r) => sum + r.weight, 0) / exerciseRecords.length;

      // Usar la función utilitaria para calcular progreso
      const { absoluteProgress: progress, percentProgress: progressPercent, first1RM, last1RM } = calculateExerciseProgress(exerciseRecords);

      const frequency = exerciseRecords.length;
      const categories = exerciseRecords[0].exercise?.categories || ['Sin categoría'];

      return {
        name: exerciseName,
        categories,
        totalVolume,
        maxWeight,
        avgWeight,
        progress,
        progressPercent,
        frequency,
        firstWeight: first1RM,
        lastWeight: last1RM,
        lastDate: new Date(Math.max(...exerciseRecords.map(r => r.date.getTime())))
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [records]);

  // Crear lista de categorías con contador
  const categoriesWithCount = useMemo((): CategoryWithCount[] => {
    const categories = [
      { id: 'all', name: 'Todas', count: exerciseAnalysis.length }
    ];

    // Contar ejercicios por categoría
    const uniqueCategories = Array.from(new Set(exerciseAnalysis.flatMap(ex => ex.categories)));
    uniqueCategories.forEach(category => {
      const count = exerciseAnalysis.filter(ex => ex.categories.includes(category)).length;
      if (count > 0) {
        categories.push({ id: category, name: category, count });
      }
    });

    // Añadir categoría "Sin categoría" si existen ejercicios sin categoría
    const uncategorizedCount = exerciseAnalysis.filter(ex => ex.categories.includes('Sin categoría')).length;
    if (uncategorizedCount > 0) {
      categories.push({ id: 'Sin categoría', name: 'Sin categoría', count: uncategorizedCount });
    }

    return categories;
  }, [exerciseAnalysis]);

  // Filtrar ejercicios por categoría seleccionada
  const filteredExercises = useMemo((): ExerciseAnalysis[] => {
    if (selectedCategory === 'all') {
      return exerciseAnalysis;
    }
    return exerciseAnalysis.filter(ex => ex.categories.includes(selectedCategory));
  }, [exerciseAnalysis, selectedCategory]);

  // Contar registros sin información de ejercicio
  const unknownRecords = useMemo(() =>
    records.filter(record =>
      !record.exercise || !record.exercise.name || record.exercise.name === 'Ejercicio desconocido'
    ), [records]
  );

  return {
    exerciseAnalysis,
    categoriesWithCount,
    filteredExercises,
    unknownRecords
  };
}; 