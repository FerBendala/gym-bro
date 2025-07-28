import type { ThemeSpinnerColor, ThemeSpinnerSize, ThemeSpinnerVariant } from '@/constants/theme/index.constants';

export interface LoadingSpinnerProps {
  size?: ThemeSpinnerSize;
  color?: ThemeSpinnerColor;
  variant?: ThemeSpinnerVariant;
  className?: string;
}

export interface SpinnerSVGProps {
  className: string;
} 