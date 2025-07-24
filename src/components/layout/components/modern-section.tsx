import { MODERN_THEME } from '@/constants/modern-theme';
import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import { ModernSectionProps } from '../types';

export const ModernSection: React.FC<ModernSectionProps> = ({
  title,
  subtitle,
  children,
  className,
  headerActions
}) => {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between">
          {title && (
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          )}
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className={MODERN_THEME.animations.fade.in}>
        {children}
      </div>
    </section>
  );
}; 