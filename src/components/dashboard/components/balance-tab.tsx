import { Activity, AlertTriangle, Award, BarChart, CheckCircle, Heart, Info, Scale, Target, TrendingDown, TrendingUp, Weight, XCircle, Zap } from 'lucide-react';
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

// Íconos para cada categoría muscular
const categoryIcons: Record<string, React.FC<any>> = {
  'Pecho': Heart,
  'Espalda': Activity,
  'Piernas': Weight,
  'Hombros': Target,
  'Brazos': Zap,
  'Core': Scale,
  'Cardio': Activity
};

// Colores para cada categoría
const categoryColors: Record<string, string> = {
  'Pecho': 'from-red-500/80 to-pink-500/80',
  'Espalda': 'from-blue-500/80 to-cyan-500/80',
  'Piernas': 'from-green-500/80 to-emerald-500/80',
  'Hombros': 'from-purple-500/80 to-violet-500/80',
  'Brazos': 'from-orange-500/80 to-amber-500/80',
  'Core': 'from-indigo-500/80 to-blue-500/80',
  'Cardio': 'from-teal-500/80 to-green-500/80'
};

// Función utilitaria para validar valores numéricos
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const { muscleBalance, balanceScore } = useMemo(() => {
    const balance = analyzeMuscleBalance(records);
    const score = calculateBalanceScore(balance);
    return { muscleBalance: balance, balanceScore: score };
  }, [records]);

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
      {/* Header informativo */}
      {records.length < 20 && (
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent>
            <div className="flex items-start gap-3 p-2">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">
                  Análisis adaptado a tu nivel ({experienceLevel})
                </h4>
                <p className="text-xs text-gray-400">
                  Las métricas se ajustan automáticamente según tu historial de entrenamiento.
                  Con más datos, el análisis será más preciso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales con diseño mejorado */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <StatCard
            title="Score de Balance"
            value={`${safeNumber(balanceScore)}%`}
            icon={Activity}
            variant={balanceScore >= 80 ? 'success' : balanceScore >= 60 ? 'warning' : 'danger'}
            tooltip="Puntuación que indica qué tan equilibrado está tu entrenamiento entre diferentes grupos musculares."
            tooltipPosition="top"
          />
          <div className="absolute -top-2 -right-2 z-10">
            {balanceScore >= 80 && <Award className="w-6 h-6 text-yellow-400" />}
          </div>
        </div>

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
          value={muscleBalance.filter(b => !b.isBalanced && b.volume > 0).length.toString()}
          icon={XCircle}
          variant={muscleBalance.filter(b => !b.isBalanced && b.volume > 0).length > 2 ? 'danger' : 'warning'}
          tooltip="Número de grupos musculares que necesitan ajuste en su volumen de entrenamiento."
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
          title="Requiere Atención"
          value={muscleBalance.filter(b => b.priorityLevel === 'high' || b.priorityLevel === 'medium').length.toString()}
          icon={AlertTriangle}
          variant="warning"
          tooltip="Grupos musculares que requieren ajustes en balance, frecuencia o progreso."
          tooltipPosition="top"
        />
      </div>

      {/* Análisis visual de balance muscular */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Análisis Visual de Balance Muscular
            <InfoTooltip
              content="Vista general del equilibrio entre grupos musculares con métricas clave y recomendaciones personalizadas."
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
                const Icon = categoryIcons[balance.category] || Activity;
                const colorGradient = categoryColors[balance.category] || 'from-gray-500/80 to-gray-600/80';

                const getPriorityBadge = () => {
                  switch (balance.priorityLevel) {
                    case 'critical': return { text: 'Crítico', color: 'bg-red-500 text-white' };
                    case 'high': return { text: 'Alto', color: 'bg-orange-500 text-white' };
                    case 'medium': return { text: 'Medio', color: 'bg-yellow-500 text-black' };
                    default: return { text: 'Bajo', color: 'bg-green-500 text-white' };
                  }
                };

                const priorityBadge = getPriorityBadge();

                return (
                  <div
                    key={balance.category}
                    className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br ${balance.isBalanced ? 'from-gray-800 to-gray-900' : 'from-gray-900 to-black'
                      } border ${balance.isBalanced ? 'border-green-500/20' : 'border-red-500/20'
                      } hover:border-opacity-40 transition-all duration-200`}
                  >
                    {/* Header con ícono y estado */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-white truncate">
                            {balance.category}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                              {priorityBadge.text}
                            </span>
                            {balance.progressTrend === 'improving' && (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                            {balance.progressTrend === 'declining' && (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl sm:text-2xl font-bold text-white">
                          {safeNumber(balance.percentage, 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">
                          del volumen total
                        </div>
                        {/* Icono de estado movido aquí para evitar solapamiento */}
                        <div className="mt-2 flex justify-end">
                          {balance.isBalanced ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso visual mejorada */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>0%</span>
                        <span className="text-gray-300">
                          Ideal: {safeNumber(balance.idealPercentage, 0)}%
                        </span>
                        <span>100%</span>
                      </div>
                      <div className="relative h-4 sm:h-6 bg-gray-800 rounded-full overflow-hidden">
                        {/* Zona ideal */}
                        <div
                          className="absolute h-full bg-green-500/20"
                          style={{
                            left: `${Math.max(0, safeNumber(balance.idealPercentage, 0) - 5)}%`,
                            width: '10%'
                          }}
                        />
                        {/* Línea ideal */}
                        <div
                          className="absolute h-full w-0.5 bg-green-500"
                          style={{ left: `${safeNumber(balance.idealPercentage, 0)}%` }}
                        />
                        {/* Barra actual */}
                        <div
                          className={`relative h-full bg-gradient-to-r ${colorGradient} transition-all duration-300`}
                          style={{ width: `${Math.min(100, Math.max(0, safeNumber(balance.percentage, 0)))}%` }}
                        >
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Grid de métricas responsivo */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Simetría</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.symmetryScore, 0)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${safeNumber(balance.symmetryScore, 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Fuerza</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.strengthIndex, 0)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                          <div
                            className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${safeNumber(balance.strengthIndex, 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Frecuencia</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.weeklyFrequency, 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">por semana</div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Intensidad</div>
                        <div className="text-sm sm:text-lg font-semibold text-white">
                          {safeNumber(balance.intensityScore, 0)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                          <div
                            className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${safeNumber(balance.intensityScore, 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recomendaciones y advertencias */}
                    <div className="space-y-2">
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

                      {/* Recomendación principal */}
                      <div className={`${balance.warnings && balance.warnings.length === 0 ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gray-800/50 border-gray-700/30'
                        } border rounded-lg p-3`}>
                        <div className="flex items-start gap-2">
                          <Zap className={`w-4 h-4 ${balance.warnings && balance.warnings.length === 0 ? 'text-blue-400' : 'text-gray-400'
                            } mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${balance.warnings && balance.warnings.length === 0 ? 'text-blue-300' : 'text-gray-300'
                              } break-words`}>
                              {balance.recommendation}
                            </p>
                            {balance.specificRecommendations && balance.specificRecommendations.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1 break-words">
                                {balance.specificRecommendations[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Grupos no entrenados */}
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