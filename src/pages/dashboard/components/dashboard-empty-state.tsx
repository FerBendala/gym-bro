import { Activity } from 'lucide-react';
import React from 'react';

import { EmptyState } from '../shared';

interface DashboardEmptyStateProps {
  isOnline: boolean;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ isOnline }) => {
  return (
    <EmptyState
      icon={Activity}
      title="No hay datos para mostrar"
      description={
        isOnline
          ? 'Registra algunos entrenamientos para ver tu progreso'
          : 'Sin conexión - No se pueden cargar los datos'
      }
    />
  );
};
