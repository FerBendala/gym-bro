import { Card, CardContent } from '@/components/card';
import { Input } from '@/components/input';
import { Select } from '@/components/select';
import { EXERCISE_CATEGORIES } from '@/constants/exercise.constants';
import type { Exercise } from '@/interfaces';
import { Dumbbell, Search, Target } from 'lucide-react';
import React from 'react';

interface SearchFiltersProps {
  exercises: Exercise[];
  searchTerm: string;
  selectedExercise: string;
  selectedCategory: string;
  onSearchTermChange: (value: string) => void;
  onSelectedExerciseChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  exercises,
  searchTerm,
  selectedExercise,
  selectedCategory,
  onSearchTermChange,
  onSelectedExerciseChange,
  onSelectedCategoryChange
}) => {
  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Search className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Buscar y Filtrar</h3>
        </div>

        <div className="space-y-4">
          {/* Búsqueda */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Buscar por nombre de ejercicio
            </label>
            <Input
              type="text"
              placeholder="Ej: press banca, sentadillas..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="border-gray-600/50 focus:border-blue-500 focus:bg-gray-700"
            />
          </div>

          {/* Ejercicio específico */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Dumbbell className="w-4 h-4 mr-2" />
              Ejercicio específico
            </label>
            <Select
              value={selectedExercise}
              onChange={(e) => onSelectedExerciseChange(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los ejercicios' },
                ...exercises.map(ex => ({ value: ex.id, label: ex.name }))
              ]}
              className="border-gray-600/50 focus:border-purple-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Categoría muscular
            </label>
            <Select
              value={selectedCategory}
              onChange={(e) => onSelectedCategoryChange(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las categorías' },
                ...EXERCISE_CATEGORIES.map(cat => ({
                  value: cat,
                  label: cat
                }))
              ]}
              className="border-gray-600/50 focus:border-green-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 