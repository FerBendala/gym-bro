import {
  AlertCircle,
  Award,
  BarChart,
  Calendar,
  Dumbbell,
  Minus,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Weight,
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

      {/* Métricas por categoría avanzadas */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.categoryMetrics.map((metric) => {
              // Helper functions para colores y iconos
              const getTrendIcon = (trend: string) => {
                switch (trend) {
                  case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
                  case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
                  default: return <Minus className="w-4 h-4 text-gray-400" />;
                }
              };

              const getProgressionColor = (value: number) => {
                if (value > 5) return 'text-green-400';
                if (value < -5) return 'text-red-400';
                return 'text-gray-400';
              };

              const getScoreColor = (score: number) => {
                if (score >= 80) return 'text-green-400';
                if (score >= 60) return 'text-yellow-400';
                if (score >= 40) return 'text-orange-400';
                return 'text-red-400';
              };

              const getDaysColor = (days: number) => {
                if (days <= 3) return 'text-green-400';
                if (days <= 7) return 'text-yellow-400';
                if (days <= 14) return 'text-orange-400';
                return 'text-red-400';
              };

              return (
                <div
                  key={metric.category}
                  className="p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all"
                >
                  {/* Header compacto y mejorado */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-base">
                        {metric.category}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <InfoTooltip
                          content={`Tendencia: ${metric.trend === 'improving' ? 'Mejorando' : metric.trend === 'declining' ? 'Declinando' : 'Estable'}`}
                          position="top"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-400">
                        {formatNumber(metric.totalVolume)} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        {metric.percentage.toFixed(1)}% del total
                      </p>
                    </div>
                  </div>

                  {/* Métricas principales en diseño compacto */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Dumbbell className="w-3 h-3 text-gray-400" />
                        <InfoTooltip
                          content="Número total de sesiones de entrenamiento"
                          position="top"
                          className="text-xs"
                        />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {metric.workouts}
                      </p>
                      <p className="text-xs text-gray-500">sesiones</p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <InfoTooltip
                          content="Frecuencia promedio de entrenamiento por semana"
                          position="top"
                          className="text-xs"
                        />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {metric.avgWorkoutsPerWeek.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/semana</p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-3 h-3 text-gray-400" />
                        <InfoTooltip
                          content="Récords personales alcanzados"
                          position="top"
                          className="text-xs"
                        />
                      </div>
                      <p className="text-sm font-semibold text-purple-400">
                        {metric.personalRecords}
                      </p>
                      <p className="text-xs text-gray-500">PRs</p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Weight className="w-3 h-3 text-gray-400" />
                        <InfoTooltip
                          content="Estimación de tu repetición máxima (1RM)"
                          position="top"
                          className="text-xs"
                        />
                      </div>
                      <p className="text-sm font-semibold text-orange-400">
                        {metric.estimatedOneRM}
                      </p>
                      <p className="text-xs text-gray-500">kg 1RM</p>
                    </div>
                  </div>

                  {/* Barra de rango de pesos mejorada */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        Rango de peso
                        <InfoTooltip
                          content="Muestra el peso mínimo, promedio y máximo utilizado"
                          position="top"
                          className="text-xs"
                        />
                      </span>
                      <span className="text-xs text-gray-300">
                        {metric.minWeight} - {metric.avgWeight.toFixed(0)} - {metric.maxWeight} kg
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="absolute bg-blue-500/30 h-2 rounded-full"
                        style={{
                          left: `${(metric.minWeight / metric.maxWeight) * 100}%`,
                          width: `${((metric.avgWeight - metric.minWeight) / metric.maxWeight) * 100}%`
                        }}
                      />
                      <div
                        className="absolute bg-blue-500 h-2 w-2 rounded-full -mt-0"
                        style={{
                          left: `${(metric.avgWeight / metric.maxWeight) * 100}%`,
                          marginLeft: '-4px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Indicadores de rendimiento visuales */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-900/30 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          Intensidad
                          <InfoTooltip
                            content="Porcentaje del peso promedio vs peso máximo"
                            position="top"
                            className="text-xs"
                          />
                        </span>
                        <span className={`text-xs font-medium ${getScoreColor(metric.intensityScore)}`}>
                          {metric.intensityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${metric.intensityScore >= 80 ? 'bg-green-500' :
                            metric.intensityScore >= 60 ? 'bg-yellow-500' :
                              metric.intensityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${metric.intensityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-900/30 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          Consistencia
                          <InfoTooltip
                            content="Regularidad en la frecuencia de entrenamiento"
                            position="top"
                            className="text-xs"
                          />
                        </span>
                        <span className={`text-xs font-medium ${getScoreColor(metric.consistencyScore)}`}>
                          {metric.consistencyScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${metric.consistencyScore >= 80 ? 'bg-green-500' :
                            metric.consistencyScore >= 60 ? 'bg-yellow-500' :
                              metric.consistencyScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${metric.consistencyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progresión y último entrenamiento */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-900/30 rounded-lg p-2">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Progresión
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Peso:</span>
                        <span className={`text-xs font-medium ${getProgressionColor(metric.weightProgression)}`}>
                          {metric.weightProgression > 0 ? '+' : ''}{metric.weightProgression}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Volumen:</span>
                        <span className={`text-xs font-medium ${getProgressionColor(metric.volumeProgression)}`}>
                          {metric.volumeProgression > 0 ? '+' : ''}{metric.volumeProgression}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-900/30 rounded-lg p-2">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Último entreno
                      </p>
                      <p className={`text-sm font-medium ${getDaysColor(metric.daysSinceLastWorkout)}`}>
                        {metric.daysSinceLastWorkout === 0 ? 'Hoy' :
                          metric.daysSinceLastWorkout === 1 ? 'Ayer' :
                            `Hace ${metric.daysSinceLastWorkout} días`}
                      </p>
                    </div>
                  </div>

                  {/* Distribución temporal compacta */}
                  <div className="bg-gray-900/30 rounded-lg p-2 mb-3">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <BarChart className="w-3 h-3" />
                      Distribución de volumen
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Esta semana</span>
                          <span className="text-xs font-medium text-blue-400">
                            {formatNumber(metric.volumeDistribution.thisWeek)}kg
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Semana pasada</span>
                          <span className="text-xs font-medium text-gray-300">
                            {formatNumber(metric.volumeDistribution.lastWeek)}kg
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Este mes</span>
                          <span className="text-xs font-medium text-blue-400">
                            {formatNumber(metric.volumeDistribution.thisMonth)}kg
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Mes pasado</span>
                          <span className="text-xs font-medium text-gray-300">
                            {formatNumber(metric.volumeDistribution.lastMonth)}kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alerta visual para advertencias o recomendaciones */}
                  {(metric.warnings.length > 0 || metric.recommendations.length > 0) && (
                    <div className="space-y-2">
                      {metric.warnings.length > 0 && (
                        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-red-400 mb-1">Atención</p>
                              <p className="text-xs text-red-300/90">{metric.warnings[0]}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {metric.recommendations.length > 0 && metric.warnings.length === 0 && (
                        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
                          <div className="flex items-start gap-2">
                            <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-400 mb-1">Recomendación</p>
                              <p className="text-xs text-blue-300/90">{metric.recommendations[0]}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {analysis.categoryMetrics.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                No hay categorías registradas
              </p>
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  );
};