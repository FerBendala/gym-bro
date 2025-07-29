import { Plus } from 'lucide-react';
import React from 'react';

import type { ExerciseListEmptyStateProps } from '../types';

import { Button } from '@/components/button';

/**
 * Estado vacío del ExerciseList cuando no hay ejercicios programados
 */
export const ExerciseListEmptyState: React.FC<ExerciseListEmptyStateProps> = ({
  dayOfWeek,
  isOnline,
  onOpenAdmin,
}) => {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Plus className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        No hay ejercicios programados
      </h3>
      <p className="text-gray-500 mb-4">
        Configura algunos ejercicios para {dayOfWeek}
      </p>
      <Button onClick={onOpenAdmin} disabled={!isOnline}>
        {isOnline ? 'Configurar ejercicios' : 'Sin conexión'}
      </Button>
    </div>
  );
};
