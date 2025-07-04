import React from 'react';
import { THEME_RESPONSIVE } from '../../constants/theme';
import { useOnlineStatus } from '../../hooks';
import type { DayOfWeek } from '../../interfaces';
import { cn } from '../../utils/functions/style-utils';
import {
  ExerciseListContent,
  ExerciseListEmptyState,
  ExerciseListHeader,
  ExerciseListLoadingState
} from './components';
import { useExerciseList } from './hooks';

export interface ExerciseListProps {
  dayOfWeek: DayOfWeek;
  onOpenAdmin: () => void;
}

/**
 * Componente principal de lista de ejercicios
 * Responsive design con grid adaptativo y spacing móvil optimizado
 */
export const ExerciseList: React.FC<ExerciseListProps> = ({ dayOfWeek, onOpenAdmin }) => {
  const isOnline = useOnlineStatus();
  const { assignments, loading, handleRecordWorkout, handleReorderAssignments, exercisesTrainedToday, workoutRecords } = useExerciseList(dayOfWeek);

  if (loading) {
    return <ExerciseListLoadingState />;
  }

  return (
    <div className={cn(
      THEME_RESPONSIVE.card.spacing,
      THEME_RESPONSIVE.spacing.section.mobile,
      THEME_RESPONSIVE.spacing.section.tablet
    )}>
      <ExerciseListHeader
        dayOfWeek={dayOfWeek}
        isOnline={isOnline}
        onOpenAdmin={onOpenAdmin}
        hasExercises={assignments.length > 0}
      />

      {assignments.length === 0 ? (
        <ExerciseListEmptyState
          dayOfWeek={dayOfWeek}
          isOnline={isOnline}
          onOpenAdmin={onOpenAdmin}
        />
      ) : (
        <div className={cn(
          THEME_RESPONSIVE.grid.cols1,
          'sm:grid-cols-1',
          'lg:grid-cols-2',
          'xl:grid-cols-2',
          THEME_RESPONSIVE.grid.gap
        )}>
          <ExerciseListContent
            assignments={assignments}
            isOnline={isOnline}
            onRecord={handleRecordWorkout}
            onReorder={handleReorderAssignments}
            exercisesTrainedToday={exercisesTrainedToday}
            workoutRecords={workoutRecords}
          />
        </div>
      )}
    </div>
  );
};