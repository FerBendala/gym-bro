import { useMemo, useState } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { filterRecordsByTime, getTimeFilterLabel } from '../../../utils/functions/date-filters';
import type { TimeFilter } from '../types';

export const useDashboardFilters = (workoutRecords: WorkoutRecord[]) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const filteredRecords = useMemo(() => {
    let filtered = workoutRecords;

    // Filtrar por ejercicio
    if (selectedExercise !== 'all') {
      filtered = filtered.filter(record => record.exerciseId === selectedExercise);
    }

    // Filtrar por tiempo
    filtered = filterRecordsByTime(filtered, timeFilter);

    return filtered;
  }, [workoutRecords, selectedExercise, timeFilter]);

  const timeFilterLabel = useMemo(() => {
    return getTimeFilterLabel(timeFilter);
  }, [timeFilter]);

  return {
    selectedExercise,
    timeFilter,
    filteredRecords,
    timeFilterLabel,
    setSelectedExercise,
    setTimeFilter
  };
}; 