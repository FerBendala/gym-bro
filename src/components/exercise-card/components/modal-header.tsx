import { Dumbbell, X } from 'lucide-react';
import React from 'react';

import type { ExerciseAssignment } from '@/interfaces';

interface ModalHeaderProps {
  assignment: ExerciseAssignment;
  onClose: () => void;
}

/**
 * Header del modal con información del ejercicio y botón de cerrar
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  assignment,
  onClose
}) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Nuevo Entrenamiento
              </h3>
              <p className="text-lg text-blue-300 font-medium mb-2">
                {assignment.exercise?.name || 'Ejercicio'}
              </p>

              {assignment.exercise?.categories && assignment.exercise.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {assignment.exercise.categories.map((category: string) => (
                    <span key={category} className="text-xs text-blue-200 bg-blue-500/20 px-3 py-1.5 rounded-full font-medium border border-blue-400/30 backdrop-blur-sm hover:bg-blue-500/30 transition-colors duration-200">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}; 