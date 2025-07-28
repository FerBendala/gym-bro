import type { WorkoutRecord } from '@/interfaces';
import React from 'react';
import {
  ExercisesCategoryFilters,
  ExercisesDetailedAnalysis,
  ExercisesEmptyState,
  ExercisesMetrics,
  ExercisesUnknownWarning
} from '../components';
import { useExercisesData } from '../hooks/use-exercises-data';

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
    globalMetrics
  } = useExercisesData(records);

  if (records.length === 0) {
    return <ExercisesEmptyState />;
  }

  if (exerciseAnalysis.length === 0) {
    return (
      <ExercisesEmptyState
        hasUnknownRecords={true}
        unknownRecordsCount={unknownRecords.length}
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