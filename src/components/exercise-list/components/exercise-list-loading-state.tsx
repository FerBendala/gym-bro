import { LoadingSpinner } from '@/components/loading-spinner';
import React from 'react';

/**
 * Estado de carga del ExerciseList usando el LoadingSpinner genérico
 */
export const ExerciseListLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-400 text-sm">Cargando ejercicios...</p>
    </div>
  );
}; 