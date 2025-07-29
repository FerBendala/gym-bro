import React from 'react';

import { AdditionalStats, MainStats } from './components';
import { useExerciseStats } from './hooks';
import type { ExerciseStatsProps } from './types';

/**
 * Componente principal del ExerciseStats
 * Orquesta los subcomponentes y maneja la lógica principal usando estadísticas genéricas
 */
export const ExerciseStats: React.FC<ExerciseStatsProps> = ({ records }) => {
  const { stats, isEmpty } = useExerciseStats(records);

  if (isEmpty) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No hay datos suficientes para mostrar estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas principales usando subcomponente modular */}
      <MainStats stats={stats} />

      {/* Estadísticas adicionales usando subcomponente modular */}
      <AdditionalStats stats={stats} />
    </div>
  );
};
