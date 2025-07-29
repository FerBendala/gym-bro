import { endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

import { calculateOptimal1RM } from './calculate-1rm.utils';
import { calculateVolume } from './volume-calculations';
import { getLastWeekRecords, getThisWeekRecords } from './week-records.utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Interfaz para comparación de períodos
 */
export interface PeriodComparison {
  periodName: string;
  workouts: number;
  totalVolume: number;
  avgWeight: number;
  improvement: number; // Porcentaje vs período anterior
  volumeChange: number;
  strengthChange: number;
}

/**
 * Compara diferentes períodos de tiempo
 */
export const comparePeriods = (records: WorkoutRecord[]): PeriodComparison[] => {
  if (records.length === 0) return [];

  // **DETECCIÓN DE DATOS INSUFICIENTES**: Verificar rango temporal de datos
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  const now = new Date();
  const periods = [
    {
      name: 'Esta semana',
      getRecords: () => getThisWeekRecords(records),
      getPrevRecords: () => getLastWeekRecords(records),
      minDaysRequired: 14, // Necesita al menos 2 semanas de datos
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
      getPrevRecords: () => {
        const prevTwoWeeksStart = startOfWeek(subWeeks(now, 3), { locale: es });
        const prevTwoWeeksEnd = endOfWeek(subWeeks(now, 2), { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= prevTwoWeeksStart && recordDate <= prevTwoWeeksEnd;
        });
      },
      minDaysRequired: 28, // Necesita al menos 4 semanas de datos
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
      getPrevRecords: () => {
        const prevMonthStart = startOfWeek(subWeeks(now, 7), { locale: es });
        const prevMonthEnd = endOfWeek(subWeeks(now, 4), { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= prevMonthStart && recordDate <= prevMonthEnd;
        });
      },
      minDaysRequired: 56, // Necesita al menos 8 semanas de datos
    },
    {
      name: 'Últimos 3 meses',
      getRecords: () => {
        const threeMonthsStart = startOfWeek(subWeeks(now, 11), { locale: es });
        const threeMonthsEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= threeMonthsStart && recordDate <= threeMonthsEnd;
        });
      },
      getPrevRecords: () => {
        const prevThreeMonthsStart = startOfWeek(subWeeks(now, 23), { locale: es });
        const prevThreeMonthsEnd = endOfWeek(subWeeks(now, 12), { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= prevThreeMonthsStart && recordDate <= prevThreeMonthsEnd;
        });
      },
      minDaysRequired: 168, // Necesita al menos 24 semanas de datos
    },
  ];

  return periods.map(period => {
    const currentRecords = period.getRecords();
    const prevRecords = period.getPrevRecords();

    // Validación silenciosa de datos

    const currentWorkouts = currentRecords.length;

    let totalVolume = 0;
    let avgWeight = 0;
    let volumeChange = 0;
    let strengthChange = 0;
    let improvement = 0;

    // **VALIDACIÓN DE DATOS SUFICIENTES**
    const hasEnoughData = totalDays >= period.minDaysRequired;
    const hasValidComparison = currentRecords.length >= 2 && prevRecords.length >= 2;

    if (currentRecords.length > 0) {
      totalVolume = currentRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
      avgWeight = currentRecords.reduce((sum, r) => {
        const oneRM = calculateOptimal1RM(r.weight, r.reps);
        return sum + oneRM;
      }, 0) / currentRecords.length;

      // **CORRECCIÓN CLAVE**: Solo calcular tendencias si hay datos suficientes
      if (hasEnoughData && hasValidComparison) {
        const currentAvgVolumePerSession = totalVolume / currentRecords.length;

        const prevVolume = prevRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
        const prevAvgVolumePerSession = prevVolume / prevRecords.length;

        const prevAvg1RM = prevRecords.reduce((sum, r) => {
          const oneRM = calculateOptimal1RM(r.weight, r.reps);
          return sum + oneRM;
        }, 0) / prevRecords.length;

        volumeChange = prevAvgVolumePerSession > 0 ? ((currentAvgVolumePerSession - prevAvgVolumePerSession) / prevAvgVolumePerSession) * 100 : 0;
        strengthChange = prevAvg1RM > 0 ? ((avgWeight - prevAvg1RM) / prevAvg1RM) * 100 : 0;
        improvement = (volumeChange + strengthChange) / 2;

        // Comparación válida realizada
      } else {
        // No calcular cambios si no hay datos suficientes
        volumeChange = 0;
        strengthChange = 0;
        improvement = 0;
      }
    }

    return {
      periodName: period.name,
      workouts: currentWorkouts,
      totalVolume,
      avgWeight,
      improvement,
      volumeChange,
      strengthChange,
    };
  });
};
