import { BarChart3 } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import type { DashboardHeaderProps } from '../types';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeFilterLabel,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard de Progreso</h2>
          <p className="text-sm text-gray-400">{timeFilterLabel}</p>
        </div>
      </div>
      <Button variant="ghost" onClick={onClose}>
        ×
      </Button>
    </div>
  );
}; 