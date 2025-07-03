import { Edit2, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { EXERCISE_CATEGORIES } from '../../../constants/exercise-categories';
import { Button } from '../../button';
import { Card, CardContent, CardHeader } from '../../card';
import { URLPreview } from '../../url-preview';
import type { ExerciseCategory, ExerciseListProps } from '../types';

/**
 * Lista de ejercicios existentes organizados por tabs de categoría
 * Incluye funcionalidad de filtrado por categoría y edición/eliminación
 */
export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  isOnline,
  onEditExercise,
  onDelete,
  onPreviewUrl
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('all');

  // Crear lista de categorías con contador
  const categoriesWithCount = useMemo(() => {
    const categories = [
      { id: 'all', name: 'Todos', count: exercises.length }
    ];

    // Agregar categorías existentes con contador
    EXERCISE_CATEGORIES.forEach(category => {
      const count = exercises.filter(ex => ex.category === category).length;
      if (count > 0) {
        categories.push({ id: category, name: category, count });
      }
    });

    return categories;
  }, [exercises]);

  // Filtrar ejercicios por categoría seleccionada
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'all') {
      return exercises.sort((a, b) => a.name.localeCompare(b.name));
    }
    return exercises
      .filter(ex => ex.category === selectedCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
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
            <div className="flex flex-wrap gap-2">
              {categoriesWithCount.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={!isOnline}
                  className="flex items-center space-x-2"
                >
                  <span>{category.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-600/50 text-gray-300'
                    }`}>
                    {category.count}
                  </span>
                </Button>
              ))}
            </div>

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
                  <div key={exercise.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/70 transition-all duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium truncate">{exercise.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-blue-300 bg-blue-500/15 px-2 py-1 rounded-full font-medium border border-blue-500/20">
                              {exercise.category}
                            </span>
                          </div>
                          {exercise.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{exercise.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditExercise(exercise)}
                            disabled={!isOnline}
                            title="Editar ejercicio"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(exercise.id)}
                            disabled={!isOnline}
                            title="Eliminar ejercicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Vista previa de URL del ejercicio */}
                      {exercise.url && (
                        <URLPreview
                          url={exercise.url}
                          onClick={() => onPreviewUrl(exercise.url!)}
                        />
                      )}
                    </div>
                  </div>
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