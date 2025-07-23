import { getWorkoutRecords } from '@/api/services';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ModernPage, ModernSection } from '@/components/modern-ui';
import { InfoTooltip } from '@/components/tooltip';
import { WorkoutCalendar } from '@/components/workout-calendar';
import type { WorkoutRecord } from '@/interfaces';
import { formatNumber } from '@/utils/functions';
import { Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/card';

/**
 * Página de calendario moderna con datos reales
 */
export const ModernCalendar: React.FC = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de entrenamientos
  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        const workoutRecords = await getWorkoutRecords();
        setRecords(workoutRecords);
      } catch (err) {
        console.error('Error loading workout records:', err);
        setError('Error al cargar los datos de entrenamientos');
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, []);

  // Calcular estadísticas del mes actual
  const getCurrentMonthStats = () => {
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

  if (loading) {
    return (
      <ModernPage
        title="Calendario"
        subtitle="Vista mensual de entrenamientos"
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </ModernPage>
    );
  }

  if (error) {
    return (
      <ModernPage
        title="Calendario"
        subtitle="Vista mensual de entrenamientos"
      >
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">Error al cargar datos</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </ModernPage>
    );
  }

  const monthStats = getCurrentMonthStats();

  return (
    <ModernPage
      title="Calendario"
      subtitle="Vista mensual de entrenamientos"
    >
      {/* Estadísticas del mes actual */}
      <ModernSection
        title="Resumen del Mes"
        subtitle="Estadísticas de entrenamientos del mes actual"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {monthStats.totalWorkouts}
              </p>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <span>Ejercicios</span>
                <InfoTooltip
                  content="Número total de ejercicios registrados en el mes actual."
                  position="top"
                  className="ml-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {monthStats.uniqueDays}
              </p>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <span>Días activos</span>
                <InfoTooltip
                  content="Número de días únicos en los que has entrenado este mes."
                  position="top"
                  className="ml-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {formatNumber(monthStats.totalVolume)} kg
              </p>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <span>Volumen total</span>
                <InfoTooltip
                  content="Suma total de peso levantado (peso × repeticiones × series) en el mes."
                  position="top"
                  className="ml-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {formatNumber(monthStats.averageVolumePerDay)} kg
              </p>
              <div className="text-sm text-gray-400 flex items-center justify-center">
                <span>Promedio/día</span>
                <InfoTooltip
                  content="Volumen promedio de entrenamiento por día activo en el mes."
                  position="top"
                  className="ml-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ModernSection>

      {/* Calendario principal */}
      <ModernSection>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Calendario de Entrenamientos
              <InfoTooltip
                content="Vista mensual que muestra los días en los que has entrenado. Los puntos indican la intensidad del entrenamiento basada en el volumen total levantado."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <WorkoutCalendar records={records} />
          </CardContent>
        </Card>
      </ModernSection>

      {/* Información adicional */}
      {records.length === 0 && (
        <ModernSection>
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay entrenamientos registrados
                </h3>
                <p className="text-gray-500">
                  Comienza a registrar tus entrenamientos para ver tu progreso en el calendario
                </p>
              </div>
            </CardContent>
          </Card>
        </ModernSection>
      )}
    </ModernPage>
  );
}; 