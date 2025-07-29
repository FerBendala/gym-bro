import React from 'react';

import { TooltipContent, TooltipTrigger } from './components';
import { TOOLTIP_DEFAULTS } from './constants';
import { useTooltip } from './hooks';
import { TooltipProps } from './types';

import { cn } from '@/utils';

/**
 * Componente de tooltip moderno con animaciones suaves
 * Soporta diferentes posiciones y triggers
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = TOOLTIP_DEFAULTS.POSITION,
  trigger = TOOLTIP_DEFAULTS.TRIGGER,
  showIcon = TOOLTIP_DEFAULTS.SHOW_ICON,
  delay = TOOLTIP_DEFAULTS.DELAY,
  className,
}) => {
  const {
    isVisible,
    finalPosition,
    triggerRef,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  } = useTooltip({ position, trigger, delay });

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <TooltipTrigger showIcon={showIcon}>
        {children}
      </TooltipTrigger>

      <TooltipContent
        content={content}
        position={finalPosition}
        isVisible={isVisible}
      />
    </div>
  );
};
