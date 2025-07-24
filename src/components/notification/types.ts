import type { NotificationType } from '@/stores/types';
import { LucideIcon } from 'lucide-react';

export interface NotificationProps {
  className?: string;
}

export interface NotificationContentProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

export interface NotificationCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export interface NotificationAnimationState {
  isVisible: boolean;
  isExiting: boolean;
}

export interface NotificationUtils {
  getNotificationIcon: (type: NotificationType) => LucideIcon;
  getNotificationDuration: (type: NotificationType) => number;
  getNotificationBackground: (type: NotificationType) => string;
} 