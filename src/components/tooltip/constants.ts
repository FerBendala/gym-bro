import { TooltipPosition } from './types';

export const TOOLTIP_DEFAULTS = {
  POSITION: 'top' as TooltipPosition,
  TRIGGER: 'hover' as const,
  DELAY: 300,
  SHOW_ICON: false,
  TOOLTIP_WIDTH: 320,
  TOOLTIP_HEIGHT: 120,
  MARGIN: 20,
  MAX_WIDTH: '320px',
  MIN_WIDTH: '200px'
} as const;

export const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
} as const;

export const ARROW_CLASSES: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
} as const; 