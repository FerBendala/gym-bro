import { BarChart3 } from 'lucide-react';
import React from 'react';

import { useAnalyticsMetrics } from './hooks/use-analytics-metrics';
import type { AnalyticsOverviewProps } from './types';
import { getMetricColor, getMetricIcon, getTrendColor, getTrendIcon } from './utils/analytics-utils';

import { Card, CardContent } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';

/**
 * Componente de overview principal de analytics
 */
export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ records }) => {
  const { metrics } = useAnalyticsMetrics(records);

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos para analizar
            </h3>
            <p className="text-gray-500">
              Registra algunos entrenamientos para ver métricas detalladas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Resumen de Métricas</h2>
          <p className="text-gray-400">Análisis general de tu progreso de entrenamiento</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = getMetricIcon(metric.id);
          const TrendIcon = getTrendIcon(metric.trend);
          const colorClasses = getMetricColor(metric.color);
          const trendColorClass = getTrendColor(metric.trend);

          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-400">
                          {metric.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {metric.value.toLocaleString()}{metric.unit && ` ${metric.unit}`}
                      </p>

                      {metric.trendValue !== 0 && (
                        <div className={`flex items-center space-x-1 ${trendColorClass}`}>
                          <TrendIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {metric.trendValue > 0 ? '+' : ''}{metric.trendValue.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <InfoTooltip
                    content={metric.description}
                    position="left"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
