import { endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

import { calculateVolume } from './volume-calculations';
import { getThisWeekRecords } from './week-records.utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Interfaz para densidad de entrenamiento
 */
export interface TrainingDensity {
  period: string;
  workoutsPerWeek: number;
  volumePerWorkout: number;
  densityScore: number; // Volumen por minuto estimado
  intensityLevel: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
}

/**
 * Calcula densidad de entrenamiento por período
 */
export const calculateTrainingDensity = (records: WorkoutRecord[]): TrainingDensity[] => {
  if (records.length === 0) return [];

  const now = new Date();
  const periods = [
    {
      name: 'Esta semana',
      getRecords: () => getThisWeekRecords(records),
      weeks: 1,
    },
    {
      name: 'Últimas 2 semanas',
      getRecords: () => {
        const twoWeeksStart = startOfWeek(subWeeks(now, 1), { locale: es });
        const twoWeeksEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= twoWeeksStart && recordDate <= twoWeeksEnd;
        });
      },
      weeks: 2,
    },
    {
      name: 'Último mes',
      getRecords: () => {
        const monthStart = startOfWeek(subWeeks(now, 3), { locale: es });
        const monthEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        });
      },
      weeks: 4,
    },
    {
      name: 'Últimos 2 meses',
      getRecords: () => {
        const twoMonthsStart = startOfWeek(subWeeks(now, 7), { locale: es });
        const twoMonthsEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= twoMonthsStart && recordDate <= twoMonthsEnd;
        });
      },
      weeks: 8,
    },
  ];

  const densityData: TrainingDensity[] = [];

  periods.forEach(period => {
    const periodRecords = period.getRecords();

    if (periodRecords.length > 0) {
      const totalVolume = periodRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
      const avgVolumePerWorkout = totalVolume / periodRecords.length;
      // Calcular días únicos por semana en lugar de ejercicios individuales
      const uniqueDays = new Set(periodRecords.map(r => r.date.toDateString())).size;
      const workoutsPerWeek = uniqueDays / period.weeks;

      // Calcular densidad (volumen por unidad de tiempo estimada)
      const estimatedMinutesPerWorkout = 60; // Asumimos 60 min promedio
      const densityScore = avgVolumePerWorkout / estimatedMinutesPerWorkout;

      // Determinar nivel de intensidad
      let intensityLevel: TrainingDensity['intensityLevel'];
      if (workoutsPerWeek >= 6) intensityLevel = 'Muy Alta';
      else if (workoutsPerWeek >= 4) intensityLevel = 'Alta';
      else if (workoutsPerWeek >= 2) intensityLevel = 'Media';
      else intensityLevel = 'Baja';

      densityData.push({
        period: period.name,
        workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10,
        volumePerWorkout: Math.round(avgVolumePerWorkout),
        densityScore: Math.round(densityScore),
        intensityLevel,
      });
    }
  });

  return densityData;
};
