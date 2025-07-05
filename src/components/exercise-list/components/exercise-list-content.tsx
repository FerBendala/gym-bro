import { DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import React from 'react';
import { useDragAndDrop } from '../../../hooks';
import { ExerciseCard } from '../../exercise-card';
import type { ExerciseListContentProps } from '../types';

/**
 * Componente envolvente para hacer cada ExerciseCard draggable
 */
interface SortableExerciseCardProps {
  assignment: any;
  onRecord: any;
  disabled?: boolean;
  isTrainedToday?: boolean;
  workoutRecords: any[];
}

const SortableExerciseCard: React.FC<SortableExerciseCardProps> = ({
  assignment,
  onRecord,
  disabled,
  isTrainedToday = false,
  workoutRecords
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: assignment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50 scale-105' : ''} transition-all duration-200`}
    >
      {/* Handle de drag mejorado para móvil */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-600/80 to-blue-700/80 rounded-r-lg shadow-lg opacity-0 group-hover:opacity-100 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 backdrop-blur-sm border border-blue-500/30 touch-manipulation"
        title="Arrastra para reordenar"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="w-4 h-4 text-white drop-shadow-sm" />
      </div>

      {/* Indicador visual de que es arrastrable */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500/30 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-200" />

      {/* ExerciseCard con padding left para el handle */}
      <div className="group-hover:pl-4 transition-all duration-200">
        <ExerciseCard
          assignment={assignment}
          onRecord={onRecord}
          disabled={disabled}
          isTrainedToday={isTrainedToday}
          workoutRecords={workoutRecords}
        />
      </div>
    </div>
  );
};

/**
 * Contenido principal del ExerciseList que muestra la lista de ejercicios
 * Ahora con soporte para drag and drop para reordenar
 */
export const ExerciseListContent: React.FC<ExerciseListContentProps> = ({
  assignments,
  isOnline,
  onRecord,
  onReorder,
  exercisesTrainedToday,
  workoutRecords
}) => {
  // Ordenar assignments por el campo order (si existe)
  const sortedAssignments = [...assignments].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  // Usar el hook personalizado para drag and drop
  const {
    sensors,
    isDragging,
    handleDragStart,
    handleDragEnd,
    collisionDetection
  } = useDragAndDrop({
    items: sortedAssignments,
    getItemId: (item) => item.id,
    onReorder: (reorderedItems) => {
      // Actualizar los números de order
      const updatedAssignments = reorderedItems.map((assignment, index) => ({
        ...assignment,
        order: index
      }));

      // Llamar al callback de reordenamiento
      onReorder?.(updatedAssignments);
    }
  });

  return (
    <div
      className={`relative ${isDragging ? 'bg-blue-500/5 rounded-xl' : ''} transition-all duration-200`}
      style={{ touchAction: isDragging ? 'none' : 'auto' }}
    >
      {/* Indicador visual de zona de drop */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-xl bg-blue-500/5 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-400 text-sm font-medium bg-blue-500/10 px-3 py-1 rounded-lg">
              Suelta para reordenar
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedAssignments.map(assignment => assignment.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 relative z-10">
            {sortedAssignments.map((assignment) => (
              <SortableExerciseCard
                key={assignment.id}
                assignment={assignment}
                onRecord={onRecord}
                disabled={!isOnline}
                isTrainedToday={exercisesTrainedToday.includes(assignment.exerciseId)}
                workoutRecords={workoutRecords}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}; 