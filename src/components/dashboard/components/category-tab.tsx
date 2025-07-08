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

        {/* Balance muscular avanzado */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Balance Muscular Avanzado
              <InfoTooltip
                content="Análisis comprehensivo de equilibrio muscular incluyendo simetría, ratios antagonistas, tendencias de progreso y recomendaciones específicas."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.muscleBalance.slice(0, 6).map((balance) => {
                const getPriorityColor = (priority: string) => {
                  switch (priority) {
                    case 'critical': return 'text-red-400 bg-red-900/20';
                    case 'high': return 'text-orange-400 bg-orange-900/20';
                    case 'medium': return 'text-yellow-400 bg-yellow-900/20';
                    default: return 'text-green-400 bg-green-900/20';
                  }
                };

                const getTrendIcon = (trend: string) => {
                  switch (trend) {
                    case 'improving': return '📈';
                    case 'declining': return '📉';
                    default: return '➡️';
                  }
                };

                const getStageEmoji = (stage: string) => {
                  switch (stage) {
                    case 'advanced': return '🏆';
                    case 'intermediate': return '💪';
                    case 'beginner': return '🌱';
                    default: return '⚠️';
                  }
                };

                return (
                  <div
                    key={balance.category}
                    className={`p-4 rounded-lg border ${balance.isBalanced
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                      }`}
                  >
                    {/* Header con información principal */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white">
                          {balance.category}
                        </h4>
                        <span className="text-sm">
                          {getStageEmoji(balance.developmentStage)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(balance.priorityLevel)}`}>
                          {balance.priorityLevel}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {getTrendIcon(balance.progressTrend)}
                        </span>
                        {balance.isBalanced ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-sm font-medium text-white">
                          {balance.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Métricas avanzadas */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Simetría</p>
                        <p className="text-sm font-medium text-white">
                          {balance.symmetryScore}/100
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Fuerza</p>
                        <p className="text-sm font-medium text-white">
                          {balance.strengthIndex}/100
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Frecuencia</p>
                        <p className="text-sm font-medium text-white">
                          {balance.weeklyFrequency.toFixed(1)}/sem
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Intensidad</p>
                        <p className="text-sm font-medium text-white">
                          {balance.intensityScore}%
                        </p>
                      </div>
                    </div>

                    {/* Desviación del ideal */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Ideal: {balance.idealPercentage}%</span>
                        <span>Actual: {balance.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${balance.isBalanced ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{
                            width: `${Math.min(100, Math.max(0, balance.percentage))}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Desviación: {balance.deviation > 0 ? '+' : ''}{balance.deviation.toFixed(1)}%
                      </p>
                    </div>

                    {/* Historia del balance */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Consistencia del balance</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{
                              width: `${balance.balanceHistory.consistency}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {balance.balanceHistory.consistency}%
                        </span>
                      </div>
                    </div>

                    {/* Recomendación principal */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Recomendación principal</p>
                      <p className="text-sm text-white">
                        {balance.recommendation}
                      </p>
                    </div>

                    {/* Recomendaciones específicas */}
                    {balance.specificRecommendations.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-400 mb-1">Acciones específicas</p>
                        <div className="space-y-1">
                          {balance.specificRecommendations.slice(0, 2).map((rec, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-xs"
                            >
                              <span className="text-blue-400">•</span>
                              <span className="text-gray-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advertencias */}
                    {balance.warnings.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Advertencias</p>
                        <div className="space-y-1">
                          {balance.warnings.slice(0, 2).map((warning, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-xs"
                            >
                              <span className="text-red-400">⚠️</span>
                              <span className="text-red-300">{warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de análisis de balance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Resumen de Balance Muscular
            <InfoTooltip
              content="Análisis general del equilibrio muscular con insights y recomendaciones prioritarias."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Distribución por prioridad */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Distribución por Prioridad</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['critical', 'high', 'medium', 'low'].map(priority => {
                  const count = analysis.muscleBalance.filter(b => b.priorityLevel === priority).length;
                  const getColor = (p: string) => {
                    switch (p) {
                      case 'critical': return 'text-red-400 bg-red-900/20';
                      case 'high': return 'text-orange-400 bg-orange-900/20';
                      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
                      default: return 'text-green-400 bg-green-900/20';
                    }
                  };

                  return (
                    <div
                      key={priority}
                      className={`p-3 rounded-lg border ${getColor(priority)}`}
                    >
                      <div className="text-center">
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-xs capitalize">{priority}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categorías en progreso vs decline */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Tendencias de Progreso</h4>
              <div className="grid grid-cols-3 gap-3">
                {['improving', 'stable', 'declining'].map(trend => {
                  const count = analysis.muscleBalance.filter(b => b.progressTrend === trend).length;
                  const getIcon = (t: string) => {
                    switch (t) {
                      case 'improving': return '📈';
                      case 'declining': return '📉';
                      default: return '➡️';
                    }
                  };
                  const getColor = (t: string) => {
                    switch (t) {
                      case 'improving': return 'text-green-400 bg-green-900/20';
                      case 'declining': return 'text-red-400 bg-red-900/20';
                      default: return 'text-gray-400 bg-gray-800/20';
                    }
                  };

                  return (
                    <div
                      key={trend}
                      className={`p-3 rounded-lg border ${getColor(trend)}`}
                    >
                      <div className="text-center">
                        <p className="text-lg">{getIcon(trend)}</p>
                        <p className="text-sm font-medium">{count}</p>
                        <p className="text-xs capitalize">{trend}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Etapas de desarrollo */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Etapas de Desarrollo</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['advanced', 'intermediate', 'beginner', 'neglected'].map(stage => {
                  const count = analysis.muscleBalance.filter(b => b.developmentStage === stage).length;
                  const getIcon = (s: string) => {
                    switch (s) {
                      case 'advanced': return '🏆';
                      case 'intermediate': return '💪';
                      case 'beginner': return '🌱';
                      default: return '⚠️';
                    }
                  };
                  const getColor = (s: string) => {
                    switch (s) {
                      case 'advanced': return 'text-purple-400 bg-purple-900/20';
                      case 'intermediate': return 'text-blue-400 bg-blue-900/20';
                      case 'beginner': return 'text-green-400 bg-green-900/20';
                      default: return 'text-red-400 bg-red-900/20';
                    }
                  };

                  return (
                    <div
                      key={stage}
                      className={`p-3 rounded-lg border ${getColor(stage)}`}
                    >
                      <div className="text-center">
                        <p className="text-lg">{getIcon(stage)}</p>
                        <p className="text-sm font-medium">{count}</p>
                        <p className="text-xs capitalize">{stage}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recomendaciones generales */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recomendaciones Principales</h4>
              <div className="space-y-2">
                {analysis.muscleBalance
                  .filter(b => b.priorityLevel === 'critical' || b.priorityLevel === 'high')
                  .slice(0, 3)
                  .map((balance, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg"
                    >
                      <span className="text-orange-400">•</span>
                      <span className="text-sm text-gray-300">
                        <span className="font-medium text-white">{balance.category}:</span>{' '}
                        {balance.recommendation}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Advertencias críticas */}
            {analysis.muscleBalance.some(b => b.warnings.length > 0) && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Advertencias Críticas</h4>
                <div className="space-y-2">
                  {analysis.muscleBalance
                    .filter(b => b.warnings.length > 0)
                    .slice(0, 3)
                    .map((balance, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-red-900/20 rounded-lg border border-red-500/30"
                      >
                        <span className="text-red-400">⚠️</span>
                        <span className="text-sm text-red-300">
                          <span className="font-medium text-red-200">{balance.category}:</span>{' '}
                          {balance.warnings[0]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};