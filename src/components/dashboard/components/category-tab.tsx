import {
  AlertCircle,
  BarChart,
  Dumbbell,
  Footprints,
  Hexagon,
  RotateCcw,
  Shield,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Triangle,
  Trophy,
  Zap
} from 'lucide-react';
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
      {/* Métricas principales con diseño responsivo mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Categorías"
          value={analysis.categoryMetrics.length.toString()}
          icon={Target}
          variant="primary"
          tooltip="Número total de categorías musculares diferentes que has entrenado."
          tooltipPosition="top"
        />
        <StatCard
          title="Categoría Principal"
          value={analysis.dominantCategory || 'N/A'}
          icon={BarChart}
          variant="indigo"
          tooltip="El grupo muscular al que dedicas más tiempo y volumen de entrenamiento."
          tooltipPosition="top"
        />
        <StatCard
          title="Menos Entrenada"
          value={analysis.leastTrainedCategory || 'N/A'}
          icon={AlertCircle}
          variant="warning"
          tooltip="El grupo muscular que menos entrenas. Considera aumentar el volumen."
          tooltipPosition="top"
        />
        <StatCard
          title="Volumen Total"
          value={formatNumber(analysis.categoryMetrics.reduce((sum, m) => sum + m.totalVolume, 0))}
          icon={Dumbbell}
          variant="success"
          tooltip="Volumen total de entrenamiento sumando todas las categorías."
          tooltipPosition="top"
        />
      </div>

      {/* Análisis visual por categoría */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Análisis Detallado por Categoría
            <InfoTooltip
              content="Métricas completas por grupo muscular incluyendo progresión, eficiencia, consistencia y rendimiento."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.categoryMetrics.map((metric) => {
              const Icon = categoryIcons[metric.category] || Target;
              const colorGradient = categoryColors[metric.category] || 'from-gray-500/80 to-gray-600/80';

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

              const getDaysColor = (days: number) => {
                if (days <= 3) return 'text-green-400';
                if (days <= 7) return 'text-yellow-400';
                if (days <= 14) return 'text-orange-400';
                return 'text-red-400';
              };

              const trendBadge = getTrendBadge();
              const strengthBadge = getStrengthLevelBadge();

              return (
                <div
                  key={metric.category}
                  className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200`}
                >
                  {/* Header con ícono y estado */}
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
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de volumen */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Volumen: {formatNumber(metric.totalVolume)} kg</span>
                      <span className="text-gray-300">
                        {metric.workouts} sesiones
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                      {/* Barra de volumen */}
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

                  {/* Grid de métricas responsivo */}
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

                  {/* Advertencias y recomendaciones */}
                  <div className="space-y-2">
                    {/* Advertencias */}
                    {metric.warnings && metric.warnings.length > 0 && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
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