import {
  Activity,
  AlertTriangle,
  BarChart,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { calculateTrendsAnalysis } from '../../../utils/functions/trends-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface TrendsTabProps {
  records: WorkoutRecord[];
}

// Íconos para días de la semana
const dayIcons: Record<string, React.FC<any>> = {
  'Lunes': Target,
  'Martes': Activity,
  'Miércoles': Zap,
  'Jueves': BarChart,
  'Viernes': Trophy,
  'Sábado': Calendar,
  'Domingo': Clock
};

// Colores para días de la semana
const dayColors: Record<string, string> = {
  'Lunes': 'from-blue-500/80 to-cyan-500/80',
  'Martes': 'from-green-500/80 to-emerald-500/80',
  'Miércoles': 'from-purple-500/80 to-violet-500/80',
  'Jueves': 'from-orange-500/80 to-amber-500/80',
  'Viernes': 'from-red-500/80 to-pink-500/80',
  'Sábado': 'from-indigo-500/80 to-blue-500/80',
  'Domingo': 'from-teal-500/80 to-green-500/80'
};

// Función utilitaria para validar valores numéricos
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

export const TrendsTab: React.FC<TrendsTabProps> = ({ records }) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'dayAnalysis' | 'patterns'>('general');
  const analysis = useMemo(() => calculateTrendsAnalysis(records), [records]);

  // Calcular indicador de experiencia basado en registros
  const experienceLevel = useMemo(() => {
    if (records.length < 10) return 'Principiante';
    if (records.length < 30) return 'Intermedio';
    if (records.length < 60) return 'Avanzado';
    return 'Experto';
  }, [records.length]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos de tendencias
        </h3>
        <p className="text-gray-500">
          Registra algunos entrenamientos para ver tus patrones temporales
        </p>
      </div>
    );
  }

  const subTabs = [
    {
      id: 'general' as const,
      name: 'General',
      icon: BarChart,
      description: 'Análisis general de tendencias y evolución'
    },
    {
      id: 'dayAnalysis' as const,
      name: 'Análisis por Día',
      icon: Calendar,
      description: 'Patrones detallados por día de la semana'
    },
    {
      id: 'patterns' as const,
      name: 'Patrones',
      icon: Activity,
      description: 'Análisis de patrones y hábitos de entrenamiento'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navegación de SubTabs */}
      <div className="flex bg-gray-800 rounded-lg p-1 overflow-hidden">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 lg:py-3 rounded-md text-xs lg:text-sm font-medium transition-all duration-200 min-w-0
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="hidden md:block truncate">{tab.name}</span>
              <span className="md:hidden truncate">{tab.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de SubTabs */}
      {activeSubTab === 'general' && (
        <GeneralTrendsContent
          analysis={analysis}
          experienceLevel={experienceLevel}
          records={records}
        />
      )}

      {activeSubTab === 'dayAnalysis' && (
        <DayAnalysisContent
          analysis={analysis}
          dayIcons={dayIcons}
          dayColors={dayColors}
        />
      )}

      {activeSubTab === 'patterns' && (
        <PatternsContent
          analysis={analysis}
          records={records}
        />
      )}
    </div>
  );
};

// Componente para el contenido general de tendencias
interface GeneralTrendsContentProps {
  analysis: any;
  experienceLevel: string;
  records: WorkoutRecord[];
}

