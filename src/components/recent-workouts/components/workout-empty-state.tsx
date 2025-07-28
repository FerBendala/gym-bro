import { THEME_WORKOUTS } from '@/constants/theme/index.constants';
import { Dumbbell } from 'lucide-react';
import React from 'react';

/**
 * Estado vacío para cuando no hay entrenamientos recientes
 * Usa THEME_WORKOUTS.emptyState
 */
export const WorkoutEmptyState: React.FC = () => {
  return (
    <div className={THEME_WORKOUTS.emptyState.container}>
      <div className={THEME_WORKOUTS.emptyState.iconWrapper}>
        <Dumbbell className={THEME_WORKOUTS.emptyState.icon} />
      </div>
      <p className={THEME_WORKOUTS.emptyState.message}>
        No hay entrenamientos recientes
      </p>
    </div>
  );
}; 