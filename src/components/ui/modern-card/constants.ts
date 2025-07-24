/**
 * Constantes para el componente ModernCard
 */

export const CARD_VARIANTS = {
  default: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50',
  success: 'bg-green-800/30 backdrop-blur-sm border border-green-600/50',
  warning: 'bg-yellow-800/30 backdrop-blur-sm border border-yellow-600/50',
  danger: 'bg-red-800/30 backdrop-blur-sm border border-red-600/50',
  info: 'bg-blue-800/30 backdrop-blur-sm border border-blue-600/50'
} as const;

export const CARD_PADDING = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
} as const;

export const CARD_BASE_CLASSES = [
  'rounded-xl',
  'transition-all duration-200',
  'hover:shadow-lg',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/50'
].join(' ');

export const CARD_HEADER_CLASSES = 'flex items-start justify-between mb-4';
export const CARD_CONTENT_CLASSES = 'space-y-4';
export const CARD_FOOTER_CLASSES = [
  'flex items-center justify-between pt-4 mt-4',
  'border-t border-gray-700/50'
].join(' ');

export const STATS_CARD_ICON_CLASSES = 'p-3 bg-blue-600/20 rounded-full';
export const EXERCISE_CARD_COMPLETED_ICON_CLASSES = [
  'w-6 h-6 bg-green-500 rounded-full',
  'flex items-center justify-center'
].join(' '); 