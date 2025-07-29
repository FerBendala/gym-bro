import { Calendar, Edit, Trash2 } from 'lucide-react';
import React from 'react';

import type { WorkoutRecordWithExercise } from '../types';
import { formatDateForDisplay } from '../utils';

import { getCategoryColor, getCategoryIcon } from '@/utils';

interface WorkoutRecordHeaderProps {
  record: WorkoutRecordWithExercise;
  onEdit: (record: WorkoutRecordWithExercise) => void;
  onDelete: (recordId: string) => void;
}

export const WorkoutRecordHeader: React.FC<WorkoutRecordHeaderProps> = ({
  record,
  onEdit,
  onDelete,
}) => {
  const primaryCategory = record.exercise?.categories?.[0] || 'Pecho';
  const Icon = getCategoryIcon(primaryCategory);
  const colorGradient = getCategoryColor(primaryCategory);

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      onDelete(record.id);
    }
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorGradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white truncate mb-1">
            {record.exercise?.name || 'Ejercicio desconocido'}
          </h4>

          {/* Categorías con diseño mejorado */}
          {record.exercise?.categories && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {record.exercise.categories.map((category) => {
                const CategoryIcon = getCategoryIcon(category);
                const categoryGradient = getCategoryColor(category);

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

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDateForDisplay(record.date)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={() => onEdit(record)}
          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
          title="Editar entrenamiento"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
          title="Eliminar entrenamiento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
