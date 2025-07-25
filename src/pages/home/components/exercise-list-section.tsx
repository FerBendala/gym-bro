import { ExerciseList } from '@/components/exercise-list';
import { Section } from '@/components/layout';
import type { DayOfWeek } from '@/interfaces';
import React from 'react';

interface ExerciseListSectionProps {
  activeDay: DayOfWeek;
  onOpenAdmin: () => void;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

/**
 * Sección de lista de ejercicios
 */
export const ExerciseListSection: React.FC<ExerciseListSectionProps> = ({
  activeDay,
  onOpenAdmin,
  onGoToHistory
}) => {
  return (
    <Section>
      <ExerciseList
        dayOfWeek={activeDay}
        onOpenAdmin={onOpenAdmin}
        onGoToHistory={onGoToHistory}
      />
    </Section>
  );
}; 