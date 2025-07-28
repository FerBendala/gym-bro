import { Target } from 'lucide-react';
import React from 'react';

export const AdvancedEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Target className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        Sin datos para análisis avanzado
      </h3>
      <p className="text-gray-500">
        Registra al menos 10 entrenamientos para obtener métricas avanzadas
      </p>
    </div>
  );
}; 