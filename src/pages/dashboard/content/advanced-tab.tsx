import type { WorkoutRecord } from '@/interfaces';
import { Activity, AlertTriangle, Brain, Shield, Target } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/card';
import { StatCard } from '../../../components/stat-card';
import { InfoTooltip } from '../../../components/tooltip';
import { useAdvancedTab } from '../hooks/use-advanced-tab';

interface AdvancedTabProps {
  records: WorkoutRecord[];
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ records }) => {
  const { analysis, enhancedPerformanceIndicators, categorizedSuggestions } = useAdvancedTab(records);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para análisis avanzado
        </h3>
        <p className="text-gray-500">
          Registra al menos 10 entrenamientos para obtener métricas avanzadas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Índice de Fatiga"
          value={`${Math.round(analysis.fatigueAnalysis.fatigueIndex)}/100`}
          icon={Activity}
          variant={analysis.fatigueAnalysis.fatigueIndex < 30 ? 'success' :
            analysis.fatigueAnalysis.fatigueIndex > 70 ? 'danger' : 'warning'}
          tooltip="Evaluación de tu nivel de fatiga actual. <30 es óptimo, 30-70 moderado, >70 requiere descanso."
        />
        <StatCard
          title="Riesgo Sobreentrenamiento"
          value={analysis.fatigueAnalysis.overreachingRisk}
          icon={Shield}
          variant={analysis.fatigueAnalysis.overreachingRisk === 'Bajo' ? 'success' :
            analysis.fatigueAnalysis.overreachingRisk === 'Alto' ? 'danger' : 'warning'}
          tooltip="Evaluación del riesgo de entrenar más allá de tu capacidad de recuperación."
        />
        <StatCard
          title="Progreso Predicho"
          value={`${Math.round(analysis.progressPrediction.nextWeekWeight)}kg`}
          icon={Target}
          variant={analysis.progressPrediction.trendAnalysis === 'mejorando' ? 'success' :
            analysis.progressPrediction.trendAnalysis === 'empeorando' ? 'danger' : 'warning'}
          tooltip="Peso estimado que podrías manejar la próxima semana basado en tu progresión actual."
        />
        <StatCard
          title="Riesgo Meseta"
          value={`${Math.round(analysis.progressPrediction.plateauRisk)}%`}
          icon={AlertTriangle}
          variant={analysis.progressPrediction.plateauRisk < 30 ? 'success' :
            analysis.progressPrediction.plateauRisk <= 60 ? 'warning' : 'danger'}
          tooltip="Probabilidad de entrar en una meseta de progreso. ≤30% es bajo riesgo, 31-60% moderado, >60% alto riesgo de estancamiento."
        />
      </div>

      {/* Análisis de Fatiga */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Análisis de Fatiga
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-red-500/80 to-orange-500/80">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                      Nivel de Fatiga
                    </h4>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.fatigueAnalysis.fatigueIndex <= 30 ? 'bg-green-500 text-white' :
                        analysis.fatigueAnalysis.fatigueIndex <= 70 ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                        {analysis.fatigueAnalysis.fatigueIndex <= 30 ? 'Baja' :
                          analysis.fatigueAnalysis.fatigueIndex <= 70 ? 'Moderada' : 'Alta'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2 sm:ml-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {Math.round(analysis.fatigueAnalysis.fatigueIndex)}%
                  </div>
                  <div className="text-xs text-gray-400">índice fatiga</div>
                </div>
              </div>

              {/* Barra de progreso de fatiga */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Índice: {Math.round(analysis.fatigueAnalysis.fatigueIndex)}%</span>
                  <span className="text-gray-300">
                    Riesgo: {analysis.fatigueAnalysis.overreachingRisk}
                  </span>
                </div>
                <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="relative h-full bg-gradient-to-r from-red-500/80 to-orange-500/80 transition-all duration-300"
                    style={{ width: `${Math.min(100, analysis.fatigueAnalysis.fatigueIndex)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    {analysis.fatigueAnalysis.fatigueIndex > 15 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white drop-shadow-sm">
                          {Math.round(analysis.fatigueAnalysis.fatigueIndex)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid de métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Días Descanso</div>
                  <div className="text-sm sm:text-lg font-semibold text-white">
                    {analysis.fatigueAnalysis.recoveryDays}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Tasa Recuperación</div>
                  <div className="text-sm sm:text-lg font-semibold text-white">
                    {Math.round(analysis.fatigueAnalysis.recoveryRate)}%
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Score Recuperación</div>
                  <div className="text-sm sm:text-lg font-semibold text-white">
                    {Math.round(analysis.fatigueAnalysis.recoveryScore)}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Tendencia Carga</div>
                  <div className="text-sm sm:text-lg font-semibold text-white">
                    {analysis.fatigueAnalysis.workloadTrend}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores de Rendimiento */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Indicadores de Rendimiento
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {enhancedPerformanceIndicators.length > 0 ? (
              enhancedPerformanceIndicators.map((indicator, index) => {
                const getIndicatorStyles = (type: string) => {
                  switch (type) {
                    case 'excellent':
                      return 'bg-green-900/20 border-green-500/30 text-green-400';
                    case 'good':
                      return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
                    case 'warning':
                      return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
                    case 'critical':
                      return 'bg-red-900/20 border-red-500/30 text-red-400';
                    default:
                      return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
                  }
                };

                return (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 border rounded-lg ${getIndicatorStyles(indicator.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{indicator.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{indicator.title}</h4>
                          {indicator.value && (
                            <span className="text-sm font-bold">{indicator.value}</span>
                          )}
                        </div>
                        <p className="text-xs opacity-90 mb-2">{indicator.description}</p>
                        {indicator.progress !== undefined && (
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${indicator.type === 'excellent' ? 'bg-green-500' :
                                indicator.type === 'good' ? 'bg-blue-500' :
                                  indicator.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${Math.min(100, indicator.progress)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-4">
                Continúa entrenando para desarrollar indicadores de rendimiento
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias de Optimización */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Sugerencias de Optimización
            <InfoTooltip
              content="Recomendaciones personalizadas y priorizadas basadas en análisis detallado de tus datos de entrenamiento."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categorizedSuggestions.length > 0 ? (
              categorizedSuggestions.map((suggestion, index) => {
                const getCategoryStyles = (category: string) => {
                  switch (category) {
                    case 'intensity':
                      return 'bg-red-900/20 border-red-500/30 text-red-400';
                    case 'recovery':
                      return 'bg-green-900/20 border-green-500/30 text-green-400';
                    case 'frequency':
                      return 'bg-purple-900/20 border-purple-500/30 text-purple-400';
                    case 'planning':
                      return 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400';
                    case 'progress':
                      return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
                    case 'technique':
                      return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
                    case 'balance':
                      return 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400';
                    default:
                      return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
                  }
                };

                const getPriorityBadge = (priority: string) => {
                  switch (priority) {
                    case 'high':
                      return 'bg-red-600 text-white';
                    case 'medium':
                      return 'bg-yellow-600 text-white';
                    case 'low':
                      return 'bg-gray-600 text-white';
                    default:
                      return 'bg-gray-600 text-white';
                  }
                };

                return (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 border rounded-lg ${getCategoryStyles(suggestion.category)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <suggestion.icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h4 className="font-medium text-sm mb-1 sm:mb-0">{suggestion.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityBadge(suggestion.priority)} w-fit`}>
                            {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                        <p className="text-xs opacity-90 mb-2">{suggestion.description}</p>
                        <p className="text-xs font-medium opacity-80">{suggestion.action}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-4">
                Tu entrenamiento está bien optimizado - mantén la consistencia
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};