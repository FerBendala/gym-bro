import React from 'react';
import { groupExercisesByCategory } from '../../../utils/functions/select-utils';
import { Select } from '../../select';
import type { DashboardFiltersProps } from '../types';

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedExercise,
  timeFilter,
  exercises,
  isOnline,
  onExerciseChange,
  onTimeFilterChange
}) => {
  // Crear grupos de ejercicios con la opción "Todos" al inicio
  const exerciseGroups = [
    {
      label: 'Filtros generales',
      options: [{ value: 'all', label: 'Todos los ejercicios' }]
    },
    ...groupExercisesByCategory(exercises)
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select
        label="Ejercicio"
        value={selectedExercise}
        onChange={(e) => onExerciseChange(e.target.value)}
        groups={exerciseGroups}
        disabled={!isOnline}
      />
      <Select
        label="Período"
        value={timeFilter}
        onChange={(e) => onTimeFilterChange(e.target.value as any)}
        options={[
          { value: 'week', label: 'Esta semana' },
          { value: 'month', label: 'Este mes' },
          { value: 'all', label: 'Todo el tiempo' }
        ]}
        disabled={!isOnline}
      />
    </div>
  );
}; 