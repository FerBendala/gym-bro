import { Activity, AlertTriangle, BarChart, CheckCircle, Dumbbell, Footprints, Hexagon, RotateCcw, Scale, Shield, Target, Timer, TrendingDown, TrendingUp, Triangle, Trophy, XCircle, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryMetrics } from '../../../utils/functions/category-analysis';
import { Card } from '../../card';
import { CardContent } from '../../card/components/card-content';
import { CardHeader } from '../../card/components/card-header';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface BalanceTabProps {
  records: WorkoutRecord[];
}

// Iconos más específicos para cada categoría muscular
const categoryIcons: Record<string, React.FC<any>> = {
  'Pecho': Hexagon,        // Hexágono representa la forma de los pectorales
  'Espalda': Shield,       // Escudo representa la protección/soporte de la espalda
  'Piernas': Footprints,   // Huellas representan el movimiento de piernas
  'Hombros': Triangle,     // Triángulo representa la forma de los deltoides
  'Brazos': Dumbbell,      // Mancuerna es el icono más representativo para brazos
  'Core': RotateCcw        // Rotación representa los movimientos de core/abdominales
};

// Colores para cada categoría
const categoryColors: Record<string, string> = {
  'Pecho': 'from-red-500/80 to-pink-500/80',
  'Espalda': 'from-blue-500/80 to-cyan-500/80',
  'Piernas': 'from-green-500/80 to-emerald-500/80',
  'Hombros': 'from-purple-500/80 to-violet-500/80',
  'Brazos': 'from-orange-500/80 to-amber-500/80',
  'Core': 'from-indigo-500/80 to-blue-500/80'
};

