import { Calendar, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { ExerciseProgressChart } from '../../exercise-progress-chart';
import { ExerciseStats } from '../../exercise-stats';
import { RecentWorkouts } from '../../recent-workouts';
import { WorkoutCalendar } from '../../workout-calendar';
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
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Progreso de Peso
          </h3>
        </CardHeader>
        <CardContent>
          <ExerciseProgressChart records={filteredRecords} />
        </CardContent>
      </Card>

      {/* Calendario de entrenamientos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendario de Entrenamientos
          </h3>
        </CardHeader>
        <CardContent>
          <WorkoutCalendar records={allRecords} />
        </CardContent>
      </Card>

      {/* Entrenamientos recientes */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Entrenamientos Recientes
            </h3>
          </CardHeader>
          <CardContent>
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