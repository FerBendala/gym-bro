import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useState } from 'react';

interface UseDragAndDropOptions {
  onReorder?: (items: any[]) => void;
  items: any[];
  getItemId: (item: any) => string;
}

export const useDragAndDrop = ({ onReorder, items, getItemId }: UseDragAndDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);

  // Configuración optimizada de sensores para móvil
  const sensors = useSensors(
    // TouchSensor para mejor soporte móvil
    useSensor(TouchSensor, {
      // Activación más sensible para móvil
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    // PointerSensor para desktop
    useSensor(PointerSensor, {
      // Prevenir activación accidental
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, args) => {
        const { currentCoordinates } = args;
        return currentCoordinates;
      },
    })
  );

  const handleDragStart = () => {
    setIsDragging(true);
    // Prevenir scroll durante el drag en móvil
    document.body.style.overflow = 'hidden';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    // Restaurar scroll
    document.body.style.overflow = '';

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Crear nueva lista con el orden actualizado
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);

        // Llamar al callback de reordenamiento
        onReorder?.(newItems);
      }
    }
  };

  return {
    sensors,
    isDragging,
    handleDragStart,
    handleDragEnd,
    collisionDetection: closestCenter,
  };
}; 