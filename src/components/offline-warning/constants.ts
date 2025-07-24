import { Clock } from 'lucide-react';

export const OFFLINE_WARNING_DEFAULTS = {
  message: 'Sin conexión. Los datos mostrados pueden estar desactualizados.',
  variant: 'warning' as const,
  icon: Clock,
  iconClassName: 'w-3.5 h-3.5 text-yellow-400',
  containerClassName: 'py-2 px-3',
  messageClassName: 'text-yellow-400 text-xs'
} as const;

export const WARNING_LAYOUT_CLASSES = {
  container: 'flex items-center space-x-2'
} as const; 