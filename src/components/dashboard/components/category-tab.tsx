import { Activity, BarChart, CheckCircle, Target, XCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateCategoryAnalysis } from '../../../utils/functions/category-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface CategoryTabProps {
  records: WorkoutRecord[];
}

export const CategoryTab: React.FC<CategoryTabProps> = ({ records }) => {
  const analysis = useMemo(() => calculateCategoryAnalysis(records), [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos por categoría
        </h3>
        <p className="text-gray-500">
          Registra algunos entrenamientos para ver tu análisis por categorías musculares
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales de balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Score de Balance"
          value={`${analysis.balanceScore}%`}
          icon={Activity}
          variant={analysis.balanceScore >= 80 ? 'success' : analysis.balanceScore >= 60 ? 'warning' : 'danger'}
          tooltip="Puntuación que indica qué tan equilibrado está tu entrenamiento entre diferentes grupos musculares. 80%+ es excelente, 60-79% es bueno, <60% necesita mejoras."
          tooltipPosition="top"
        />
        <StatCard
          title="Categorías Entrenadas"
          value={analysis.categoryMetrics.length.toString()}
          icon={Target}
          variant="primary"
          tooltip="Número total de categorías musculares diferentes que has entrenado. Más variedad indica un entrenamiento más completo."
          tooltipPosition="top"
        />
        <StatCard
          title="Categoría Dominante"
          value={analysis.dominantCategory || 'N/A'}
          icon={BarChart}
          variant="indigo"
          tooltip="El grupo muscular al que dedicas más tiempo y volumen de entrenamiento. Considera equilibrar con otros grupos."
          tooltipPosition="top"
        />
        <StatCard
          title="Menos Entrenada"
          value={analysis.leastTrainedCategory || 'N/A'}
          icon={XCircle}
          variant="danger"
          tooltip="El grupo muscular que menos entrenas. Considera aumentar el volumen para lograr un desarrollo más equilibrado."
          tooltipPosition="top"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas por categoría */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Métricas por Categoría
              <InfoTooltip
                content="Desglose detallado de tu entrenamiento por grupo muscular. Muestra volumen total, frecuencia semanal y porcentaje del entrenamiento total."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.categoryMetrics.map((metric) => (
                <div
                  key={metric.category}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {metric.category}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {metric.workouts} entrenamientos • {metric.avgWorkoutsPerWeek}/semana
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">
                      {formatNumber(metric.totalVolume)} kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {metric.percentage}% del total
                    </p>
                  </div>
                </div>
              ))}
              {analysis.categoryMetrics.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No hay categorías registradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance muscular */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Balance Muscular
              <InfoTooltip
                content="Análisis de equilibrio entre grupos musculares. Un entrenamiento balanceado previene lesiones y mejora el rendimiento general."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.muscleBalance.slice(0, 6).map((balance) => (
                <div
                  key={balance.category}
                  className={`p-3 rounded-lg border ${balance.isBalanced
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">
                      {balance.category}
                    </h4>
                    <div className="flex items-center">
                      {balance.isBalanced ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="ml-1 text-sm font-medium text-white">
                        {balance.percentage}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {balance.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución visual */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Distribución de Volumen
              <InfoTooltip
                content="Representación visual de cómo se distribuye tu volumen de entrenamiento entre categorías. Las barras más largas indican mayor enfoque."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gráfico de barras simple */}
              <div className="space-y-2">
                {analysis.categoryMetrics.map((metric) => {
                  const maxVolume = Math.max(...analysis.categoryMetrics.map(m => m.totalVolume));
                  const barWidth = maxVolume > 0 ? (metric.totalVolume / maxVolume) * 100 : 0;

                  return (
                    <div key={metric.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{metric.category}</span>
                        <span className="text-gray-400">
                          {formatNumber(metric.totalVolume)} kg ({metric.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen */}
              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {analysis.muscleBalance.filter(b => b.isBalanced).length}
                    </p>
                    <div className="text-sm text-gray-400 flex items-center justify-center">
                      <span>Categorías balanceadas</span>
                      <InfoTooltip
                        content="Grupos musculares que tienes bien equilibrados en tu rutina de entrenamiento."
                        position="top"
                        className="ml-1"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {analysis.muscleBalance.filter(b => !b.isBalanced && b.volume > 0).length}
                    </p>
                    <div className="text-sm text-gray-400 flex items-center justify-center">
                      <span>Requieren ajuste</span>
                      <InfoTooltip
                        content="Grupos musculares que necesitan más o menos volumen para lograr un entrenamiento equilibrado."
                        position="top"
                        className="ml-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};