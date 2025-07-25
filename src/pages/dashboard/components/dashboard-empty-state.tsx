import { Activity } from 'lucide-react';
import React from 'react';
import type { DashboardEmptyStateProps } from '../types';

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ isOnline }) => {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Activity className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        No hay datos para mostrar
      </h3>
      <p className="text-gray-500">
        {isOnline
          ? 'Registra algunos entrenamientos para ver tu progreso'
          : 'Sin conexión - No se pueden cargar los datos'
        }
      </p>
    </div>
  );
}; 