import React from 'react';

import { getCategoryColor, getCategoryIcon } from '@/utils';

interface ExerciseCardHeaderProps {
  exercise: {
    name: string;
    categories?: string[];
  };
}

export const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({ exercise }) => {
  const primaryCategory = exercise.categories?.[0] || 'Pecho';
  const colorGradient = getCategoryColor(primaryCategory);
  const CategoryIcon = getCategoryIcon(primaryCategory);

  return (
    <div className="flex items-start space-x-3 mb-3">
      {/* Icono con gradiente por categoría - más grande */}
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorGradient} flex-shrink-0 shadow-lg`}>
        <CategoryIcon className="w-5 h-5 text-white" />
      </div>

      {/* Título y categorías en columna */}
      <div className="flex-1 min-w-0">
        {/* Categorías encima del título */}
        {exercise.categories && exercise.categories.length > 0 && (
          <div className="flex items-center space-x-2 mb-1">
            {exercise.categories.map((category) => (
              <span
                key={category}
                className={`inline-flex items-center text-xs text-white bg-gradient-to-r ${getCategoryColor(category)} px-1.5 py-0.5 rounded-full font-medium shadow-sm border border-white/20`}
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Título debajo de las categorías - más pequeño */}
        <h3 className="text-base font-semibold text-white leading-tight truncate text-justify">
          {exercise.name || 'Ejercicio'}
        </h3>
      </div>
    </div>
  );
};
