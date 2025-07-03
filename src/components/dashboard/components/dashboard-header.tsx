import { BarChart3, X } from 'lucide-react';
import React from 'react';
import { THEME_RESPONSIVE, THEME_TABS } from '../../../constants/theme';
import { cn } from '../../../utils/functions';
import { Button } from '../../button';
import { DASHBOARD_TABS } from '../constants';
import type { DashboardHeaderProps } from '../types';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeFilterLabel,
  activeTab,
  onTabChange,
  onClose
}) => {
  return (
    <div className="border-b border-gray-700">
      {/* Header principal */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard de Progreso</h2>
            <p className="text-sm text-gray-400">{timeFilterLabel}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          className={cn(
            THEME_RESPONSIVE.touch.minTarget,
            'md:min-h-auto md:min-w-auto'
          )}
        >
          <X className="w-5 h-5 md:w-4 md:h-4" />
        </Button>
      </div>

      {/* Navegación por tabs */}
      <div className="px-6 pb-4">
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  THEME_TABS.tab.base,
                  isActive ? THEME_TABS.tab.active : THEME_TABS.tab.inactive,
                  'flex-shrink-0 flex items-center space-x-2'
                )}
                title={tab.description}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 