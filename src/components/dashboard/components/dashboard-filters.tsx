import { Filter, Layers, Target } from 'lucide-react';
import React from 'react';
import { createExerciseFilterOptions, createMuscleGroupFilterOptions } from '../../../utils/functions/filter-utils';
import { Select } from '../../select';
import type { DashboardFiltersProps } from '../types';

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedExercise,
  selectedMuscleGroup,
  filterType,
  timeFilter,
  exercises,
  isOnline,
  activeTab,
  onExerciseChange,
  onMuscleGroupChange,
  onFilterTypeChange,
  onTimeFilterChange
}) => {
  const exerciseGroups = createExerciseFilterOptions(exercises);
  const muscleGroupOptions = createMuscleGroupFilterOptions();

  // No mostrar filtro de tiempo en el tab de categorías
  const showTimeFilter = activeTab !== 'categories';

  return (
    <div className="space-y-4">
      {/* Selector de tipo de filtro */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className={showTimeFilter ? "flex-1" : "w-full"}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo de filtro
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onFilterTypeChange('all')}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              disabled={!isOnline}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Todos</span>
            </button>

            <button
              onClick={() => onFilterTypeChange('exercise')}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'exercise'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              disabled={!isOnline}
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Ejercicio</span>
            </button>

            <button
              onClick={() => onFilterTypeChange('muscle-group')}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'muscle-group'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              disabled={!isOnline}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Grupo</span>
            </button>
          </div>
        </div>

        {/* Selector de período */}
        {showTimeFilter && (
          <div className="flex-1">
            <Select
              label="Período"
              value={timeFilter}
              onChange={(e) => onTimeFilterChange(e.target.value as any)}
              options={[
                { value: 'week', label: 'Esta semana' },
                { value: 'month', label: 'Este mes' },
                { value: 'all', label: 'Todo el tiempo' }
              ]}
              disabled={!isOnline}
            />
          </div>
        )}
      </div>

      {/* Selectores específicos según el tipo de filtro */}
      {filterType === 'exercise' && (
        <Select
          label="Ejercicio específico"
          value={selectedExercise}
          onChange={(e) => onExerciseChange(e.target.value)}
          groups={exerciseGroups}
          disabled={!isOnline}
        />
      )}

      {filterType === 'muscle-group' && (
        <Select
          label="Grupo muscular"
          value={selectedMuscleGroup}
          onChange={(e) => onMuscleGroupChange(e.target.value)}
          groups={muscleGroupOptions}
          disabled={!isOnline}
        />
      )}

      {/* Información del filtro activo */}
      {filterType !== 'all' && (
        <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <p className="text-sm text-blue-300">
              {filterType === 'exercise' && selectedExercise !== 'all' && (
                <>Mostrando datos para: <strong>{exercises.find(ex => ex.id === selectedExercise)?.name || 'Ejercicio seleccionado'}</strong></>
              )}
              {filterType === 'muscle-group' && selectedMuscleGroup !== 'all' && (
                <>Mostrando datos para grupo: <strong>{createMuscleGroupFilterOptions()
                  .flatMap(group => group.options)
                  .find(option => option.value === selectedMuscleGroup)?.label.replace(/^[^\s]+ /, '') || 'Grupo seleccionado'}</strong></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Mensaje informativo cuando no se muestra el filtro de tiempo */}
      {!showTimeFilter && (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">
            ℹ️ Las métricas por categoría muestran automáticamente todos los períodos de tiempo (semana actual, semana pasada, mes actual y mes pasado).
          </p>
        </div>
      )}
    </div>
  );
}; 