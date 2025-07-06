import { BarChart3, Filter, Layers, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getExercises, getWorkoutRecords } from '../../../api/database';
import { AnalyticsOverview, ExerciseAnalytics, ProgressTimeline } from '../../../components/analytics';
import { Card, CardContent } from '../../../components/card';
import { LoadingSpinner } from '../../../components/loading-spinner';
import { ModernPage, ModernSection } from '../../../components/modern-ui';
import { Select } from '../../../components/select';
import type { WorkoutRecord } from '../../../interfaces';

/**
 * Página de estadísticas moderna con analytics completos
 */
export const ModernStats: React.FC = () => {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'timeline' | 'exercises'>('overview');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  // Cargar datos de entrenamientos y ejercicios
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar tanto registros como ejercicios
        const [workoutRecords, exercises] = await Promise.all([
          getWorkoutRecords(),
          getExercises()
        ]);

        // Enriquecer los registros con información del ejercicio
        const enrichedRecords = workoutRecords.map(record => ({
          ...record,
          exercise: exercises.find(ex => ex.id === record.exerciseId)
        }));

        setRecords(enrichedRecords);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos de entrenamientos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar registros por período
  const filteredRecords = React.useMemo(() => {
    if (timeFilter === 'all') return records;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeFilter) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }

    return records.filter(record => record.date >= cutoffDate);
  }, [records, timeFilter]);

  if (loading) {
    return (
      <ModernPage
        title="Análisis"
        subtitle="Métricas detalladas y análisis avanzado"
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-400 text-sm ml-4">Cargando análisis...</p>
        </div>
      </ModernPage>
    );
  }

  if (error) {
    return (
      <ModernPage
        title="Análisis"
        subtitle="Métricas detalladas y análisis avanzado"
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

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'overview': return BarChart3;
      case 'timeline': return Layers;
      case 'exercises': return Target;
      default: return BarChart3;
    }
  };

  return (
    <ModernPage
      title="Análisis"
      subtitle="Métricas detalladas y análisis avanzado"
    >
      {/* Controles de navegación */}
      <ModernSection>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Selector de vista */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vista de análisis
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'timeline', label: 'Timeline', icon: Layers },
                { id: 'exercises', label: 'Ejercicios', icon: Target }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id as any)}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de período */}
          <div className="flex-1">
            <Select
              label="Período de análisis"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              options={[
                { value: 'week', label: 'Última semana' },
                { value: 'month', label: 'Último mes' },
                { value: 'quarter', label: 'Últimos 3 meses' },
                { value: 'all', label: 'Todo el tiempo' }
              ]}
            />
          </div>
        </div>

        {/* Información del filtro activo */}
        {filteredRecords.length !== records.length && (
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <p className="text-sm text-blue-300">
                Mostrando datos de <strong>{filteredRecords.length}</strong> entrenamientos
                de los últimos <strong>
                  {timeFilter === 'week' ? '7 días' :
                    timeFilter === 'month' ? '30 días' :
                      timeFilter === 'quarter' ? '3 meses' : 'todo el tiempo'}
                </strong>
              </p>
            </div>
          </div>
        )}
      </ModernSection>

      {/* Contenido principal */}
      <ModernSection>
        {activeView === 'overview' && (
          <AnalyticsOverview records={filteredRecords} />
        )}

        {activeView === 'timeline' && (
          <ProgressTimeline records={filteredRecords} />
        )}

        {activeView === 'exercises' && (
          <ExerciseAnalytics records={filteredRecords} />
        )}
      </ModernSection>

      {/* Estado vacío */}
      {filteredRecords.length === 0 && (
        <ModernSection>
          <Card>
            <CardContent>
              <div className="text-center py-12">
                {React.createElement(getViewIcon(activeView), {
                  className: "w-12 h-12 text-gray-400 mx-auto mb-4"
                })}
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay datos para este período
                </h3>
                <p className="text-gray-500">
                  {timeFilter === 'all'
                    ? 'Comienza a registrar entrenamientos para ver análisis detallados'
                    : 'Prueba con un período más amplio o registra más entrenamientos'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </ModernSection>
      )}
    </ModernPage>
  );
}; 