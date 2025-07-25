import { Page } from '@/components/layout';
import React from 'react';
import { DaySelector, ExerciseListSection, QuickDayNavigation } from './components';
import { useDaySelector } from './hooks';
import type { ModernHomeProps } from './types';
import { formatDayName, getCurrentDayInfo } from './utils';

/**
 * Página de inicio moderna con navegación de días y lista de ejercicios
 * Optimizada para mobile-first con mejor UX
 */
export const ModernHome: React.FC<ModernHomeProps> = ({
  activeDay,
  onDayChange,
  onOpenAdmin,
  onGoToHistory
}) => {
  const { showDaySelector, toggleDaySelector, closeDaySelector } = useDaySelector();
  const dayInfo = getCurrentDayInfo(activeDay);

  return (
    <Page
      title="Entrenamientos"
      subtitle={`${formatDayName(activeDay)} • ${dayInfo.formattedDate}`}
      headerActions={
        <div className="flex items-center space-x-2">
          <DaySelector
            activeDay={activeDay}
            onDayChange={onDayChange}
            showDaySelector={showDaySelector}
            onToggle={toggleDaySelector}
            onClose={closeDaySelector}
          />
        </div>
      }
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