const GeneralTrendsContent: React.FC<GeneralTrendsContentProps> = ({
  analysis,
  experienceLevel,
  records
}) => (
  <div className="space-y-6">
    {/* Header informativo */}
    {records.length < 20 && (
      <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardContent>
          <div className="flex items-start gap-3 p-2">
            <Activity className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-purple-300 mb-1">
                Análisis adaptado a tu nivel ({experienceLevel})
              </h4>
              <p className="text-xs text-gray-400">
                Las tendencias se analizan según tu historial de entrenamiento.
                Con más datos, el análisis será más preciso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Evolución Temporal - StatCards horizontales */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tendencia"
        value={analysis.temporalEvolution.overallTrend}
        icon={analysis.temporalEvolution.overallTrend === 'Mejorando' ? TrendingUp :
          analysis.temporalEvolution.overallTrend === 'Declinando' ? TrendingDown : Activity}
        variant={analysis.temporalEvolution.overallTrend === 'Mejorando' ? 'success' :
          analysis.temporalEvolution.overallTrend === 'Declinando' ? 'danger' : 'warning'}
        tooltip="Evaluación de la dirección general de tu progreso basado en patrones temporales y volumen de entrenamiento."
        tooltipPosition="top"
      />

      <StatCard
        title="Crecimiento"
        value={`${analysis.temporalEvolution.growthRate > 0 ? '+' : ''}${analysis.temporalEvolution.growthRate}%`}
        icon={Target}
        variant={analysis.temporalEvolution.growthRate > 0 ? 'success' :
          analysis.temporalEvolution.growthRate < 0 ? 'danger' : 'warning'}
        tooltip="Porcentaje de crecimiento en tu rendimiento durante el período analizado. Valores positivos indican progreso."
        tooltipPosition="top"
      />

      <StatCard
        title="Volatilidad"
        value={`${analysis.temporalEvolution.volatility}%`}
        icon={Activity}
        variant={analysis.temporalEvolution.volatility < 20 ? 'success' :
          analysis.temporalEvolution.volatility < 40 ? 'warning' : 'danger'}
        tooltip="Medida de la variabilidad en tu rendimiento. Valores bajos (<20%) indican consistencia, valores altos (>40%) sugieren fluctuaciones importantes."
        tooltipPosition="top"
      />

      <StatCard
        title="Confianza"
        value={`${Math.round(analysis.temporalEvolution.predictions.confidence * 100)}%`}
        icon={Brain}
        variant={analysis.temporalEvolution.predictions.confidence >= 0.7 ? 'success' :
          analysis.temporalEvolution.predictions.confidence >= 0.5 ? 'warning' : 'danger'}
        tooltip="Nivel de confianza en las predicciones basado en la calidad y cantidad de datos. Valores altos (>70%) indican predicciones más fiables."
        tooltipPosition="top"
      />
    </div>

    {/* Análisis General de Tendencias */}
    <Card className="p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <CardHeader className="pb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mr-4">
            <TrendingUp className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
          </div>
          <span className="truncate">Análisis General de Tendencias</span>
          <InfoTooltip
            content="Análisis general de las tendencias de tu entrenamiento y patrones de progreso"
            position="top"
            className="ml-3 flex-shrink-0"
          />
        </h3>
      </CardHeader>
      <CardContent>
        {/* Métricas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tendencia General */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white">Tendencia General</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Estado:</span>
                <span className={`font-semibold ${analysis.temporalEvolution.overallTrend === 'Mejorando' ? 'text-green-400' :
                  analysis.temporalEvolution.overallTrend === 'Declinando' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                  {analysis.temporalEvolution.overallTrend}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Crecimiento:</span>
                <span className={`font-semibold ${analysis.temporalEvolution.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {analysis.temporalEvolution.growthRate > 0 ? '+' : ''}{analysis.temporalEvolution.growthRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Consistencia:</span>
                <span className={`font-semibold ${analysis.temporalEvolution.volatility < 20 ? 'text-green-400' :
                  analysis.temporalEvolution.volatility < 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                  {analysis.temporalEvolution.volatility < 20 ? 'Excelente' :
                    analysis.temporalEvolution.volatility < 40 ? 'Buena' : 'Necesita Mejora'}
                </span>
              </div>
            </div>
          </div>

          {/* Predicciones */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-white">Predicciones</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Confianza:</span>
                <span className={`font-semibold ${analysis.temporalEvolution.predictions.confidence >= 0.7 ? 'text-green-400' :
                  analysis.temporalEvolution.predictions.confidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                  {Math.round(analysis.temporalEvolution.predictions.confidence * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Próxima semana:</span>
                <span className="font-semibold text-blue-400">
                  {analysis.temporalEvolution?.predictions?.nextWeekVolume ?
                    `${formatNumber(analysis.temporalEvolution.predictions.nextWeekVolume)} kg` :
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tendencia:</span>
                <span className={`font-semibold ${analysis.temporalEvolution?.predictions?.trend === 'Alcista' ? 'text-green-400' :
                  analysis.temporalEvolution?.predictions?.trend === 'Bajista' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                  {analysis.temporalEvolution?.predictions?.trend === 'Alcista' ? 'Positiva' :
                    analysis.temporalEvolution?.predictions?.trend === 'Bajista' ? 'Negativa' : 'Estable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights y Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          {analysis.temporalEvolution?.insights && analysis.temporalEvolution.insights.length > 0 && (
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-300 mb-2">Insights Positivos</h4>
                  <div className="space-y-2">
                    {analysis.temporalEvolution.insights.map((insight: string, index: number) => (
                      <p key={index} className="text-sm text-green-200">
                        • {insight}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {analysis.temporalEvolution?.warnings && analysis.temporalEvolution.warnings.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-yellow-300 mb-2">Atención</h4>
                  <div className="space-y-2">
                    {analysis.temporalEvolution.warnings.map((warning: string, index: number) => (
                      <p key={index} className="text-sm text-yellow-200">
                        • {warning}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Componente para el análisis por día
interface DayAnalysisContentProps {
  analysis: any;
  dayIcons: Record<string, React.FC<any>>;
  dayColors: Record<string, string>;
}

const DayAnalysisContent: React.FC<DayAnalysisContentProps> = ({
  analysis,
  dayIcons,
  dayColors
}) => (
  <div className="space-y-6">
    {/* Análisis por Día de la Semana */}
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Análisis por Día de la Semana
          <InfoTooltip
            content="Análisis completo de tus patrones de entrenamiento por día, incluyendo rendimiento, tendencias y recomendaciones personalizadas."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analysis.dayMetricsOrdered.map((day: any) => {
            const Icon = dayIcons[day.dayName] || Calendar;
            const colorGradient = dayColors[day.dayName] || 'from-gray-500/80 to-gray-600/80';

            const getPerformanceBadge = () => {
              if (day.performanceScore >= 80) return { text: 'Excelente', color: 'bg-green-500 text-white' };
              if (day.performanceScore >= 60) return { text: 'Bueno', color: 'bg-blue-500 text-white' };
              if (day.performanceScore >= 40) return { text: 'Regular', color: 'bg-yellow-500 text-black' };
              return { text: 'Necesita Mejora', color: 'bg-red-500 text-white' };
            };

            const performanceBadge = getPerformanceBadge();

            return (
              <div
                key={day.dayName}
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
                        {day.dayName}
                      </h4>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        {day.workouts > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${performanceBadge.color}`}>
                            {performanceBadge.text}
                          </span>
                        )}
                        {day.trend > 0 && (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        )}
                        {day.trend < 0 && (
                          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {day.workouts} entreno{day.workouts !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">
                      {day.percentage.toFixed(1)}% del total
                    </span>
                  </div>
                </div>

                {/* Contenido detallado */}
                {day.workouts > 0 ? (
                  <>
                    {/* Barra de progreso de volumen */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Volumen: {formatNumber(day.totalVolume)} kg</span>
                        <span className="text-gray-300">
                          {day.percentage.toFixed(1)}% del total
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`relative h-full bg-gradient-to-r ${colorGradient} transition-all duration-300`}
                          style={{ width: `${Math.min(100, safeNumber(day.percentage, 0))}%` }}
                        >
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                          {safeNumber(day.percentage, 0) > 15 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-white drop-shadow-sm">
                                {formatNumber(day.totalVolume)} kg
                              </span>
                            </div>
                          )}
                        </div>
                        {safeNumber(day.percentage, 0) <= 15 && safeNumber(day.percentage, 0) > 0 && (
                          <div className="absolute top-0 left-2 h-full flex items-center">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {formatNumber(day.totalVolume)} kg
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grid de métricas responsivo */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Peso Máximo</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {formatNumber(day.maxWeight)} kg
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Ejercicios</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {formatNumber(day.uniqueExercises)}
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Consistencia</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {day.consistency}%
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Peso Promedio</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {formatNumber(day.avgWeight)} kg
                        </div>
                      </div>
                    </div>

                    {/* Recomendaciones específicas */}
                    {day.recommendations.length > 0 && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-300 break-words">
                              {day.recommendations[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-yellow-300 break-words">
                            Sin entrenamientos registrados. Considera añadir entrenamientos en este día para equilibrar tu rutina semanal.
                          </p>
                        </div>
                      </div>
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
);

// Componente para el análisis de patrones
interface PatternsContentProps {
  analysis: any;
  records: WorkoutRecord[];
}

const PatternsContent: React.FC<PatternsContentProps> = ({
  analysis,
  records
}) => {
  // Calcular patrones adicionales
  const patterns = useMemo(() => {
    const totalWorkouts = records.length;
    const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const avgVolumePerWorkout = totalVolume / totalWorkouts;

    // Patrones de frecuencia
    const workoutDates = records.map(r => new Date(r.date).toDateString());
    const uniqueDays = new Set(workoutDates).size;
    const avgWorkoutsPerDay = totalWorkouts / uniqueDays;

    // Patrones de intensidad
    const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / totalWorkouts;
    const maxWeight = Math.max(...records.map(r => r.weight));

    return {
      totalWorkouts,
      totalVolume,
      avgVolumePerWorkout,
      uniqueDays,
      avgWorkoutsPerDay,
      avgWeight,
      maxWeight
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Patrones de Frecuencia */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Patrones de Frecuencia
            <InfoTooltip
              content="Análisis de la frecuencia y consistencia de tus entrenamientos"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {patterns.totalWorkouts}
              </div>
              <div className="text-sm text-gray-400">Total Entrenamientos</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {patterns.uniqueDays}
              </div>
              <div className="text-sm text-gray-400">Días Únicos</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {formatNumber(patterns.avgWorkoutsPerDay, 1)}
              </div>
              <div className="text-sm text-gray-400">Promedio por Día</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {formatNumber(patterns.avgVolumePerWorkout, 0)}
              </div>
              <div className="text-sm text-gray-400">Volumen Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patrones de Intensidad */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Patrones de Intensidad
            <InfoTooltip
              content="Análisis de la intensidad y progresión de peso en tus entrenamientos"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Peso Máximo</h4>
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2">
                {formatNumber(patterns.maxWeight)} kg
              </div>
              <p className="text-sm text-gray-400">
                El peso más alto que has levantado en cualquier ejercicio
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <BarChart className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Peso Promedio</h4>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatNumber(patterns.avgWeight)} kg
              </div>
              <p className="text-sm text-gray-400">
                Peso promedio por entrenamiento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis de Consistencia */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Análisis de Consistencia
            <InfoTooltip
              content="Evaluación de la consistencia en tu rutina de entrenamiento"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.dayMetricsOrdered
              .filter((day: any) => day.workouts > 0)
              .map((day: any) => {
                const Icon = dayIcons[day.dayName] || Calendar;
                const colorGradient = dayColors[day.dayName] || 'from-gray-500/80 to-gray-600/80';

                return (
                  <div key={day.dayName} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{day.dayName}</div>
                        <div className="text-sm text-gray-400">
                          {day.workouts} entrenamientos • {day.consistency}% consistencia
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {formatNumber(day.totalVolume)} kg
                      </div>
                      <div className="text-sm text-gray-400">
                        {day.percentage.toFixed(1)}% del total
                      </div>
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