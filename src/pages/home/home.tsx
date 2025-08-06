import React from 'react';

import { ExerciseListSection, QuickDayNavigation } from './components';
import type { ModernHomeProps } from './types';
import { formatDayName, getSelectedDayInfo } from './utils';

import { Page } from '@/components/layout';

/**
 * Página de inicio moderna con navegación de días y lista de ejercicios
 * Optimizada para mobile-first con mejor UX
 */
export const ModernHome: React.FC<ModernHomeProps> = ({
  activeDay,
  onDayChange,
  onOpenAdmin,
  onGoToHistory,
}) => {
  const selectedDayInfo = getSelectedDayInfo(activeDay);

  return (
    <Page
      title="Entrenamientos"
      subtitle={`${formatDayName(activeDay)} • ${selectedDayInfo.formattedDate}`}
    >
      <QuickDayNavigation
        activeDay={activeDay}
        onDayChange={onDayChange}
      />

      <ExerciseListSection
        activeDay={activeDay}
        onOpenAdmin={onOpenAdmin}
        onGoToHistory={onGoToHistory}
      />
    </Page>
  );
};
