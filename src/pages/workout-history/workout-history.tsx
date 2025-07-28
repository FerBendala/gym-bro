import { Button } from '@/components/button';
import { Page, Section } from '@/components/layout';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FilterIndicator, FilterModal, WorkoutList } from './components';
import { useEditMode, useFilters, useWorkoutHistory } from './hooks';
import type { WorkoutHistoryProps } from './types';

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ initialFilter }) => {
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { records, exercises, loading, updateRecord, deleteRecord } = useWorkoutHistory();
  const { filters, updateFilter, clearFilters, displayRecords, hasActiveFilters } = useFilters(records, initialFilter);
  const {
    editingRecord,
    editMode,
    startEditing,
    cancelEdit,
    changeMode,
    updateEditField,
    addIndividualSet,
    removeIndividualSet,
    updateIndividualSet
  } = useEditMode();

  // Actualizar filtros cuando cambie initialFilter
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.exerciseName) {
        updateFilter('searchTerm', initialFilter.exerciseName);
      }
      if (initialFilter.exerciseId) {
        updateFilter('selectedExercise', initialFilter.exerciseId);
      }
    }
  }, [initialFilter, updateFilter]);

  // Guardar edición
  const saveEdit = async () => {
    if (!editingRecord) return;

    let updatedRecord;

    if (editMode.mode === 'advanced' && editMode.individualSets.length > 0) {
      // Modo avanzado: calcular datos agregados desde las series individuales
      const totalSets = editMode.individualSets.length;
      const totalReps = editMode.individualSets.reduce((sum, set) => sum + set.reps, 0);
      const avgReps = Math.round(totalReps / totalSets);
      const avgWeight = editMode.individualSets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

      updatedRecord = {
        ...editingRecord,
        weight: avgWeight,
        reps: avgReps,
        sets: totalSets,
        date: editMode.date,
        individualSets: editMode.individualSets
      };
    } else {
      // Modo simple: usar datos agregados
      updatedRecord = {
        ...editingRecord,
        weight: editMode.weight,
        reps: editMode.reps,
        sets: editMode.sets,
        date: editMode.date
      };
      // Omitir individualSets completamente en lugar de undefined para Firebase
      delete updatedRecord.individualSets;
    }

    const success = await updateRecord(editingRecord.id, updatedRecord);
    if (success) {
      cancelEdit();
    }
  };

  if (loading) {
    return (
      <Page
        title="Historial de Entrenamientos"
        subtitle="Gestiona y revisa tus entrenamientos realizados"
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-400 text-sm ml-4">Cargando historial...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="Historial de Entrenamientos"
      subtitle="Gestiona y revisa tus entrenamientos realizados"
      headerActions={
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowFilterModal(true)}
            variant="secondary"
            className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>
      }
    >
      {/* Indicador compacto de filtros activos */}
      <Section>
        <FilterIndicator
          hasActiveFilters={hasActiveFilters}
          displayCount={displayRecords.length}
          totalCount={records.length}
          onClearFilters={clearFilters}
        />
      </Section>

      {/* Lista de entrenamientos */}
      <Section>
        <WorkoutList
          records={displayRecords}
          editingRecord={editingRecord}
          editMode={editMode}
          onEdit={startEditing}
          onDelete={deleteRecord}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onModeChange={changeMode}
          onFieldChange={updateEditField}
          onIndividualSetAdd={addIndividualSet}
          onIndividualSetRemove={removeIndividualSet}
          onIndividualSetUpdate={updateIndividualSet}
          hasActiveFilters={hasActiveFilters}
          totalRecords={records.length}
        />
      </Section>

      {/* Modal de filtros */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        exercises={exercises}
        searchTerm={filters.searchTerm}
        selectedExercise={filters.selectedExercise}
        selectedCategory={filters.selectedCategory}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSearchTermChange={(value) => updateFilter('searchTerm', value)}
        onSelectedExerciseChange={(value) => updateFilter('selectedExercise', value)}
        onSelectedCategoryChange={(value) => updateFilter('selectedCategory', value)}
        onDateFromChange={(value) => updateFilter('dateFrom', value)}
        onDateToChange={(value) => updateFilter('dateTo', value)}
        onSortByChange={(value) => updateFilter('sortBy', value)}
        onSortOrderChange={(value) => updateFilter('sortOrder', value)}
        onClearFilters={clearFilters}
      />
    </Page>
  );
}; 