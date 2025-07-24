import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils/functions/style-utils';
import { Dumbbell } from 'lucide-react';
import React from 'react';

interface TopNavigationProps {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  title = 'Gym Tracker',
  subtitle,
  headerActions,
  showBackButton = false,
  onBackClick
}) => {
  return (
    <header className={cn(
      MODERN_THEME.navigation.topNav.container,
      MODERN_THEME.animations.transition.normal,
      "sticky top-0 z-50 !pt-0"
    )}>
      <div className={MODERN_THEME.navigation.topNav.content}>
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className={cn(
                MODERN_THEME.components.button.base,
                MODERN_THEME.components.button.variants.ghost,
                MODERN_THEME.components.button.sizes.sm,
                MODERN_THEME.touch.minTarget
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

          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={cn(
                MODERN_THEME.navigation.topNav.title,
                MODERN_THEME.animations.transition.normal
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {headerActions && (
          <div className={MODERN_THEME.navigation.topNav.actions}>
            {headerActions}
          </div>
        )}
      </div>
    </header>
  );
}; 