import { Section } from '@/components/layout';
import { DAYS } from '@/constants/days';
import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import type { QuickDayNavigationProps } from '../types';
import { getDayAbbreviation, isCurrentDay } from '../utils/date-utils';

/**
 * Navegación rápida entre días
 */
export const QuickDayNavigation: React.FC<QuickDayNavigationProps> = ({
  activeDay,
  onDayChange
}) => {
  return (
    <Section title="" className="mt-8">
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const isActive = day === activeDay;
          const isToday = isCurrentDay(day);

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
                {getDayAbbreviation(day)}
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
    </Section>
  );
}; 