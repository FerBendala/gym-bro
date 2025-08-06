import React from 'react';

import { PageProps } from '../types';

import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';

export const Page: React.FC<PageProps> = ({
  title,
  subtitle,
  children,
  headerActions,
  className,
  showBackButton = false,
  onBackClick,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className={cn(
                MODERN_THEME.components.button.base,
                MODERN_THEME.components.button.variants.ghost,
                MODERN_THEME.components.button.sizes.sm,
                MODERN_THEME.touch.minTarget,
              )}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className={cn(
        MODERN_THEME.animations.fade.in,
        MODERN_THEME.animations.slide.up,
      )}>
        {children}
      </div>
    </div>
  );
};
