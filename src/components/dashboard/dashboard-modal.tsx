import React from 'react';
import { THEME_CONTAINERS } from '../../constants';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  DashboardContent,
  DashboardEmptyState,
  DashboardFilters,
  DashboardHeader
} from './components';
import { useDashboardData, useDashboardFilters } from './hooks';
import type { DashboardProps } from './types';

export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { workoutRecords, exercises, loading, isOnline, handleDeleteRecord } = useDashboardData();
  const {
    selectedExercise,
    selectedMuscleGroup,
    filterType,
    timeFilter,
    activeTab,
    filteredRecords,
    timeFilterLabel,
    setSelectedExercise,
    setSelectedMuscleGroup,
    setFilterType,
    setTimeFilter,
    setActiveTab
  } = useDashboardFilters(workoutRecords);

  if (loading) {
    return (
      <div className={THEME_CONTAINERS.modal.overlay}>
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-400 text-sm">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={THEME_CONTAINERS.modal.overlay}>
      <div className={THEME_CONTAINERS.modal.container}>
        <DashboardHeader
          timeFilterLabel={timeFilterLabel}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        {!isOnline && (
          <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
        )}

        <div className={THEME_CONTAINERS.modal.content}>
          <div className="p-6 space-y-6 pb-16 sm:pb-20">
            <DashboardFilters
              selectedExercise={selectedExercise}
              selectedMuscleGroup={selectedMuscleGroup}
              filterType={filterType}
              timeFilter={timeFilter}
              exercises={exercises}
              isOnline={isOnline}
              onExerciseChange={setSelectedExercise}
              onMuscleGroupChange={setSelectedMuscleGroup}
              onFilterTypeChange={setFilterType}
              onTimeFilterChange={setTimeFilter}
            />

            {filteredRecords.length === 0 ? (
              <DashboardEmptyState isOnline={isOnline} />
            ) : (
              <DashboardContent
                filteredRecords={filteredRecords}
                onDeleteRecord={handleDeleteRecord}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};