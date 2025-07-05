import { BarChart3 } from 'lucide-react';
import React from 'react';
import { MODERN_THEME } from '../../../constants/modern-theme';
import { cn } from '../../../utils/functions';
import { DASHBOARD_TABS } from '../constants';
import type { DashboardTab } from '../types';

interface DashboardTabNavigationProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  timeFilterLabel: string;
}

/**
 * Navegación de tabs del dashboard optimizada para páginas completas
 * Diseño mobile-first con scroll horizontal en móvil
 */
export const DashboardTabNavigation: React.FC<DashboardTabNavigationProps> = ({
  activeTab,
  onTabChange,
  timeFilterLabel
}) => {
  return (
    <div className="space-y-4">
      {/* Header informativo */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Dashboard de Progreso</h2>
          <p className="text-sm text-gray-400">{timeFilterLabel}</p>
        </div>
      </div>

      {/* Navegación por tabs moderna */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-1 overflow-x-auto scrollbar-none">
        <div className="flex space-x-1 min-w-max">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap',
                  MODERN_THEME.touch.tap,
                  MODERN_THEME.accessibility.focusRing,
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                )}
                title={tab.description}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 