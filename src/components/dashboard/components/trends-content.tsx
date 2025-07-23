import React from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { Card, CardContent, CardHeader } from '../../card';

interface TrendsContentProps {
  records: WorkoutRecord[];
}

export const TrendsContent: React.FC<TrendsContentProps> = ({ records }) => {
  // Calcular tendencias básicas
  const trends = React.useMemo(() => {
    if (records.length === 0) return {};

    // Agrupar por semana
    const weeklyData = records.reduce((acc, record) => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!acc[weekKey]) {
        acc[weekKey] = {
          volume: 0,
          workouts: 0,
          maxWeight: 0
        };
      }

      acc[weekKey].volume += record.weight * record.reps * record.sets;
      acc[weekKey].workouts += 1;
      acc[weekKey].maxWeight = Math.max(acc[weekKey].maxWeight, record.weight);

      return acc;
    }, {} as Record<string, { volume: number; workouts: number; maxWeight: number }>);

    // Calcular tendencias
    const weeks = Object.keys(weeklyData).sort();
    if (weeks.length < 2) return {};

    const recentWeeks = weeks.slice(-4); // Últimas 4 semanas
    const volumeTrend = recentWeeks.map(week => weeklyData[week].volume);
    const workoutTrend = recentWeeks.map(week => weeklyData[week].workouts);
    const weightTrend = recentWeeks.map(week => weeklyData[week].maxWeight);

    return {
      volumeTrend,
      workoutTrend,
      weightTrend,
      weeks: recentWeeks
    };
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📈</span>
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para análisis de tendencias
        </h3>
        <p className="text-gray-500">
          Registra más entrenamientos para ver las tendencias
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tendencias de Volumen */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Tendencias de Volumen Semanal
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.volumeTrend && trends.volumeTrend.map((volume, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-400">
                  Semana {index + 1}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((volume / Math.max(...trends.volumeTrend)) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="w-20 text-sm text-white text-right">
                  {Math.round(volume)}kg
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias de Frecuencia */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📅</span>
            Frecuencia de Entrenamientos
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.workoutTrend && trends.workoutTrend.map((workouts, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-400">
                  Semana {index + 1}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((workouts / Math.max(...trends.workoutTrend)) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="w-20 text-sm text-white text-right">
                  {workouts} sesiones
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias de Peso */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">💪</span>
            Progreso de Peso Máximo
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.weightTrend && trends.weightTrend.map((weight, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-400">
                  Semana {index + 1}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((weight / Math.max(...trends.weightTrend)) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="w-20 text-sm text-white text-right">
                  {weight}kg
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 