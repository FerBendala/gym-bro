import type { ThemeAlertVariant } from '@/constants/theme/index.constants';
import type { LucideIcon } from 'lucide-react';

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