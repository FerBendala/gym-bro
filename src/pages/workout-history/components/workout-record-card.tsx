import { getCategoryColor } from '@/utils';
import React from 'react';
import type { WorkoutRecordWithExercise } from '../types';
import { calculateWorkoutStats, hasIndividualSets } from '../utils';
import { IndividualSets } from './individual-sets';
import { WorkoutMetrics } from './metrics';
import { WorkoutRecordHeader } from './workout-record-header';

interface WorkoutRecordCardProps {
  record: WorkoutRecordWithExercise;
  onEdit: (record: WorkoutRecordWithExercise) => void;
  onDelete: (recordId: string) => void;
}

export const WorkoutRecordCard: React.FC<WorkoutRecordCardProps> = ({
  record,
  onEdit,
  onDelete
}) => {
  const primaryCategory = record.exercise?.categories?.[0] || 'Pecho';
  const colorGradient = getCategoryColor(primaryCategory);
  const stats = calculateWorkoutStats(record);
  const hasIndividualSetsData = hasIndividualSets(record);

  return (
    <div
      className={`relative p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 hover:shadow-xl`}
    >
      {/* Indicador visual de categoría */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorGradient}`} />

      {/* Header con icono y información del ejercicio */}
      <WorkoutRecordHeader
        record={record}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Métricas principales */}
      <WorkoutMetrics
        stats={stats}
        hasIndividualSets={hasIndividualSetsData}
      />

      {/* Series individuales detalladas */}
      {hasIndividualSetsData && (
        <IndividualSets individualSets={record.individualSets!} />
      )}
    </div>
  );
}; 