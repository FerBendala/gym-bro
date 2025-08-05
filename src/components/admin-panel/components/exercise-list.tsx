import React, { useMemo, useState } from 'react';

import { Search, X } from 'lucide-react';

import type { ExerciseCategory } from '../types';
import { filterExercisesByCategory, getCategoriesWithCount } from '../utils';

import { ExerciseItem } from './exercise-item';

import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';

/**
 * Componente de búsqueda rápida para ejercicios
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
 * Lista de ejercicios existentes rediseñada para ser más compacta y usable
 */
export const ExerciseList: React.FC = () => {
  const isOnline = useOnlineStatus();
  const exercises = useAdminStore((state) => state.exercises);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Crear lista de categorías con contador
  const categoriesWithCount = useMemo(() => {
    return getCategoriesWithCount(exercises);
  }, [exercises]);

  // Filtrar ejercicios por categoría seleccionada
  const categoryFilteredExercises = useMemo(() => {
    return filterExercisesByCategory(exercises, selectedCategory);
  }, [exercises, selectedCategory]);

  // Filtrar ejercicios por término de búsqueda
  const filteredExercises = useMemo(() => {
    if (!searchTerm) return categoryFilteredExercises;

    return categoryFilteredExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.categories?.some(category =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [categoryFilteredExercises, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header compacto con categorías y búsqueda */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Ejercicios</h3>

          {/* Tabs de categorías compactos */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {categoriesWithCount.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={!isOnline}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center space-x-1 ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                >
                  <span>{category.name}</span>
                  <span className={`text-xs px-1 rounded-full ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-600/50 text-gray-300'
                    }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-xs text-gray-500">
          {filteredExercises.length} de {exercises.length}
        </div>
      </div>

      {/* Búsqueda rápida */}
      {exercises.length > 0 && (
        <QuickSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredExercises.length}
        />
      )}

      {/* Lista de ejercicios */}
      <div className="space-y-2">
        {exercises.length === 0 ? (
          <div className="bg-gray-800/30 rounded-lg p-6 text-center border border-gray-700/30">
            <div className="text-gray-400 text-sm">
              {isOnline
                ? 'No hay ejercicios creados aún'
                : 'Sin conexión - No se pueden cargar los ejercicios'
              }
            </div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="bg-gray-800/30 rounded-lg p-6 text-center border border-gray-700/30">
            <div className="text-gray-400 text-sm">
              {searchTerm ? (
                <>
                  <p className="mb-2">No se encontraron ejercicios para "{searchTerm}"</p>
                  <p className="text-xs">Intenta con otro término de búsqueda</p>
                </>
              ) : (
                <>
                  <p className="mb-2">No hay ejercicios en la categoría "{selectedCategory}"</p>
                  <p className="text-xs">Cambia de categoría o crea nuevos ejercicios</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredExercises.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onPreviewUrl={setPreviewUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
