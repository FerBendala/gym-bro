import React from 'react';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  AdvancedTab,
  CategoryTab,
  DashboardEmptyState,
  DashboardFilters,
  DashboardTabNavigation,
  TrendsTab
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
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-400 text-sm">Cargando dashboard...</p>
      </div>
    );
  }

  // Renderizar contenido según el tab activo
  const renderTabContent = () => {
    if (filteredRecords.length === 0 && workoutRecords.length === 0) {
      return <DashboardEmptyState isOnline={isOnline} />;
    }

    switch (activeTab) {
      case 'categories':
        // CategoryTab necesita TODOS los records para calcular métricas correctamente
        return <CategoryTab records={workoutRecords} />;
      case 'trends':
        return <TrendsTab records={filteredRecords} />;
      case 'advanced':
        return <AdvancedTab records={filteredRecords} />;
      default:
        return <CategoryTab records={workoutRecords} />;
    }
  };

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

      {/* Contenido principal */}
      {renderTabContent()}
    </div>
  );
}; 