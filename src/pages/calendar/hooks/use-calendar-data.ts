import { useEffect, useState } from 'react';

import { getWorkoutRecords } from '@/api/services';
import type { WorkoutRecord } from '@/interfaces';
import { logger } from '@/utils';

export const useCalendarData = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        const workoutRecords = await getWorkoutRecords();
        setRecords(workoutRecords);
      } catch (err) {
        logger.error('Error loading workout records:', err as Error);
        setError('Error al cargar los datos de entrenamientos');
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, []);

  return {
    records,
    loading,
    error,
  };
};
