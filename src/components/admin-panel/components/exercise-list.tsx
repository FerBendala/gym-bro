import { useOnlineStatus } from '@/hooks';
import { useAdminStore } from '@/stores/admin';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import type { ExerciseCategory } from '../types';
import { filterExercisesByCategory, getCategoriesWithCount } from '../utils/admin-utils';
import { ExerciseCategoryTabs } from './exercise-category-tabs';
import { ExerciseItem } from './exercise-item';

/**
 * Lista de ejercicios existentes organizados por tabs de categoría
 * Incluye funcionalidad de filtrado por categoría y edición/eliminación
 * Usa Zustand para el estado global
 */
export const ExerciseList: React.FC = () => {
  const isOnline = useOnlineStatus();
  const exercises = useAdminStore((state) => state.exercises);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('all');

  // Crear lista de categorías con contador
  const categoriesWithCount = useMemo(() => {
    return getCategoriesWithCount(exercises);
  }, [exercises]);

  // Filtrar ejercicios por categoría seleccionada
  const filteredExercises = useMemo(() => {
    return filterExercisesByCategory(exercises, selectedCategory);
  }, [exercises, selectedCategory]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Ejercicios Existentes</h3>
        <p className="text-sm text-gray-400">
          Organizado por categorías • {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} total
        </p>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            {isOnline
              ? 'No hay ejercicios creados aún'
              : 'Sin conexión - No se pueden cargar los ejercicios'
            }
          </p>
        ) : (
          <div className="space-y-4">
            {/* Tabs de categorías */}
            <ExerciseCategoryTabs
              categoriesWithCount={categoriesWithCount}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              isOnline={isOnline}
            />

            {/* Lista de ejercicios filtrados */}
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  No hay ejercicios en la categoría "{selectedCategory}"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    onPreviewUrl={setPreviewUrl}
                  />
                ))}
              </div>
            )}

            {/* Información adicional */}
            {filteredExercises.length > 0 && selectedCategory !== 'all' && (
              <div className="text-center text-xs text-gray-500 pt-2">
                Mostrando {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''} de {selectedCategory}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 