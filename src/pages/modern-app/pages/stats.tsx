import React from 'react';
import { ExerciseStats } from '../../../components/exercise-stats';
import { ModernPage, ModernSection } from '../../../components/modern-ui';

/**
 * Página de estadísticas moderna
 */
export const ModernStats: React.FC = () => {
  return (
    <ModernPage
      title="Estadísticas"
      subtitle="Métricas detalladas y análisis"
    >
      <ModernSection>
        <ExerciseStats records={[]} />
      </ModernSection>
    </ModernPage>
  );
}; 