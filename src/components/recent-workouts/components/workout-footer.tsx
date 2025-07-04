import React from 'react';
import { THEME_WORKOUTS } from '../../../constants/theme';

interface WorkoutFooterProps {
  recordCount: number;
  maxRecords?: number;
}

/**
 * Footer para RecentWorkouts que muestra información sobre el límite
 * Usa THEME_WORKOUTS.footer
 */
export const WorkoutFooter: React.FC<WorkoutFooterProps> = ({
  recordCount,
  maxRecords = 10
}) => {
  if (recordCount < maxRecords) return null;

  return (
    <div className={THEME_WORKOUTS.footer.container}>
      <p className={THEME_WORKOUTS.footer.message}>
        Mostrando los {maxRecords} entrenamientos más recientes
      </p>
    </div>
  );
}; 