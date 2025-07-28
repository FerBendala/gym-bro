import { Target } from 'lucide-react';
import React from 'react';

interface ExercisesEmptyStateProps {
  hasUnknownRecords?: boolean;
  unknownRecordsCount?: number;
}

export const ExercisesEmptyState: React.FC<ExercisesEmptyStateProps> = ({
  hasUnknownRecords = false,
  unknownRecordsCount = 0
}) => {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Target className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        {hasUnknownRecords ? 'No se encontró información de ejercicios' : 'Sin datos para análisis de ejercicios'}
      </h3>
      <p className="text-gray-500 mb-4">
        {hasUnknownRecords
          ? 'Los registros de entrenamientos no tienen información de ejercicios asociada'
          : 'Registra entrenamientos para ver análisis detallado por ejercicio'
        }
      </p>
      {hasUnknownRecords && unknownRecordsCount > 0 && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-sm">
          <p className="text-yellow-300">
            Se encontraron {unknownRecordsCount} registros sin información de ejercicio.
            Verifica que los ejercicios estén correctamente configurados.
          </p>
        </div>
      )}
    </div>
  );
}; 