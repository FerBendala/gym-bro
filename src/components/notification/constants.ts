import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

import type { NotificationType } from '@/stores/types';

export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const NOTIFICATION_DURATIONS: Record<NotificationType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

export const NOTIFICATION_BACKGROUNDS: Record<NotificationType, string> = {
  success: 'bg-gradient-to-r from-green-500 to-green-600 border-green-400',
  error: 'bg-gradient-to-r from-red-500 to-red-600 border-red-400',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400',
  info: 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400',
};

export const ANIMATION_DURATION = 300;
export const EXIT_ANIMATION_DELAY = 300;
