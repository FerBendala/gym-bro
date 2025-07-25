import { DAYS } from '@/constants/days.constants';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';
import React from 'react';
import { Button } from '../../button';
import { Card, CardContent, CardHeader } from '../../card';
import { formatDayName } from '../utils/admin-utils';
import { AssignmentForm } from './assignment-form';
import { AssignmentItem } from './assignment-item';

/**
 * Componente para asignar ejercicios por día con select agrupado por categorías
 * Usa Zustand para el estado global
 */
export const ExerciseAssignments: React.FC = () => {
  const isOnline = useOnlineStatus();

  // Usar selectores específicos para acceder al estado correctamente
  const selectedDay = useAdminStore((state) => state.adminPanel.selectedDay);
  const setSelectedDay = useAdminStore((state) => state.setSelectedDay);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);
  const getAssignmentsByDay = useAdminStore((state) => state.getAssignmentsByDay);

  const assignments = getAssignmentsByDay(selectedDay);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Asignar Ejercicios por Día</h3>
        <p className="text-sm text-gray-400">
          Los ejercicios están organizados por categorías para facilitar la selección
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selector de días */}
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedDay(day)}
                disabled={!isOnline}
              >
                {formatDayName(day)}
              </Button>
            ))}
          </div>

          {/* Formulario de asignación */}
          <AssignmentForm
            selectedDay={selectedDay}
            onSubmit={async (data) => {
              // Esta función se maneja en el componente AssignmentForm
              return true;
            }}
          />

          {/* Lista de ejercicios asignados */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-white mb-3">
              Ejercicios de {formatDayName(selectedDay)}
            </h4>
            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {isOnline
                  ? 'No hay ejercicios asignados para este día'
                  : 'Sin conexión - No se pueden cargar las asignaciones'
                }
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <AssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onPreviewUrl={setPreviewUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 