import type { LucideIcon } from 'lucide-react';

import type { ThemeAlertVariant } from '@/constants/theme';

export interface OfflineWarningProps {
  message?: string;
  className?: string;
  variant?: ThemeAlertVariant;
  icon?: LucideIcon;
  iconClassName?: string;
}

export interface WarningIconProps {
  icon: LucideIcon;
  className?: string;
}

export interface WarningMessageProps {
  message: string;
}
