import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import { Calendar } from 'lucide-react';
import React from 'react';
import { TimelineItem, TimelineStats } from './components';
import { useTimelineData } from './hooks';
import type { ExtendedTimelinePoint } from './hooks/use-timeline-data';
import type { ProgressTimelineProps } from './types';

/**
 * Componente de timeline de progreso
 */
export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ records }) => {
  const { timelineData, maxValue, totalGrowthPercent } = useTimelineData(records);

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos de progreso
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos durante varias semanas para ver tu evolución
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Línea de Tiempo de Progreso
          <InfoTooltip
            content="Visualización cronológica de tu progreso semanal con detalles de cada período y comparativas entre semanas."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estadísticas generales */}
          <TimelineStats
            timelineData={timelineData}
            maxValue={maxValue}
            totalGrowthPercent={totalGrowthPercent}
          />

          {/* Timeline detallada */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Progreso Semanal Detallado</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timelineData.slice().reverse().map((point: ExtendedTimelinePoint, index: number) => (
                <TimelineItem key={index} point={point} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 