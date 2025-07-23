import { Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import { CategoryFilters, ExerciseItem, UnknownRecordsWarning } from './components';
import { useExerciseAnalysis } from './hooks';
import type { ExerciseAnalyticsProps } from './types';

/**
 * Componente de analytics por ejercicio
 */
export const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({ records }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    exerciseAnalysis,
    categoriesWithCount,
    filteredExercises,
    unknownRecords
  } = useExerciseAnalysis(records, selectedCategory);

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos de ejercicios
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos para ver análisis por ejercicio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exerciseAnalysis.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No se encontró información de ejercicios
            </h3>
            <p className="text-gray-500 mb-4">
              Los registros de entrenamientos no tienen información de ejercicios asociada
            </p>
            {unknownRecords.length > 0 && (
              <UnknownRecordsWarning count={unknownRecords.length} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advertencia sobre registros sin información */}
      {unknownRecords.length > 0 && (
        <UnknownRecordsWarning count={unknownRecords.length} />
      )}

      {/* Filtros por categorías */}
      <CategoryFilters
        categories={categoriesWithCount}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Análisis por Ejercicio
            {selectedCategory !== 'all' && (
              <span className="ml-2 text-sm font-normal text-blue-400">
                - {categoriesWithCount.find((cat) => cat.id === selectedCategory)?.name}
              </span>
            )}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filteredExercises.length} ejercicios)
            </span>
            <InfoTooltip
              content="Rendimiento detallado de cada ejercicio incluyendo progreso, volumen y frecuencia."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  No hay ejercicios en la categoría "{categoriesWithCount.find((cat) => cat.id === selectedCategory)?.name || selectedCategory}"
                </p>
              </div>
            ) : (
              filteredExercises.map((exercise, index: number) => (
                <ExerciseItem
                  key={exercise.name}
                  exercise={exercise}
                  index={index}
                  selectedCategory={selectedCategory}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 