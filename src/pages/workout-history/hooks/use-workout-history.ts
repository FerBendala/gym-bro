import { deleteWorkoutRecord, getExercises, getWorkoutRecords, updateWorkoutRecord } from '@/api/services';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { useNotification } from '@/stores/notification';
import { useEffect, useState } from 'react';
import type { WorkoutRecordWithExercise } from '../types';

export const useWorkoutHistory = () => {
  const [records, setRecords] = useState<WorkoutRecordWithExercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutRecords, exerciseList] = await Promise.all([
        getWorkoutRecords(),
        getExercises()
      ]);

      // Enriquecer registros con información de ejercicios
      const enrichedRecords = workoutRecords.map(record => ({
        ...record,
        exercise: exerciseList.find(ex => ex.id === record.exerciseId)
      }));

      setRecords(enrichedRecords);
      setExercises(exerciseList);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (recordId: string, updatedRecord: WorkoutRecord) => {
    try {
      await updateWorkoutRecord(recordId, updatedRecord);
      setRecords(prev => prev.map(r =>
        r.id === recordId ? { ...r, ...updatedRecord } : r
      ));
      showNotification('Entrenamiento actualizado correctamente', 'success');
      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      showNotification('Error al actualizar el entrenamiento', 'error');
      return false;
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      await deleteWorkoutRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      showNotification('Entrenamiento eliminado correctamente', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Error al eliminar el entrenamiento', 'error');
      return false;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    records,
    exercises,
    loading,
    updateRecord,
    deleteRecord,
    reloadData: loadData
  };
}; 