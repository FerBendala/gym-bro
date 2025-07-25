import { Button } from '@/components/button';
import { DAYS } from '@/constants/days.constants';
import { MODERN_THEME } from '@/constants/theme/index.constants';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import type { DaySelectorProps } from '../types';
import { formatDayName, isCurrentDay } from '../utils/date-utils';

interface DaySelectorComponentProps extends DaySelectorProps {
  showDaySelector: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/**
 * Selector de día moderno para el header
 */
export const DaySelector: React.FC<DaySelectorComponentProps> = ({
  activeDay,
  onDayChange,
  showDaySelector,
  onToggle,
  onClose
}) => {
  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggle}
        rightIcon={<ChevronDown className="w-4 h-4" />}
      >
        {formatDayName(activeDay)}
      </Button>

      {showDaySelector && (
        <div className={cn(
          'absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[55] min-w-[200px]',
          MODERN_THEME.animations.slide.down
        )}>
          <div className="p-2">
            {DAYS.map((day) => {
              const isActive = day === activeDay;
              const isCurrentDayValue = isCurrentDay(day);

              return (
                <button
                  key={day}
                  onClick={() => {
                    onDayChange(day);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  )}
                >
                  <span className="font-medium">
                    {formatDayName(day)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isCurrentDayValue && (
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
  );
}; 