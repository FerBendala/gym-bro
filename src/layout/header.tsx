import { BarChart3, Settings } from 'lucide-react';
import React from 'react';
import { Button } from '../components/button';
import { THEME_RESPONSIVE } from '../constants/theme';
import { cn } from '../utils/functions/style-utils';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenDashboard }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className={cn(
        THEME_RESPONSIVE.container.base,
        THEME_RESPONSIVE.container.maxWidths.xl,
        'flex items-center justify-between py-3'
      )}>
        <h1 className={cn(
          THEME_RESPONSIVE.typography.h2.mobile,
          THEME_RESPONSIVE.typography.h2.tablet,
          THEME_RESPONSIVE.typography.h2.weight,
          THEME_RESPONSIVE.typography.h2.leading,
          'text-white'
        )}>
          Gym Tracker
        </h1>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDashboard}
            className={cn(
              THEME_RESPONSIVE.touch.minTarget,
              'md:min-h-auto md:min-w-auto'
            )}
          >
            <BarChart3 className="w-5 h-5 md:w-4 md:h-4" />
            <span className={cn(
              THEME_RESPONSIVE.visibility.tabletUp,
              'ml-2'
            )}>
              Dashboard
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAdmin}
            className={cn(
              THEME_RESPONSIVE.touch.minTarget,
              'md:min-h-auto md:min-w-auto'
            )}
          >
            <Settings className="w-5 h-5 md:w-4 md:h-4" />
            <span className={cn(
              THEME_RESPONSIVE.visibility.tabletUp,
              'ml-2'
            )}>
              Configurar
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};