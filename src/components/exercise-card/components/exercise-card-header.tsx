import { Activity, Dumbbell, Footprints, Hexagon, Plus, RotateCcw, Shield, Triangle, WifiOff } from 'lucide-react';
import React from 'react';
import type { ExerciseCardHeaderProps } from '../types';

// Iconos más específicos para cada categoría muscular
const categoryIcons: Record<string, React.FC<any>> = {
  'Pecho': Hexagon,        // Hexágono representa la forma de los pectorales
  'Espalda': Shield,       // Escudo representa la protección/soporte de la espalda
  'Piernas': Footprints,   // Huellas representan el movimiento de piernas
  'Hombros': Triangle,     // Triángulo representa la forma de los deltoides
  'Brazos': Dumbbell,      // Mancuerna es el icono más representativo para brazos
  'Core': RotateCcw        // Rotación representa los movimientos de core/abdominales
};

// Colores para cada categoría
const categoryColors: Record<string, string> = {
  'Pecho': 'from-red-500/80 to-pink-500/80',
  'Espalda': 'from-blue-500/80 to-cyan-500/80',
  'Piernas': 'from-green-500/80 to-emerald-500/80',
  'Hombros': 'from-purple-500/80 to-violet-500/80',
  'Brazos': 'from-orange-500/80 to-amber-500/80',
  'Core': 'from-indigo-500/80 to-blue-500/80'
};

/**
 * Header del ExerciseCard con título, categorías y botones de acción
 * Adaptado con el diseño visual del balance muscular de referencia
 */
export const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({
  assignment,
  disabled,
  onToggleModal,
  onShowPreview
}) => {
  // Obtener la primera categoría para determinar el color y el icono
  const primaryCategory = assignment.exercise?.categories?.[0] || 'Pecho';
  const Icon = categoryIcons[primaryCategory] || Dumbbell;
  const colorGradient = categoryColors[primaryCategory] || 'from-gray-500/80 to-gray-600/80';

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Icono con gradiente por categoría */}
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorGradient} flex-shrink-0 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-white leading-tight mb-1">
            {assignment.exercise?.name || 'Ejercicio'}
          </h3>

          {/* Categorías con diseño mejorado */}
          {assignment.exercise?.categories && assignment.exercise.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {assignment.exercise.categories.map((category) => {
                const CategoryIcon = categoryIcons[category] || Activity;
                const categoryGradient = categoryColors[category] || 'from-gray-500/80 to-gray-600/80';

                return (
                  <span
                    key={category}
                    className={`inline-flex items-center space-x-1 text-xs text-white bg-gradient-to-r ${categoryGradient} px-2 py-1 rounded-full font-medium shadow-sm border border-white/20`}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    <span>{category}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {disabled && (
          <div className="p-1.5 bg-red-500/20 rounded-lg">
            <WifiOff className="w-4 h-4 text-red-400" />
          </div>
        )}

        {/* Botón de registro con diseño mejorado */}
        <button
          onClick={onToggleModal}
          disabled={disabled}
          className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 