// Función utilitaria para validar valores numéricos
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const { muscleBalance, balanceScore, categoryMetrics } = useMemo(() => {
    const balance = analyzeMuscleBalance(records);
    const score = calculateBalanceScore(balance);
    const metrics = calculateCategoryMetrics(records);
    return { muscleBalance: balance, balanceScore: score, categoryMetrics: metrics };
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
      {/* Métricas principales consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Score de Balance"
          value={`${safeNumber(balanceScore)}%`}
          icon={Scale}
          variant={balanceScore >= 80 ? 'success' : balanceScore >= 60 ? 'warning' : 'danger'}
          tooltip="Puntuación que indica qué tan equilibrado está tu entrenamiento entre diferentes grupos musculares."
          tooltipPosition="top"
        />

        <StatCard
          title="Total Categorías"
          value={categoryMetrics.length.toString()}
          icon={Target}
          variant="primary"
          tooltip="Número total de categorías musculares diferentes que has entrenado."
          tooltipPosition="top"
        />

        <StatCard
          title="Grupos Balanceados"
          value={muscleBalance.filter(b => b.isBalanced).length.toString()}
          icon={CheckCircle}
          variant="success"
          tooltip="Número de grupos musculares que están dentro del rango ideal de volumen de entrenamiento."
          tooltipPosition="top"
        />

        <StatCard
          title="Requieren Atención"
          value={muscleBalance.filter(b => b.priorityLevel === 'high' || b.priorityLevel === 'critical').length.toString()}
          icon={AlertTriangle}
          variant="danger"
          tooltip="Grupos musculares que requieren corrección inmediata o ajustes importantes."
          tooltipPosition="top"
        />

        <StatCard
          title="Volumen Total"
          value={formatNumber(categoryMetrics.reduce((sum, m) => sum + m.totalVolume, 0))}
          icon={Dumbbell}
          variant="indigo"
          tooltip="Volumen total de entrenamiento sumando todas las categorías con distribución por esfuerzo."
          tooltipPosition="top"
        />

        <StatCard
          title="PRs Totales"
          value={categoryMetrics.reduce((sum, m) => sum + m.personalRecords, 0).toString()}
          icon={Trophy}
          variant="warning"
          tooltip="Número total de récords personales establecidos en todas las categorías."
          tooltipPosition="top"
        />
      </div>

      {/* Análisis completo por categoría con balance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Análisis Completo de Balance Muscular
            <InfoTooltip
              content="Vista consolidada del balance muscular con métricas detalladas de rendimiento, progresión y recomendaciones específicas por grupo muscular."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryMetrics.map((metric) => {
              const Icon = categoryIcons[metric.category] || Target;
              const colorGradient = categoryColors[metric.category] || 'from-gray-500/80 to-gray-600/80';

              // Encontrar el balance correspondiente
              const balanceInfo = muscleBalance.find(b => b.category === metric.category);

              // Helper functions para obtener estados y colores
              const getTrendBadge = () => {
                switch (metric.trend) {
                  case 'improving': return { text: 'Mejorando', color: 'bg-green-500 text-white', icon: TrendingUp };
                  case 'declining': return { text: 'Declinando', color: 'bg-red-500 text-white', icon: TrendingDown };
                  default: return { text: 'Estable', color: 'bg-gray-500 text-white', icon: null };
                }
              };

              const getStrengthLevelBadge = () => {
                switch (metric.strengthLevel) {
                  case 'advanced': return { text: 'Avanzado', color: 'bg-purple-500 text-white' };
                  case 'intermediate': return { text: 'Intermedio', color: 'bg-blue-500 text-white' };
                  default: return { text: 'Principiante', color: 'bg-green-500 text-white' };
                }
              };

              const getPriorityBadge = () => {
                if (!balanceInfo) return { text: 'N/A', color: 'bg-gray-500 text-white' };
                switch (balanceInfo.priorityLevel) {
                  case 'critical': return { text: 'Crítico', color: 'bg-red-500 text-white' };
                  case 'high': return { text: 'Alto', color: 'bg-orange-500 text-white' };
                  case 'medium': return { text: 'Medio', color: 'bg-yellow-500 text-black' };
                  default: return { text: 'Bajo', color: 'bg-green-500 text-white' };
                }
              };

              const getDaysColor = (days: number) => {
                if (days <= 3) return 'text-green-400';
                if (days <= 7) return 'text-yellow-400';
                if (days <= 14) return 'text-orange-400';
                return 'text-red-400';
              };

              const trendBadge = getTrendBadge();
              const strengthBadge = getStrengthLevelBadge();
              const priorityBadge = getPriorityBadge();
              const isBalanced = balanceInfo?.isBalanced ?? false;

              return (
                <div
                  key={metric.category}
                  className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br ${isBalanced ? 'from-gray-800 to-gray-900' : 'from-gray-900 to-black'} border ${isBalanced ? 'border-green-500/20' : 'border-red-500/20'} hover:border-opacity-40 transition-all duration-200`}
                >
                  {/* Header con ícono y estados */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                          {metric.category}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendBadge.color}`}>
                            {trendBadge.text}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${strengthBadge.color}`}>
                            {strengthBadge.text}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                            Prioridad: {priorityBadge.text}
                          </span>
                          {trendBadge.icon && (
                            <trendBadge.icon className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2 sm:ml-4">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {safeNumber(metric.percentage, 0).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        del volumen total
                      </div>
                      <div className="mt-1 sm:mt-2 flex justify-end">
                        {isBalanced ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de volumen con referencia ideal */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Volumen: {formatNumber(metric.totalVolume)} kg</span>
                      <span className="text-gray-300">
                        Ideal: {balanceInfo?.idealPercentage?.toFixed(1) || 'N/A'}%
                      </span>
                      <span className="text-gray-300">
                        {metric.workouts} sesiones
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                      {/* Zona ideal si existe */}
                      {balanceInfo && (
                        <>
                          <div
                            className="absolute h-full bg-green-500/20"
                            style={{
                              left: `${Math.max(0, safeNumber(balanceInfo.idealPercentage, 0) - 5)}%`,
                              width: '10%'
                            }}
                          />
                          <div
                            className="absolute h-full w-0.5 bg-green-500"
                            style={{ left: `${safeNumber(balanceInfo.idealPercentage, 0)}%` }}
                          />
                        </>
                      )}
                      {/* Barra de volumen actual */}
                      <div
                        className={`relative h-full bg-gradient-to-r ${colorGradient} transition-all duration-300`}
                        style={{ width: `${Math.min(100, safeNumber(metric.percentage, 0))}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        {/* Valor dentro de la barra si es lo suficientemente ancha */}
                        {safeNumber(metric.percentage, 0) > 15 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {formatNumber(metric.totalVolume)} kg
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Valor fuera de la barra si es muy estrecha */}
                      {safeNumber(metric.percentage, 0) <= 15 && safeNumber(metric.percentage, 0) > 0 && (
                        <div className="absolute top-0 left-2 h-full flex items-center">
                          <span className="text-xs font-medium text-white drop-shadow-sm">
                            {formatNumber(metric.totalVolume)} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid de métricas detalladas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Intensidad</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {safeNumber(metric.intensityScore, 0)}%
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300 relative"
                          style={{ width: `${safeNumber(metric.intensityScore, 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Consistencia</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {safeNumber(metric.consistencyScore, 0)}%
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300 relative"
                          style={{ width: `${safeNumber(metric.consistencyScore, 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Frecuencia</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {safeNumber(metric.avgWorkoutsPerWeek, 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">por semana</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Eficiencia</div>
                      <div className="text-sm sm:text-lg font-semibold text-white">
                        {safeNumber(metric.efficiencyScore, 0)}%
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300 relative"
                          style={{ width: `${safeNumber(metric.efficiencyScore, 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información detallada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {/* Progresión */}
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                        {trendBadge.icon ? (
                          <trendBadge.icon className={`w-3 h-3 ${metric.trend === 'declining' ? 'text-red-400' : 'text-green-400'}`} />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        Progresión
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Peso:</span>
                          <span className={`text-xs font-medium ${metric.weightProgression > 0 ? 'text-green-400' : metric.weightProgression < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {metric.weightProgression > 0 ? '+' : ''}{metric.weightProgression}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Volumen:</span>
                          <span className={`text-xs font-medium ${metric.volumeProgression > 0 ? 'text-green-400' : metric.volumeProgression < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {metric.volumeProgression > 0 ? '+' : ''}{metric.volumeProgression}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">PRs:</span>
                          <span className="text-xs font-medium text-purple-400">
                            {metric.personalRecords}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">1RM Est:</span>
                          <span className="text-xs font-medium text-blue-400">
                            {formatNumber(metric.estimatedOneRM)}kg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Datos temporales */}
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Actividad Reciente
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Último entreno:</span>
                          <span className={`text-xs font-medium ${getDaysColor(metric.daysSinceLastWorkout)}`}>
                            {metric.daysSinceLastWorkout === 0 ? 'Hoy' :
                              metric.daysSinceLastWorkout === 1 ? 'Ayer' :
                                `${metric.daysSinceLastWorkout}d`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Esta semana:</span>
                          <span className="text-xs font-medium text-blue-400">
                            {formatNumber(metric.volumeDistribution.thisWeek)} kg
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Mes pasado:</span>
                          <span className="text-xs font-medium text-gray-300">
                            {formatNumber(metric.volumeDistribution.lastMonth)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recomendaciones y advertencias */}
                  <div className="space-y-2">
                    {/* Advertencias */}
                    {metric.warnings && metric.warnings.length > 0 && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-red-300 break-words">
                              {metric.warnings[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recomendación principal */}
                    {metric.recommendations && metric.recommendations.length > 0 && (
                      <div className={`${metric.warnings && metric.warnings.length === 0 ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gray-800/50 border-gray-700/30'} border rounded-lg p-3`}>
                        <div className="flex items-start gap-2">
                          <Zap className={`w-4 h-4 ${metric.warnings && metric.warnings.length === 0 ? 'text-blue-400' : 'text-gray-400'} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${metric.warnings && metric.warnings.length === 0 ? 'text-blue-300' : 'text-gray-300'} break-words`}>
                              {metric.recommendations[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recomendación de balance si existe */}
                    {balanceInfo && balanceInfo.recommendation && (
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Scale className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-purple-300 break-words">
                              <strong>Balance:</strong> {balanceInfo.recommendation}
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

          {/* Grupos musculares sin entrenar */}
          {muscleBalance.filter(balance => balance.volume === 0 && balance.priorityLevel !== 'critical').length > 0 && (
            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Grupos musculares sin entrenar
              </h4>
              <div className="flex flex-wrap gap-2">
                {muscleBalance
                  .filter(balance => balance.volume === 0 && balance.priorityLevel !== 'critical')
                  .map(balance => {
                    const Icon = categoryIcons[balance.category] || Activity;
                    return (
                      <div
                        key={balance.category}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-gray-700/70 transition-colors"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{balance.category}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 