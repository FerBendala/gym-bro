import { TrendingUp } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { ExerciseProgressChart } from '../../exercise-progress-chart';
import { ExerciseStats } from '../../exercise-stats';
import { InfoTooltip } from '../../tooltip';
import type { DashboardContentProps } from '../types';

/**
 * Contenido principal del Dashboard
 * Layout responsive que se adapta al contenido filtrado
 */
export const DashboardContent: React.FC<DashboardContentProps> = ({
  filteredRecords,
  onDeleteRecord
}) => (
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
  </div>
); 