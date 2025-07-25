import { formatNumberToString } from '@/utils';
import { TrendingUp } from 'lucide-react';
import React from 'react';

interface ExerciseData {
  name: string;
  categories: string[];
  totalVolume: number;
  maxWeight: number;
  avgWeight: number;
  progress: number;
  progressPercent: number;
  frequency: number;
  firstWeight: number;
  lastWeight: number;
}

interface ExerciseItemProps {
  exercise: ExerciseData;
  index: number;
  selectedCategory: string;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, index, selectedCategory }) => {
  return (
    <div className="p-4 bg-gray-800/30 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg text-blue-400 font-bold text-sm">
              #{index + 1}
            </div>
            <div>
              <h4 className="font-medium text-white">{exercise.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {exercise.categories.map((category) => (
                  <span
                    key={category}
                    className={`text-xs px-2 py-1 rounded-full font-medium border ${selectedCategory === category
                      ? 'text-blue-200 bg-blue-500/25 border-blue-400/50'
                      : 'text-gray-300 bg-gray-600/30 border-gray-500/30'
                      }`}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-blue-400">
            {formatNumberToString(exercise.totalVolume)} kg
          </p>
          <p className="text-xs text-gray-400">Volumen total</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-sm font-bold text-white">
            {formatNumberToString(exercise.maxWeight)} kg
          </p>
          <p className="text-xs text-gray-400">Peso máximo</p>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-white">
            {formatNumberToString(exercise.avgWeight)} kg
          </p>
          <p className="text-xs text-gray-400">Peso promedio</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <p className={`text-sm font-bold ${exercise.progress > 0 ? 'text-green-400' :
              exercise.progress < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
              {exercise.progress > 0 ? '+' : ''}{formatNumberToString(exercise.progress)} kg
            </p>
            {exercise.progress !== 0 && (
              <TrendingUp className={`w-3 h-3 ${exercise.progress > 0 ? 'text-green-400' : 'text-red-400 rotate-180'
                }`} />
            )}
          </div>
          <p className="text-xs text-gray-400">Progreso</p>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-white">
            {exercise.frequency}
          </p>
          <p className="text-xs text-gray-400">Sesiones</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Evolución: {formatNumberToString(exercise.firstWeight)} kg → {formatNumberToString(exercise.lastWeight)} kg</span>
          <span className={exercise.progressPercent > 0 ? 'text-green-400' : exercise.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'}>
            {exercise.progressPercent > 0 ? '+' : ''}{exercise.progressPercent.toFixed(1)}%
          </span>
        </div>
        <div className="text-xs text-gray-500 mb-1">
          Progreso considera peso y repeticiones
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${exercise.progressPercent > 0 ? 'bg-green-600' :
              exercise.progressPercent < 0 ? 'bg-red-600' : 'bg-gray-600'
              }`}
            style={{
              width: `${Math.min(100, Math.abs(exercise.progressPercent) * 2)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}; 