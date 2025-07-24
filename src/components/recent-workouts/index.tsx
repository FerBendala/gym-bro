import { THEME_WORKOUTS } from '@/constants/theme';
import React from 'react';
import { WorkoutEmptyState, WorkoutFooter, WorkoutItem } from './components';
import { useRecentWorkouts } from './hooks';
import type { RecentWorkoutsProps } from './types';

/**
 * Componente para mostrar entrenamientos recientes
 * Arquitectura modular usando THEME_WORKOUTS y utilidades genéricas
 * Incluye funcionalidad de eliminación de entrenamientos
 */
export const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({
  records,
  maxRecords = 10,
  onDeleteRecord
}) => {
  const {
    displayRecords,
    hasRecords,
    recordCount
  } = useRecentWorkouts({ records, maxRecords });

  if (!hasRecords) {
    return <WorkoutEmptyState />;
  }

  return (
    <div className={THEME_WORKOUTS.container}>
      {displayRecords.map((record, index) => (
        <WorkoutItem
          key={record.id || index}
          record={record}
          index={index}
          onDelete={onDeleteRecord}
        />
      ))}

      <WorkoutFooter
        recordCount={recordCount}
        maxRecords={maxRecords}
      />
    </div>
  );
};