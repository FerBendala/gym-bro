import React from 'react';

import { SectionProps } from '../types';

import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  className,
  headerActions,
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
