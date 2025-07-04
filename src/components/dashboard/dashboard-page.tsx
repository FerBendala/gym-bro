import React from 'react';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  DashboardContent,
  DashboardEmptyState,
  DashboardFilters,
  DashboardTabNavigation
} from './components';
import { useDashboardData, useDashboardFilters } from './hooks';

/**
 * Dashboard como página completa sin modal
 * Optimizado para mobile-first con navegación de tabs moderna
 */
export const DashboardPage: React.FC = () => {
  const { workoutRecords, exercises, loading, isOnline, handleDeleteRecord } = useDashboardData();
  const {
    selectedExercise,
    timeFilter,
    activeTab,
    filteredRecords,
    timeFilterLabel,
    setSelectedExercise,
    setTimeFilter,
    setActiveTab
  } = useDashboardFilters(workoutRecords);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-400 text-sm">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning de conexión */}
      {!isOnline && (
        <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
      )}

      {/* Navegación de tabs moderna */}
      <DashboardTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timeFilterLabel={timeFilterLabel}
      />

      {/* Filtros */}
      <DashboardFilters
        selectedExercise={selectedExercise}
        timeFilter={timeFilter}
        exercises={exercises}
        isOnline={isOnline}
        onExerciseChange={setSelectedExercise}
        onTimeFilterChange={setTimeFilter}
      />

      {/* Contenido principal */}
      {filteredRecords.length === 0 ? (
        <DashboardEmptyState isOnline={isOnline} />
      ) : (
        <DashboardContent
          filteredRecords={filteredRecords}
          allRecords={workoutRecords}
          activeTab={activeTab}
          onDeleteRecord={handleDeleteRecord}
        />
      )}
    </div>
  );
}; 