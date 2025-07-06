import { useMemo, useState } from 'react';
import { exerciseBelongsToMuscleGroup } from '../../../constants';
import type { WorkoutRecord } from '../../../interfaces';
import { filterRecordsByTime, getTimeFilterLabel } from '../../../utils/functions/date-filters';
import { DEFAULT_DASHBOARD_TAB } from '../constants';
import type { DashboardTab, FilterType, TimeFilter } from '../types';

export const useDashboardFilters = (workoutRecords: WorkoutRecord[]) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_DASHBOARD_TAB);

  const filteredRecords = useMemo(() => {
    let filtered = workoutRecords;

    // Filtrar por tipo de filtro
    if (filterType === 'exercise' && selectedExercise !== 'all') {
      // Filtrar por ejercicio específico
      filtered = filtered.filter(record => record.exerciseId === selectedExercise);
    } else if (filterType === 'muscle-group' && selectedMuscleGroup !== 'all') {
      // Filtrar por grupo muscular
      filtered = filtered.filter(record => {
        if (!record.exercise?.categories) return false;
        return exerciseBelongsToMuscleGroup(record.exercise.categories, selectedMuscleGroup);
      });
    }

    // Filtrar por tiempo
    filtered = filterRecordsByTime(filtered, timeFilter);

    return filtered;
  }, [workoutRecords, selectedExercise, selectedMuscleGroup, filterType, timeFilter]);

  const timeFilterLabel = useMemo(() => {
    return getTimeFilterLabel(timeFilter);
  }, [timeFilter]);

  // Función para cambiar el tipo de filtro y resetear valores
  const handleFilterTypeChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
    if (newFilterType === 'all') {
      setSelectedExercise('all');
      setSelectedMuscleGroup('all');
    } else if (newFilterType === 'exercise') {
      setSelectedMuscleGroup('all');
    } else if (newFilterType === 'muscle-group') {
      setSelectedExercise('all');
    }
  };

  return {
    selectedExercise,
    selectedMuscleGroup,
    filterType,
    timeFilter,
    activeTab,
    filteredRecords,
    timeFilterLabel,
    setSelectedExercise,
    setSelectedMuscleGroup,
    setFilterType: handleFilterTypeChange,
    setTimeFilter,
    setActiveTab
  };
}; 