import { Activity, AlertTriangle, CheckCircle, Scale, XCircle, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { analyzeMuscleBalance, calculateBalanceScore } from '../../../utils/functions/category-analysis';
import { Card } from '../../card';
import { CardContent } from '../../card/components/card-content';
import { CardHeader } from '../../card/components/card-header';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface BalanceTabProps {
  records: WorkoutRecord[];
}

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const { muscleBalance, balanceScore } = useMemo(() => {
    const balance = analyzeMuscleBalance(records);
    const score = calculateBalanceScore(balance);
    return { muscleBalance: balance, balanceScore: score };
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
      {/* Métricas principales de balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Score de Balance"
          value={`${balanceScore}%`}
          icon={Activity}
          variant={balanceScore >= 80 ? 'success' : balanceScore >= 60 ? 'warning' : 'danger'}
          tooltip="Puntuación que indica qué tan equilibrado está tu entrenamiento entre diferentes grupos musculares. 80%+ es excelente, 60-79% es bueno, <60% necesita mejoras."
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
          title="Grupos Desbalanceados"
          value={muscleBalance.filter(b => !b.isBalanced).length.toString()}
          icon={XCircle}
          variant={muscleBalance.filter(b => !b.isBalanced).length > 2 ? 'danger' : 'warning'}
          tooltip="Número de grupos musculares que necesitan ajuste en su volumen de entrenamiento."
          tooltipPosition="top"
        />
        <StatCard
          title="Prioridad Alta"
          value={muscleBalance.filter(b => b.priorityLevel === 'high' || b.priorityLevel === 'critical').length.toString()}
          icon={AlertTriangle}
          variant={muscleBalance.filter(b => b.priorityLevel === 'critical').length > 0 ? 'danger' : 'warning'}
          tooltip="Número de grupos musculares que requieren atención inmediata."
          tooltipPosition="top"
        />
      </div>

      {/* Balance muscular detallado */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Análisis de Balance Muscular
            <InfoTooltip
              content="Análisis comprehensivo de equilibrio muscular incluyendo simetría, ratios antagonistas, tendencias de progreso y recomendaciones específicas."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {muscleBalance.map((balance) => {
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
                  className={`p-4 rounded-lg border transition-all ${balance.isBalanced
                    ? 'bg-green-900/20 border-green-500/30 hover:border-green-500/50'
                    : 'bg-red-900/20 border-red-500/30 hover:border-red-500/50'
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
                        {balance.priorityLevel === 'critical' ? 'Crítico' :
                          balance.priorityLevel === 'high' ? 'Alto' :
                            balance.priorityLevel === 'medium' ? 'Medio' : 'Bajo'}
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
                        {balance.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Métricas clave */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">Simetría</p>
                      <p className="text-sm font-medium text-white">
                        {balance.symmetryScore}/100
                      </p>
                    </div>
                    <div className="text-center bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">Fuerza</p>
                      <p className="text-sm font-medium text-white">
                        {balance.strengthIndex}/100
                      </p>
                    </div>
                    <div className="text-center bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">Frecuencia</p>
                      <p className="text-sm font-medium text-white">
                        {balance.weeklyFrequency.toFixed(1)}/sem
                      </p>
                    </div>
                    <div className="text-center bg-gray-900/30 rounded p-2">
                      <p className="text-xs text-gray-400">Intensidad</p>
                      <p className="text-sm font-medium text-white">
                        {balance.intensityScore}%
                      </p>
                    </div>
                  </div>

                  {/* Desviación del ideal con barra visual mejorada */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Ideal: {balance.idealPercentage}%</span>
                      <span className="text-gray-300">Actual: {balance.percentage.toFixed(1)}%</span>
                      <span className={balance.isBalanced ? 'text-green-400' : 'text-red-400'}>
                        Desviación: {balance.deviation > 0 ? '+' : ''}{balance.deviation.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        {/* Zona ideal */}
                        <div
                          className="absolute bg-green-900/30 h-3 rounded-full"
                          style={{
                            left: `${Math.max(0, balance.idealPercentage - 5)}%`,
                            width: '10%'
                          }}
                        />
                        {/* Barra actual */}
                        <div
                          className={`relative h-3 rounded-full transition-all ${balance.isBalanced ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, balance.percentage))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consistencia del balance */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Consistencia histórica</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
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
                  <div className="bg-gray-900/30 rounded-lg p-2 mb-2">
                    <p className="text-xs text-gray-400 mb-1">Recomendación principal</p>
                    <p className="text-sm text-white">
                      {balance.recommendation}
                    </p>
                  </div>

                  {/* Acciones específicas o advertencias */}
                  {(balance.specificRecommendations.length > 0 || balance.warnings.length > 0) && (
                    <div className="space-y-2">
                      {balance.warnings.length > 0 && (
                        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-red-400 mb-1">Advertencia</p>
                              <p className="text-xs text-red-300/90">{balance.warnings[0]}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {balance.specificRecommendations.length > 0 && balance.warnings.length === 0 && (
                        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
                          <div className="flex items-start gap-2">
                            <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-400 mb-1">Acción recomendada</p>
                              <p className="text-xs text-blue-300/90">{balance.specificRecommendations[0]}</p>
                            </div>
                          </div>
                        </div>
                      )}
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
}; 