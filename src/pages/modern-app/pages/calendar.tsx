import React from 'react';
import { ModernPage, ModernSection } from '../../../components/modern-ui';
import { WorkoutCalendar } from '../../../components/workout-calendar';

/**
 * Página de calendario moderna
 */
export const ModernCalendar: React.FC = () => {
  return (
    <ModernPage
      title="Calendario"
      subtitle="Vista mensual de entrenamientos"
    >
      <ModernSection>
        <WorkoutCalendar records={[]} />
      </ModernSection>
    </ModernPage>
  );
}; 