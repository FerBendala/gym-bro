import { Activity, AlertTriangle } from 'lucide-react';
import React from 'react';

import {
  ExercisesCategoryFilters,
  ExercisesDetailedAnalysis,
  ExercisesMetrics,
  ExercisesUnknownWarning,
} from '../components';
import { useExercisesData } from '../hooks/use-exercises-data';
import { EmptyState } from '../shared/empty-state';

import type { WorkoutRecord } from '@/interfaces';

interface ExercisesTabProps {
  records: WorkoutRecord[];
}

export const ExercisesTab: React.FC<ExercisesTabProps> = ({ records }) => {
  const {
    exerciseAnalysis,
    categoriesWithCount,
    selectedCategory,
    setSelectedCategory,
    allExercises,
    unknownRecords,
    globalMetrics,
  } = useExercisesData(records);

  if (records.length === 0) {
    return <EmptyState icon={Activity} title="No hay datos" description="No hay datos para mostrar" />;
  }

  if (exerciseAnalysis.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No hay datos"
        description="No hay datos para mostrar"
      />
    );
  }

  return (
    <div className="space-y-6">
      <ExercisesUnknownWarning unknownRecordsCount={unknownRecords.length} />
      <ExercisesMetrics
        globalMetrics={globalMetrics}
        allExercisesCount={allExercises.length}
      />
      <ExercisesCategoryFilters
        categories={categoriesWithCount}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ExercisesDetailedAnalysis
        exercises={allExercises}
        selectedCategory={selectedCategory}
        categoriesWithCount={categoriesWithCount}
      />
    </div>
  );
};
