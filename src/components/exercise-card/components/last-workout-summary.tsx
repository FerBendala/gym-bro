import React from 'react';

import { WorkoutItem } from '@/components/recent-workouts/components/workout-item';
import type { WorkoutRecord } from '@/interfaces';

import { Layers, Target, Zap } from 'lucide-react';

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
    const volume = record.weight * record.reps * record.sets;

    // Detectar si tiene series individuales explícitas
    const hasExplicitIndividualSets = record.individualSets && record.individualSets.length > 0;

    // Detectar si probablemente tiene series individuales (para entrenamientos antiguos)
    const hasInferredIndividualSets = !hasExplicitIndividualSets &&
      record.sets > 1 &&
      (record.weight % 1 !== 0 || record.reps % 1 !== 0);

    const showIndividualSets = hasExplicitIndividualSets || hasInferredIndividualSets;

    return (
      <div className="text-left space-y-1">
        {showIndividualSets ? (
          // Mostrar series individuales con formato simplificado
          <div className="space-y-1">
            {hasExplicitIndividualSets && (
              // Series explícitas con formato simplificado
              record.individualSets!.slice(0, 2).map((set, index) => (
                <div key={index} className="text-xs text-white font-medium flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">{set.weight}</span>
                  <Target className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">{set.reps}</span>
                  <span className="text-gray-400 text-xs ml-1">
                    ({(set.weight * set.reps).toFixed(0)}kg)
                  </span>
                </div>
              ))
            )}
            <div className="text-xs text-gray-400 font-medium">
              {volume.toFixed(0)}kg total
            </div>
          </div>
        ) : (
          // Mostrar formato simple mejorado
          <div className="space-y-1">
            <div className="text-sm font-bold text-white flex items-center space-x-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">{record.weight}</span>
              <Target className="w-3 h-3 text-green-400" />
              <span className="text-green-400">{record.reps}</span>
              <Layers className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400">{record.sets}</span>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {volume.toFixed(0)}kg total
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
