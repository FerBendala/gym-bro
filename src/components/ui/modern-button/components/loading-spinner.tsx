import type { ModernButtonSize } from '../types';
import { getLoadingSpinnerClasses } from '../utils';

interface LoadingSpinnerProps {
  size: ModernButtonSize;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size }) => {
  return (
    <div className={getLoadingSpinnerClasses(size)} />
  );
}; 