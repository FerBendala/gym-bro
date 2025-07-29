import React, { useState } from 'react';

import {
  ExerciseListContent,
  ExerciseListEmptyState,
  ExerciseListHeader,
  ExerciseListLoadingState,
} from './components';
import { useExerciseList } from './hooks';

import { THEME_RESPONSIVE } from '@/constants/theme';
import type { DayOfWeek } from '@/interfaces';
import { useOnlineStatus } from '@/stores/connection';
import { cn } from '@/utils';

export interface ExerciseListProps {
  dayOfWeek: DayOfWeek;
  onOpenAdmin: () => void;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

/**
 * Componente principal de lista de ejercicios
 * Responsive design con grid adaptativo y spacing móvil optimizado
 */
export const ExerciseList: React.FC<ExerciseListProps> = ({ dayOfWeek, onOpenAdmin, onGoToHistory }) => {
  const isOnline = useOnlineStatus();
  const [isDragModeActive, setIsDragModeActive] = useState(false);
  const { assignments, loading, handleRecordWorkout, handleReorderAssignments, exercisesTrainedToday, workoutRecords } = useExerciseList(dayOfWeek);

  const handleToggleDragMode = () => {
    setIsDragModeActive(!isDragModeActive);
  };

  if (loading) {
    return <ExerciseListLoadingState />;
  }

  return (
    <div className={cn(
      THEME_RESPONSIVE.card.spacing,
      THEME_RESPONSIVE.spacing.section.mobile,
      THEME_RESPONSIVE.spacing.section.tablet,
    )}>
      <ExerciseListHeader
        dayOfWeek={dayOfWeek}
        isOnline={isOnline}
        onOpenAdmin={onOpenAdmin}
        hasExercises={assignments.length > 0}
        isDragModeActive={isDragModeActive}
        onToggleDragMode={handleToggleDragMode}
      />

      {assignments.length === 0 ? (
        <ExerciseListEmptyState
          dayOfWeek={dayOfWeek}
          isOnline={isOnline}
          onOpenAdmin={onOpenAdmin}
        />
      ) : (
        <div className={cn(
          THEME_RESPONSIVE.grid.responsive[1],
          THEME_RESPONSIVE.grid.gap,
        )}>
          <ExerciseListContent
            assignments={assignments}
            isOnline={isOnline}
            onRecord={handleRecordWorkout}
            onReorder={handleReorderAssignments}
            exercisesTrainedToday={exercisesTrainedToday}
            workoutRecords={workoutRecords}
            isDragModeActive={isDragModeActive}
            onGoToHistory={onGoToHistory}
          />
        </div>
      )}
    </div>
  );
};
