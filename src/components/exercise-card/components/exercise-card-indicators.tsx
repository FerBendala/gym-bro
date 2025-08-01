import { Bookmark } from 'lucide-react';
import React from 'react';

import { getCategoryColor } from '@/utils';

interface ExerciseCardIndicatorsProps {
  primaryCategory: string;
  isTrainedToday: boolean;
}

export const ExerciseCardIndicators: React.FC<ExerciseCardIndicatorsProps> = ({
  primaryCategory,
  isTrainedToday,
}) => {
  const colorGradient = getCategoryColor(primaryCategory);

  return (
    <>
      {/* Indicador visual de categoría */}
      <div className={`absolute top-0 left-0 w-full h-4 bg-gradient-to-r ${colorGradient}`} />

      {/* Indicador de entrenamiento completado */}
      {isTrainedToday && (
        <div className="absolute -top-1.5 right-5">
          <Bookmark className="w-10 h-10 text-green-400 fill-green-400" />
        </div>
      )}
    </>
  );
};
