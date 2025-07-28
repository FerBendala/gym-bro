import { getDay } from 'date-fns';
import type { WorkoutRecord } from '../../interfaces';
import { calculateRealVolume } from './volume-calculations';

/**
 * Calcula tendencia de volumen por día de la semana
 * CORREGIDO: Comparación justa de volumen promedio por sesión del mismo día
 */
export const calculateVolumeTrendByDay = (records: WorkoutRecord[]): { day: string; trend: number }[] => {
  if (records.length === 0) return [];

  // Asegurar que los registros estén ordenados cronológicamente
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const trends: { day: string; trend: number }[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    // Obtener todos los entrenamientos de este día específico
    const dayRecords = sortedRecords.filter(r => getDay(new Date(r.date)) === dayIndex);

    let trend = 0;

    if (dayRecords.length >= 3) {
      // Calcular tendencias con 3+ entrenamientos usando lógica realista
      const sortedDayRecords = dayRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (dayRecords.length >= 4) {
        // CORRECCIÓN CLAVE: Verificar si hay distribución temporal real
        const uniqueDates = new Set(sortedDayRecords.map(r => r.date.toDateString()));

        if (uniqueDates.size <= 2) {
          // Si todos los entrenamientos están en 1-2 días, no calcular tendencia temporal
          trend = 10; // Tendencia positiva leve por actividad consistente
        } else {
          // Solo si hay distribución temporal real, calcular tendencia
          const halfPoint = Math.floor(sortedDayRecords.length / 2);
          const olderOccurrences = sortedDayRecords.slice(0, halfPoint);
          const recentOccurrences = sortedDayRecords.slice(halfPoint);

          const olderAvgVolume = olderOccurrences.reduce((sum, r) =>
            sum + calculateRealVolume(r), 0) / olderOccurrences.length;

          const recentAvgVolume = recentOccurrences.reduce((sum, r) =>
            sum + calculateRealVolume(r), 0) / recentOccurrences.length;

          if (olderAvgVolume > 0) {
            const rawTrend = ((recentAvgVolume - olderAvgVolume) / olderAvgVolume) * 100;
            // Aplicar threshold realista para detectar cambios significativos
            if (Math.abs(rawTrend) >= 8) {
              trend = Math.max(-30, Math.min(30, Math.round(rawTrend * 0.6))); // Factor conservador
            } else {
              trend = 5; // Tendencia positiva leve por defecto
            }
          } else if (recentAvgVolume > 0) {
            trend = 25; // Comenzó a entrenar en este día
          }
        }
      } else {
        // Para exactamente 3 entrenamientos: verificar distribución temporal
        const uniqueDates = new Set(sortedDayRecords.map(r => r.date.toDateString()));

        if (uniqueDates.size <= 1) {
          // Si todos los entrenamientos están en el mismo día
          trend = 8; // Tendencia positiva leve por actividad
        } else {
          // Si hay distribución temporal, comparar primer vs último
          const firstVolume = calculateRealVolume(sortedDayRecords[0]);
          const lastVolume = calculateRealVolume(sortedDayRecords[2]);

          if (firstVolume > 0) {
            const rawTrend = ((lastVolume - firstVolume) / firstVolume) * 100;
            // Threshold más bajo para pocos datos
            if (Math.abs(rawTrend) >= 12) {
              trend = Math.max(-20, Math.min(20, Math.round(rawTrend * 0.5))); // Factor muy conservador
            } else {
              trend = 5; // Leve positivo por defecto con pocos datos
            }
          } else {
            trend = 5;
          }
        }
      }
    } else if (dayRecords.length === 2) {
      // Para 2 entrenamientos: verificar si están en días diferentes
      const sortedDayRecords = dayRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const uniqueDates = new Set(sortedDayRecords.map(r => r.date.toDateString()));

      if (uniqueDates.size <= 1) {
        // Si ambos entrenamientos están en el mismo día
        trend = 6; // Tendencia positiva leve por actividad
      } else {
        // Si están en días diferentes, comparar con mucha cautela
        const firstVolume = calculateRealVolume(sortedDayRecords[0]);
        const lastVolume = calculateRealVolume(sortedDayRecords[1]);

        if (firstVolume > 0) {
          const rawTrend = ((lastVolume - firstVolume) / firstVolume) * 100;
          // Solo marcar tendencia si hay cambio muy significativo
          if (rawTrend > 25) {
            trend = Math.min(15, Math.round(rawTrend * 0.3)); // Factor muy conservador
          } else if (rawTrend < -30) {
            trend = Math.max(-10, Math.round(rawTrend * 0.3));
          } else {
            trend = 3; // Muy leve positivo por defecto
          }
        } else {
          trend = 3;
        }
      }
    } else if (dayRecords.length === 1) {
      // Primera vez entrenando en este día = tendencia positiva leve
      trend = 20; // Positivo moderado para nuevo día
    }

    trends.push({
      day: dayNames[dayIndex],
      trend
    });
  }

  return trends;
}; 