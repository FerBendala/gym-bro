import React from 'react';

/**
 * Skeleton de carga para ExerciseList que simula las tarjetas de ejercicios
 */
export const ExerciseListLoadingState: React.FC = () => {
  const renderSkeletonCard = () => {
    const cards = Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* Borde superior rojo */}
        <div className="h-4 bg-gradient-to-r from-gray-500 to-gray-700" />

        <div className="p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gray-600 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-600 rounded-full px-3 py-1 w-16 animate-pulse" />
                  <div className="h-6 bg-gray-600 rounded-full px-3 py-1 w-16 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-600 rounded w-48 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col items-start gap-2">
              <div className="w-48 h-4 bg-gray-600 rounded animate-pulse" />
              <div className="w-24 h-2 bg-gray-600 rounded animate-pulse" />
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    ));
    return cards;
  };
  return (
    <div className="space-y-4 mt-8 opacity-30">
      {/* Botones de acción */}
      <div className="flex justify-between mb-6">
        <div className="px-4 py-2 bg-gray-700 rounded-lg w-28 h-9 animate-pulse" />
        <div className="px-4 py-2 bg-blue-600 rounded-lg w-40 h-9 animate-pulse" />
      </div>

      {/* Renderiza el skeleton de las tarjetas de ejercicios */}
      {renderSkeletonCard()}
    </div>
  );
};
