/**
 * Constantes para el componente ModernButton
 */

export const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
} as const;

export const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-gray-600 hover:bg-gray-700 text-white',
  ghost: 'hover:bg-gray-700 text-white'
} as const;

export const BUTTON_BASE_CLASSES = [
  'inline-flex items-center justify-center',
  'font-medium rounded-lg',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'active:scale-95'
].join(' ');

export const LOADING_SPINNER_CLASSES = [
  'animate-spin rounded-full border-2 border-current border-t-transparent'
].join(' '); 