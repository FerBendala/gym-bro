import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { ExerciseList } from '../../../components/exercise-list';
import { ModernButton, ModernPage, ModernSection } from '../../../components/modern-ui';
import { DAYS } from '../../../constants/days';
import { MODERN_THEME } from '../../../constants/modern-theme';
import type { DayOfWeek } from '../../../interfaces';
import { cn } from '../../../utils/functions/style-utils';

interface ModernHomeProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  onOpenAdmin: () => void;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

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
  const [showDaySelector, setShowDaySelector] = useState(false);

  // Obtener información del día actual
  const getCurrentDayInfo = () => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const isToday = activeDay === today;
    const dayIndex = DAYS.indexOf(activeDay);

    return {
      isToday,
      dayIndex,
      formattedDate: new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  };

  const dayInfo = getCurrentDayInfo();

  return (
    <ModernPage
      title="Entrenamientos"
      subtitle={`${activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} • ${dayInfo.formattedDate}`}
      headerActions={
        <div className="flex items-center space-x-2">
          {/* Selector de día moderno */}
          <div className="relative">
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => setShowDaySelector(!showDaySelector)}
              rightIcon={<ChevronDown className="w-4 h-4" />}
            >
              {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}
            </ModernButton>

            {showDaySelector && (
              <div className={cn(
                'absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[55] min-w-[200px]',
                MODERN_THEME.animations.slide.down
              )}>
                <div className="p-2">
                  {DAYS.map((day) => {
                    const isActive = day === activeDay;
                    const isCurrentDay = day === new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          onDayChange(day);
                          setShowDaySelector(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        )}
                      >
                        <span className="font-medium">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {isCurrentDay && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                          {isActive && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      }
    >
      {/* Navegación rápida entre días */}
      <ModernSection title="" className="mt-8">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const isActive = day === activeDay;
            const isToday = day === new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

            return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200',
                  MODERN_THEME.touch.tap,
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                )}
              >
                <span className="text-xs font-medium mb-1">
                  {day.slice(0, 3).toUpperCase()}
                </span>
                {isToday && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
                {!isToday && (
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isActive ? 'bg-blue-400' : 'bg-gray-600'
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </ModernSection>

      {/* Lista de ejercicios */}
      <ModernSection>
        <ExerciseList
          dayOfWeek={activeDay}
          onOpenAdmin={onOpenAdmin}
          onGoToHistory={onGoToHistory}
        />
      </ModernSection>


    </ModernPage>
  );
}; 