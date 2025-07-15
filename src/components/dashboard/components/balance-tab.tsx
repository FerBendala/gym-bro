import { Activity, AlertTriangle, BarChart, CheckCircle, Dumbbell, Scale, Timer, TrendingDown, TrendingUp, Trophy, XCircle, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import { getCategoryColor, getCategoryIcon } from '../../../constants/exercise-categories';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '../../../utils/functions/category-analysis';
import { Card } from '../../card';
import { CardContent } from '../../card/components/card-content';
import { CardHeader } from '../../card/components/card-header';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface BalanceTabProps {
  records: WorkoutRecord[];
}

// Función utilitaria para validar valores numéricos
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const { muscleBalance, balanceScore, categoryAnalysis } = useMemo(() => {
    const balance = analyzeMuscleBalance(records);
    const score = calculateBalanceScore(balance);
    const analysis = calculateCategoryAnalysis(records);
    return { muscleBalance: balance, balanceScore: score, categoryAnalysis: analysis };
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Scale className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos de balance muscular
        </h3>
        <p className="text-gray-500">
          Registra algunos entrenamientos para ver tu análisis de balance muscular
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales con información de balance y categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Score de Balance"
          value={`${safeNumber(balanceScore)}%`}
          icon={Activity}
          variant={balanceScore >= 80 ? 'success' : balanceScore >= 60 ? 'warning' : 'danger'}
          tooltip="Puntuación que indica qué tan equilibrado está tu entrenamiento entre diferentes grupos musculares."
          tooltipPosition="top"
        />

        <StatCard
          title="Grupos en Balance"
          value={muscleBalance.filter(b => b.isBalanced).length.toString()}
          icon={CheckCircle}
          variant="success"
          tooltip="Número de grupos musculares que están dentro del rango ideal de volumen de entrenamiento."
          tooltipPosition="top"
        />

        <StatCard
          title="Desbalance Crítico"
          value={muscleBalance.filter(b => b.priorityLevel === 'critical').length.toString()}
          icon={AlertTriangle}
          variant="danger"
          tooltip="Grupos musculares con desbalance crítico que requieren corrección inmediata."
          tooltipPosition="top"
        />

        <StatCard
          title="Categoría Principal"
          value={categoryAnalysis.dominantCategory || 'N/A'}
          icon={Trophy}
          variant="indigo"
          tooltip="El grupo muscular al que dedicas más tiempo y volumen de entrenamiento."
          tooltipPosition="top"
        />

        <StatCard
          title="Volumen Total"
          value={formatNumber(categoryAnalysis.categoryMetrics.reduce((sum, m) => sum + m.totalVolume, 0))}
          icon={Dumbbell}
          variant="success"
          tooltip="Volumen total de entrenamiento sumando todas las categorías con distribución por esfuerzo."
          tooltipPosition="top"
        />
      </div>

      {/* Análisis visual de balance muscular con información detallada */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Análisis de Balance y Progreso por Categoría
            <InfoTooltip
              content="Vista completa del equilibrio muscular con métricas de progreso, balance y recomendaciones personalizadas."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {muscleBalance
              .filter(balance => balance.volume > 0 || balance.priorityLevel === 'critical')
              .map((balance) => {
                const Icon = getCategoryIcon(balance.category);
                const colorGradient = getCategoryColor(balance.category);

                // Obtener métricas detalladas de la categoría
                const categoryMetric = categoryAnalysis.categoryMetrics.find(m => m.category === balance.category);

                const getPriorityBadge = () => {
                  switch (balance.priorityLevel) {
                    case 'critical': return { text: 'Crítico', color: 'bg-red-500 text-white' };
                    case 'high': return { text: 'Alto', color: 'bg-orange-500 text-white' };
                    case 'medium': return { text: 'Medio', color: 'bg-yellow-500 text-black' };
                    default: return { text: 'Bajo', color: 'bg-green-500 text-white' };
                  }
                };

                const getTrendBadge = () => {
                  switch (balance.progressTrend) {
                    case 'improving': return { text: 'Mejorando', color: 'bg-green-500 text-white', icon: TrendingUp };
                    case 'declining': return { text: 'Declinando', color: 'bg-red-500 text-white', icon: TrendingDown };
                    default: return { text: 'Estable', color: 'bg-gray-500 text-white', icon: null };
                  }
                };

                const getDaysColor = (days: number) => {
                  if (days <= 3) return 'text-green-400';
                  if (days <= 7) return 'text-yellow-400';
                  if (days <= 14) return 'text-orange-400';
                  return 'text-red-400';
                };

                const priorityBadge = getPriorityBadge();
                const trendBadge = getTrendBadge();

                return (
                  <div
                    key={balance.category}
                    className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br ${balance.isBalanced ? 'from-gray-800 to-gray-900' : 'from-gray-900 to-black'
                      } border ${balance.isBalanced ? 'border-green-500/20' : 'border-red-500/20'
                      } hover:border-opacity-40 transition-all duration-200`}
                  >
                    {/* Header con ícono y estado */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                            {balance.category}
                          </h4>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                              {priorityBadge.text}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendBadge.color}`}>
                              {trendBadge.text}
                            </span>
                            {trendBadge.icon && (
                              <trendBadge.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${balance.progressTrend === 'declining' ? 'text-red-400' : 'text-green-400'}`} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Porcentaje e indicador de balance */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                          {safeNumber(balance.percentage, 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">
                          del volumen total
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ideal: {safeNumber(balance.idealPercentage, 0)}%
                        </div>
                        <div className="mt-1 sm:mt-2 flex justify-end">
                          {balance.isBalanced ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso visual mejorada */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Volumen: {formatNumber(balance.volume)} kg</span>
                        <span className="text-gray-300">
                          Desviación: {balance.deviation > 0 ? '+' : ''}{balance.deviation.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                        {/* Zona ideal */}
                        <div
                          className="absolute top-0 bg-green-500/20 h-full border-x-2 border-green-500/40"
                          style={{
                            left: `${Math.max(0, safeNumber(balance.idealPercentage, 0) - 2)}%`,
                            width: '4%'
                          }}
                        />
                        {/* Barra actual */}
                        <div
                          className={`relative h-full bg-gradient-to-r ${colorGradient} transition-all duration-300`}
                          style={{ width: `${Math.min(100, Math.max(0, safeNumber(balance.percentage, 0)))}%` }}
                        >
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        </div>
                        {/* Indicador de posición ideal */}
                        <div
                          className="absolute top-0 w-0.5 h-full bg-green-400"
                          style={{ left: `${safeNumber(balance.idealPercentage, 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Métricas de balance y progreso */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                          Intensidad
                          <InfoTooltip
                            content="Porcentaje que indica qué tan intenso entrenas este grupo muscular basado en peso relativo a tu máximo"
                            position="top"
                          />
                        </div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.intensityScore, 0)}%
                        </div>
                        <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${safeNumber(balance.intensityScore, 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                          Simetría
                          <InfoTooltip
                            content="Score que mide el equilibrio del entrenamiento de este grupo muscular en comparación con sus antagonistas"
                            position="top"
                          />
                        </div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.symmetryScore, 0)}%
                        </div>
                        <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${safeNumber(balance.symmetryScore, 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                          Frecuencia
                          <InfoTooltip
                            content="Número promedio de entrenamientos por semana para este grupo muscular. Ideal: 2-3 veces por semana"
                            position="top"
                          />
                        </div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.weeklyFrequency, 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">por semana</div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                          Índice Fuerza
                          <InfoTooltip
                            content="Indicador del nivel de desarrollo de fuerza relativo. Se basa en peso manejado vs tu peso corporal y métricas históricas"
                            position="top"
                          />
                        </div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.strengthIndex, 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {balance.developmentStage}
                        </div>
                      </div>
                    </div>

                    {/* Información detallada de progreso */}
                    {categoryMetric && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* Progresión detallada */}
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                            {trendBadge.icon ? (
                              <trendBadge.icon className={`w-3 h-3 ${balance.progressTrend === 'declining' ? 'text-red-400' : 'text-green-400'}`} />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            Progresión y PRs
                          </h5>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <InfoTooltip
                                  content="Cambio porcentual en peso promedio vs período anterior"
                                  position="top"
                                />
                                Peso:
                              </span>
                              <span className={`text-xs font-medium ${categoryMetric.weightProgression > 0 ? 'text-green-400' : categoryMetric.weightProgression < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                {categoryMetric.weightProgression > 0 ? '+' : ''}{categoryMetric.weightProgression}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <InfoTooltip
                                  content="Cambio porcentual en volumen total (peso × reps × series) vs período anterior"
                                  position="top"
                                />
                                Volumen:
                              </span>
                              <span className={`text-xs font-medium ${categoryMetric.volumeProgression > 0 ? 'text-green-400' : categoryMetric.volumeProgression < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                {categoryMetric.volumeProgression > 0 ? '+' : ''}{categoryMetric.volumeProgression}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <InfoTooltip
                                  content="Record personal logrado en este grupo muscular"
                                  position="top"
                                />
                                PRs:
                              </span>
                              <span className="text-xs font-medium text-purple-400">
                                {categoryMetric.personalRecords}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actividad y consistencia */}
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            Actividad y Consistencia
                          </h5>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <InfoTooltip
                                  content="Días transcurridos desde el último entrenamiento de este grupo muscular. Verde ≤3 días, amarillo ≤7 días, naranja ≤14 días, rojo >14 días"
                                  position="top"
                                />
                                Último entreno:
                              </span>
                              <span className={`text-xs font-medium ${getDaysColor(categoryMetric?.daysSinceLastWorkout || 0)}`}>
                                {(categoryMetric?.daysSinceLastWorkout || 0) === 0 ? 'Hoy' :
                                  (categoryMetric?.daysSinceLastWorkout || 0) === 1 ? 'Ayer' :
                                    `${categoryMetric?.daysSinceLastWorkout || 0}d`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <InfoTooltip
                                  content="Regularidad del entrenamiento. Mide qué tan constante eres entrenando este grupo muscular a lo largo del tiempo"
                                  position="top"
                                />
                                Consistencia:
                              </span>
                              <span className="text-xs font-medium text-orange-400">
                                {safeNumber(categoryMetric?.consistencyScore, 0)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <InfoTooltip
                                  content="Relación entre el volumen entrenado y el tiempo invertido. Mayor eficiencia = más volumen en menos tiempo"
                                  position="top"
                                />
                                Eficiencia:
                              </span>
                              <span className="text-xs font-medium text-blue-400">
                                {safeNumber(categoryMetric?.efficiencyScore, 0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recomendaciones específicas de balance */}
                    <div className="space-y-2">
                      {/* Recomendaciones específicas */}
                      {balance.specificRecommendations && balance.specificRecommendations.length > 0 && (
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-blue-300 break-words">
                                {balance.specificRecommendations[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advertencias */}
                      {balance.warnings && balance.warnings.length > 0 && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-red-300 break-words">
                                {balance.warnings[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 