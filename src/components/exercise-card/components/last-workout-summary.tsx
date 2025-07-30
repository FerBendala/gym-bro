import React from 'react';

import { WorkoutItem } from '@/components/recent-workouts/components/workout-item';
import type { WorkoutRecord } from '@/interfaces';

interface LastWorkoutSummaryProps {
  record?: WorkoutRecord | null;
  compact?: boolean;
}

export const LastWorkoutSummary: React.FC<LastWorkoutSummaryProps> = ({ record, compact = false }) => {
  if (!record) {
    return (
      <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg p-3 text-center text-gray-400 text-xs mb-2">
        Sin registros previos para este ejercicio
      </div>
    );
  }

  // Modo compacto para el nuevo diseño horizontal
  if (compact) {
    // Detectar si tiene series individuales explícitas
    const hasExplicitIndividualSets = record.individualSets && record.individualSets.length > 0;

    // Detectar si probablemente tiene series individuales (para entrenamientos antiguos)
    const hasInferredIndividualSets = !hasExplicitIndividualSets &&
      record.sets > 1 &&
      (record.weight % 1 !== 0 || record.reps % 1 !== 0);

    const showIndividualSets = hasExplicitIndividualSets || hasInferredIndividualSets;

    return (
      <div className="text-right space-y-1">
        {showIndividualSets ? (
          // Mostrar series individuales
          <div className="space-y-1 flex flex-col items-start">
            {(
              // Series explícitas
              record.individualSets!.slice(0, 3).map((set, index) => (
                <div key={index} className="text-sm font-bold text-white flex gap-1">
                  <span className="text-gray-400">S{index + 1}:</span>
                  {set.weight}<span className="text-gray-400">kg</span>
                  <span className="text-gray-600">×</span>
                  {set.reps}<span className="text-gray-400">r</span>
                </div>
              ))
            )}
          </div>
        ) : (
          // Mostrar formato simple
          <div className="space-y-1 flex flex-col items-start">
            <div className="text-sm font-bold text-white">
              {record.weight}<span className="text-gray-400"> kg</span>
              <span className="text-gray-600"> × </span>
              {record.reps}<span className="text-gray-400"> r</span>
              <span className="text-gray-600"> × </span>
              {record.sets}<span className="text-gray-400"> s</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Usamos WorkoutItem pero sin botón de eliminar
  return (
    <div className="mb-2">
      <WorkoutItem record={record} index={0} />
    </div>
  );
};
