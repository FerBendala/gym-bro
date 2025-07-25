import { Card, CardContent } from '@/components/card';
import { Calendar } from 'lucide-react';
import React from 'react';
import { WORKOUT_HISTORY_CONSTANTS } from '../constants';
import type { WorkoutRecordWithExercise } from '../types';
import { EditWorkoutForm, WorkoutRecordCard } from './';

interface WorkoutListProps {
  records: WorkoutRecordWithExercise[];
  editingRecord: WorkoutRecordWithExercise | null;
  editMode: any;
  onEdit: (record: WorkoutRecordWithExercise) => void;
  onDelete: (recordId: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onModeChange: (mode: 'simple' | 'advanced') => void;
  onFieldChange: <K extends keyof any>(key: K, value: any) => void;
  onIndividualSetAdd: () => void;
  onIndividualSetRemove: (index: number) => void;
  onIndividualSetUpdate: (index: number, field: 'weight' | 'reps', value: number) => void;
  hasActiveFilters: boolean;
  totalRecords: number;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({
  records,
  editingRecord,
  editMode,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onModeChange,
  onFieldChange,
  onIndividualSetAdd,
  onIndividualSetRemove,
  onIndividualSetUpdate,
  hasActiveFilters,
  totalRecords
}) => {
  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {hasActiveFilters ? 'No se encontraron entrenamientos' : 'No hay entrenamientos registrados'}
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters ? 'Ajusta los filtros para ver más resultados' : 'Comienza a registrar entrenamientos para ver tu historial'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => {
            if (editingRecord?.id === record.id) {
              return (
                <EditWorkoutForm
                  key={record.id}
                  record={record}
                  editMode={editMode}
                  onModeChange={onModeChange}
                  onFieldChange={onFieldChange}
                  onIndividualSetAdd={onIndividualSetAdd}
                  onIndividualSetRemove={onIndividualSetRemove}
                  onIndividualSetUpdate={onIndividualSetUpdate}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                />
              );
            }

            return (
              <WorkoutRecordCard
                key={record.id}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>

        {/* Indicador de cantidad limitada */}
        {!hasActiveFilters && totalRecords > WORKOUT_HISTORY_CONSTANTS.DEFAULT_RECORDS_LIMIT && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg text-center">
            <p className="text-sm text-blue-300">
              Mostrando los {WORKOUT_HISTORY_CONSTANTS.DEFAULT_RECORDS_LIMIT} entrenamientos más recientes de {totalRecords} totales.
              Usa los filtros para buscar entrenamientos específicos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 