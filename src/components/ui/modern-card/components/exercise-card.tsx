import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import { EXERCISE_CARD_COMPLETED_ICON_CLASSES } from '../constants';
import { ModernCard } from '../modern-card';
import type { ModernExerciseCardProps } from '../types';
import { CardContent, CardFooter, CardHeader } from './index';

export const ExerciseCard: React.FC<ModernExerciseCardProps> = ({
  title,
  category,
  description,
  lastWorkout,
  isCompleted = false,
  onStart,
  onViewDetails,
  className
}) => {
  return (
    <ModernCard
      variant={isCompleted ? 'success' : 'default'}
      padding="md"
      className={className}
    >
      <CardHeader
        title={title}
        subtitle={category}
        actions={
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className={EXERCISE_CARD_COMPLETED_ICON_CLASSES}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        }
      />

      <CardContent>
        {description && (
          <p className="text-sm text-gray-400">
            {description}
          </p>
        )}

        {lastWorkout && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Último entrenamiento</p>
            <p className="text-sm text-white">
              {lastWorkout.weight}kg × {lastWorkout.reps} reps
            </p>
            <p className="text-xs text-gray-500">
              {lastWorkout.date}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <button
          onClick={onViewDetails}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Ver detalles
        </button>
        <button
          onClick={onStart}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium',
            isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isCompleted ? 'Completado' : 'Empezar'}
        </button>
      </CardFooter>
    </ModernCard>
  );
}; 