import type { WorkoutRecord } from '@/interfaces';
import { formatNumberToString } from '@/utils';
import type { MonthStats } from '../types';

export const getCurrentMonthStats = (records: WorkoutRecord[]): MonthStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth &&
      recordDate.getFullYear() === currentYear;
  });

  const totalWorkouts = currentMonthRecords.length;
  const totalVolume = currentMonthRecords.reduce((sum, record) =>
    sum + (record.weight * record.reps * record.sets), 0
  );
  const uniqueDays = new Set(currentMonthRecords.map(record =>
    new Date(record.date).toDateString()
  )).size;

  return {
    totalWorkouts,
    totalVolume,
    uniqueDays,
    averageVolumePerDay: uniqueDays > 0 ? totalVolume / uniqueDays : 0
  };
};

export const formatStatsValue = (key: string, value: number): string => {
  if (key === 'totalVolume' || key === 'averageVolumePerDay') {
    return `${formatNumberToString(value)} kg`;
  }
  return value.toString();
}; 