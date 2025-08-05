import React, { useMemo, useState } from 'react';

import { Search, X } from 'lucide-react';

import { formatDayName } from '../utils';

import { AssignmentForm } from './assignment-form';
import { AssignmentItem } from './assignment-item';

import { DAYS } from '@/constants/days.constants';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';

/**
 * Componente de estadísticas compactas de asignaciones
 */
const AssignmentStats: React.FC = () => {
  const getAssignmentsByDay = useAdminStore((state) => state.getAssignmentsByDay);

  const stats = DAYS.map(day => ({
    day,
    count: getAssignmentsByDay(day).length
  }));

  const totalAssignments = stats.reduce((sum, stat) => sum + stat.count, 0);
  const daysWithAssignments = stats.filter(stat => stat.count > 0).length;

  return (
    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Total: <span className="text-white font-medium">{totalAssignments}</span></span>
          <span className="text-gray-400">Días: <span className="text-white font-medium">{daysWithAssignments}</span></span>
        </div>

        {/* Mini indicadores por día */}
        <div className="flex space-x-1">
          {stats.map(({ day, count }) => (
            <div
              key={day}
              className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              title={`${formatDayName(day)}: ${count} ejercicio${count !== 1 ? 's' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de búsqueda rápida
 */
const QuickSearch: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultsCount: number;
}> = ({ searchTerm, onSearchChange, resultsCount }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar ejercicios..."
        className="block w-full pl-10 pr-10 py-2 text-sm bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {searchTerm && (
        <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
          {resultsCount} resultado{resultsCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

/**
 * Componente rediseñado para asignar ejercicios por día de forma más compacta y usable
 */
export const ExerciseAssignments: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Usar selectores específicos para acceder al estado correctamente
  const selectedDay = useAdminStore((state) => state.adminPanel.selectedDay);
  const setSelectedDay = useAdminStore((state) => state.setSelectedDay);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);
  const getAssignmentsByDay = useAdminStore((state) => state.getAssignmentsByDay);

  const allAssignments = getAssignmentsByDay(selectedDay);

  // Filtrar asignaciones por término de búsqueda
  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return allAssignments;

    return allAssignments.filter(assignment =>
      assignment.exercise?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.exercise?.categories?.some(category =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [allAssignments, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Estadísticas compactas */}
      <AssignmentStats />

      {/* Header compacto con selector de días y botón de agregar */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Asignaciones</h3>

          {/* Selector de días compacto */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {DAYS.map((day) => {
              const isActive = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  disabled={!isOnline}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                >
                  {formatDayName(day).slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón de agregar ejercicio */}
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={!isOnline}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${showForm
            ? 'bg-gray-600 text-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {showForm ? 'Cancelar' : 'Agregar'}
        </button>
      </div>

      {/* Formulario colapsable */}
      {showForm && (
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <AssignmentForm
            selectedDay={selectedDay}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Búsqueda rápida */}
      {allAssignments.length > 0 && (
        <QuickSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredAssignments.length}
        />
      )}

      {/* Lista de ejercicios asignados - diseño compacto */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">
            {formatDayName(selectedDay)} ({filteredAssignments.length})
          </h4>
          {filteredAssignments.length > 0 && (
            <span className="text-xs text-gray-500">
              {filteredAssignments.length} ejercicio{filteredAssignments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="bg-gray-800/30 rounded-lg p-6 text-center border border-gray-700/30">
            <div className="text-gray-400 text-sm">
              {searchTerm ? (
                <>
                  <p className="mb-2">No se encontraron ejercicios para "{searchTerm}"</p>
                  <p className="text-xs">Intenta con otro término de búsqueda</p>
                </>
              ) : isOnline ? (
                <>
                  <p className="mb-2">No hay ejercicios asignados para {formatDayName(selectedDay)}</p>
                  <p className="text-xs">Haz clic en "Agregar" para asignar ejercicios</p>
                </>
              ) : (
                <p>Sin conexión - No se pueden cargar las asignaciones</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredAssignments.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onPreviewUrl={setPreviewUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
