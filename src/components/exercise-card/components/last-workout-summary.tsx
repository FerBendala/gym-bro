import React from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { WorkoutItem } from '../../recent-workouts/components/workout-item';

interface LastWorkoutSummaryProps {
  record?: WorkoutRecord | null;
}

export const LastWorkoutSummary: React.FC<LastWorkoutSummaryProps> = ({ record }) => {
  if (!record) {
    return (
      <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg p-3 text-center text-gray-400 text-xs mb-2">
        Sin registros previos para este ejercicio
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