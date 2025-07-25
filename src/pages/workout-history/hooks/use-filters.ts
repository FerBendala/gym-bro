import { useMemo, useState } from 'react';
import { WORKOUT_HISTORY_CONSTANTS } from '../constants';
import type { FilterState, WorkoutRecordWithExercise } from '../types';

export const useFilters = (records: WorkoutRecordWithExercise[], initialFilter?: { exerciseId?: string; exerciseName?: string } | null) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: initialFilter?.exerciseName || '',
    selectedExercise: initialFilter?.exerciseId || 'all',
    selectedCategory: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const filteredAndSortedRecords = useMemo(() => {
    const filtered = records.filter(record => {
      // Filtro por término de búsqueda
      if (filters.searchTerm && !record.exercise?.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por ejercicio específico
      if (filters.selectedExercise !== 'all' && record.exerciseId !== filters.selectedExercise) {
        return false;
      }

      // Filtro por categoría
      if (filters.selectedCategory !== 'all' && !record.exercise?.categories?.includes(filters.selectedCategory)) {
        return false;
      }

      // Filtro por fecha desde
      if (filters.dateFrom && record.date < filters.dateFrom) {
        return false;
      }

      // Filtro por fecha hasta
      if (filters.dateTo && record.date > filters.dateTo) {
        return false;
      }

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'exercise':
          comparison = (a.exercise?.name || '').localeCompare(b.exercise?.name || '');
          break;
        case 'weight':
          comparison = a.weight - b.weight;
          break;
        case 'volume':
          comparison = (a.weight * a.reps * a.sets) - (b.weight * b.reps * b.sets);
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [records, filters]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchTerm !== '' ||
      filters.selectedExercise !== 'all' ||
      filters.selectedCategory !== 'all' ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined;
  }, [filters]);

  const displayRecords = useMemo(() => {
    if (hasActiveFilters) {
      return filteredAndSortedRecords;
    } else {
      return filteredAndSortedRecords.slice(0, WORKOUT_HISTORY_CONSTANTS.DEFAULT_RECORDS_LIMIT);
    }
  }, [filteredAndSortedRecords, hasActiveFilters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedExercise: 'all',
      selectedCategory: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredAndSortedRecords,
    displayRecords,
    hasActiveFilters
  };
}; 