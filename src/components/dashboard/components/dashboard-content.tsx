import { Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { ExerciseProgressChart } from '../../exercise-progress-chart';
import { ExerciseStats } from '../../exercise-stats';
import { RecentWorkouts } from '../../recent-workouts';
import { InfoTooltip } from '../../tooltip';
import type { DashboardContentProps } from '../types';
import { AdvancedTab } from './advanced-tab';
import { CategoryTab } from './category-tab';
import { PerformanceTab } from './performance-tab';
import { TrendsTab } from './trends-tab';

export const DashboardContent: React.FC<DashboardContentProps> = ({
  filteredRecords,
  allRecords,
  activeTab,
  onDeleteRecord
}) => {
  // Vista principal - Resumen general
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Estadísticas generales */}
      <div className="lg:col-span-2">
        <ExerciseStats records={filteredRecords} />
      </div>

      {/* Gráfico de progreso */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Progreso de Peso
              <InfoTooltip
                content="Gráfico que muestra la evolución del peso utilizado en tus ejercicios a lo largo del tiempo. Te ayuda a visualizar tu progreso y identificar tendencias de mejora."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <ExerciseProgressChart records={filteredRecords} />
          </CardContent>
        </Card>
      </div>

      {/* Entrenamientos recientes */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Entrenamientos Recientes
              <InfoTooltip
                content="Lista de tus últimos entrenamientos registrados. Incluye detalles como fecha, ejercicio, peso, repeticiones y series realizadas."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent size="none">
            <RecentWorkouts
              records={filteredRecords.slice(0, 10)}
              onDeleteRecord={onDeleteRecord}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Renderizar contenido según el tab activo
  switch (activeTab) {
    case 'overview':
      return renderOverviewTab();
    case 'performance':
      return <PerformanceTab records={filteredRecords} />;
    case 'categories':
      return <CategoryTab records={filteredRecords} />;
    case 'trends':
      return <TrendsTab records={filteredRecords} />;
    case 'advanced':
      return <AdvancedTab records={filteredRecords} />;
    default:
      return renderOverviewTab();
  }
}; 