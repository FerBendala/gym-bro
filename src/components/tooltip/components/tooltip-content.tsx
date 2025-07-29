import React from 'react';

import { ARROW_CLASSES, POSITION_CLASSES } from '../constants';
import { TooltipContentProps } from '../types';
import { getTooltipStyles } from '../utils';

import { cn } from '@/utils';

export const TooltipContent: React.FC<TooltipContentProps> = ({
  content,
  position,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute z-[80] px-4 py-3 text-sm text-white rounded-lg shadow-lg pointer-events-none',
        'bg-gray-800 border border-gray-700',
        'backdrop-blur-sm',
        'animate-tooltip',
        POSITION_CLASSES[position],
      )}
      style={getTooltipStyles()}
    >
      {content}

      {/* Flecha */}
      <div
        className={cn(
          'absolute w-0 h-0 border-4',
          ARROW_CLASSES[position],
        )}
      />
    </div>
  );
};
