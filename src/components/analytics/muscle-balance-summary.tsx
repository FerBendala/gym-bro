import { Activity, BarChart3, Calendar, Target, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import { IDEAL_VOLUME_DISTRIBUTION } from '../../constants/exercise-categories';
import { MUSCLE_GROUPS } from '../../constants/muscle-groups';
import type { WorkoutRecord } from '../../interfaces';
import { calculateExerciseProgress, formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';

interface MuscleGroupData {
  name: string;
  icon: string;
  color: string;
  volume: number;
  exercises: number;
  frequency: number;
  avgWeight: number;
  percentage: number;
  idealPercentage: number;
  balanceScore: number;
  progressPercent: number;
  recommendation: string;
}

interface MuscleBalanceSummaryProps {
  records: WorkoutRecord[];
}

export const MuscleBalanceSummary: React.FC<MuscleBalanceSummaryProps> = ({ records }) => {
  const muscleGroupData = useMemo((): MuscleGroupData[] => {
    if (records.length === 0) return [];

    // Agrupar por categoría muscular
    const groupedData: Record<string, {
      totalVolume: number;
      exercises: Set<string>;
      frequency: number;
      totalWeight: number;
      records: WorkoutRecord[];
    }> = {};

    records.forEach(record => {
      const categories = record.exercise?.categories || ['Sin categoría'];

      categories.forEach(category => {
        if (!groupedData[category]) {
          groupedData[category] = {
            totalVolume: 0,
            exercises: new Set(),
            frequency: 0,
            totalWeight: 0,
            records: []
          };
        }

        const volume = record.weight * record.reps * record.sets;
        groupedData[category].totalVolume += volume;
        groupedData[category].exercises.add(record.exercise?.name || 'Desconocido');
        groupedData[category].frequency += 1;
        groupedData[category].totalWeight += record.weight;
        groupedData[category].records.push(record);
      });
    });

    const totalVolume = Object.values(groupedData).reduce((sum, group) => sum + group.totalVolume, 0);

    // Función para obtener porcentaje ideal según categoría
    const getIdealVolumePercentage = (categoryName: string): number => {
      return IDEAL_VOLUME_DISTRIBUTION[categoryName as keyof typeof IDEAL_VOLUME_DISTRIBUTION] || 16.67;
    };

    return Object.entries(groupedData)
      .map(([categoryName, group]) => {
        const muscleGroup = MUSCLE_GROUPS[categoryName as keyof typeof MUSCLE_GROUPS];

        // **FUNCIÓN UNIFICADA**: Usar la función utilitaria para calcular progreso
        const { percentProgress: progressPercent } = calculateExerciseProgress(group.records);

        const percentage = totalVolume > 0 ? (group.totalVolume / totalVolume) * 100 : 0;
        const idealPercentage = getIdealVolumePercentage(categoryName);
        const balanceScore = Math.max(0, 100 - Math.abs(percentage - idealPercentage) * 2);

        return {
          name: categoryName,
          icon: muscleGroup?.icon || '💪',
          color: muscleGroup?.color || 'gray',
          volume: group.totalVolume,
          exercises: group.exercises.size,
          frequency: group.frequency,
          avgWeight: group.totalWeight / Math.max(1, group.frequency),
          percentage,
          idealPercentage,
          balanceScore,
          progressPercent,
          recommendation: generateRecommendation(categoryName, percentage, idealPercentage, balanceScore)
        };
      })
      .sort((a, b) => b.volume - a.volume);
  }, [records]);

  const generateRecommendation = (categoryName: string, percentage: number, idealPercentage: number, balanceScore: number): string => {
    const diff = percentage - idealPercentage;

    if (Math.abs(diff) < 2) {
      return 'Volumen óptimo - mantén el equilibrio actual';
    } else if (diff > 5) {
      return `Reduce volumen en ${Math.round(diff)}% - está sobrentrenado`;
    } else if (diff < -5) {
      return `Aumenta volumen en ${Math.round(Math.abs(diff))}% - necesita más trabajo`;
    } else {
      return 'Ajustar ligeramente el volumen para mejor balance';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colorMap[color] || colorMap.gray;
  };

  const getBalanceColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBalanceIcon = (score: number) => {
    if (score >= 80) return Activity;
    if (score >= 60) return Target;
    return Zap;
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos de balance muscular
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos para ver el balance entre grupos musculares
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Balance Muscular General
            <InfoTooltip
              content="Análisis del equilibrio entre diferentes grupos musculares basado en volumen de entrenamiento y frecuencia."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getBalanceColor(muscleGroupData.reduce((sum, cat) => sum + cat.balanceScore, 0) / muscleGroupData.length)}`}>
                {muscleGroupData.length > 0 ? (muscleGroupData.reduce((sum, cat) => sum + cat.balanceScore, 0) / muscleGroupData.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-400">Balance General</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {muscleGroupData.length}
              </div>
              <div className="text-sm text-gray-400">Grupos Activos</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {muscleGroupData.length > 0 ? muscleGroupData[0].name : 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Grupo Dominante</div>
            </div>
          </div>

          {/* Recomendaciones generales */}
          {muscleGroupData.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-300 mb-2">
                Recomendaciones Generales
              </h4>
              <ul className="text-sm text-blue-200 space-y-1">
                {muscleGroupData.map((cat, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {cat.recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Factores de riesgo */}
          {muscleGroupData.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-300 mb-2">
                Factores de Riesgo
              </h4>
              <ul className="text-sm text-red-200 space-y-1">
                {muscleGroupData.map((cat, index) => (
                  <li key={index} className="flex items-start">
                    <Zap className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    {cat.recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis por categoría */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Análisis por Categoría
            {/* selectedCategory !== 'all' && (
              <span className="ml-2 text-sm font-normal text-blue-400">
                - {selectedCategory}
              </span>
            ) */}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {muscleGroupData.map((category) => {
              const BalanceIcon = getBalanceIcon(category.balanceScore);
              const IconComponent = getCategoryIcon(category.name);

              return (
                <div
                  key={category.name}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${category.balanceScore >= 80
                    ? 'bg-green-900/20 border-green-500/30'
                    : category.balanceScore >= 60
                      ? 'bg-yellow-900/20 border-yellow-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(category.color)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{category.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{category.exercises} ejercicios</span>
                          <span>•</span>
                          <span>{category.frequency} sesiones</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <BalanceIcon className={`w-4 h-4 ${getBalanceColor(category.balanceScore)}`} />
                        <span className={`text-sm font-medium ${getBalanceColor(category.balanceScore)}`}>
                          {category.balanceScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Balance
                      </div>
                    </div>
                  </div>

                  {/* Métricas principales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">
                        {formatNumber(category.volume)}
                      </div>
                      <div className="text-xs text-gray-400">Volumen (kg)</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">
                        {category.percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">% del total</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">
                        {formatNumber(category.avgWeight)}
                      </div>
                      <div className="text-xs text-gray-400">Peso promedio</div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className={`text-lg font-bold ${category.progressPercent > 0 ? 'text-green-400' :
                        category.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                        {category.progressPercent > 0 ? '+' : ''}{category.progressPercent.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Progreso</div>
                    </div>
                  </div>

                  {/* Barra de progreso del balance */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">
                        Balance: {category.percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-400">
                        Ideal: {category.idealPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${category.balanceScore >= 80 ? 'bg-green-500' :
                          category.balanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{
                          width: `${Math.min(100, category.percentage)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Recomendaciones específicas */}
                  {category.recommendation && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">
                        Recomendación
                      </h5>
                      <p className="text-sm text-gray-400">{category.recommendation}</p>
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

// Funciones auxiliares (mantener igual)
const getCategoryIcon = (categoryName: string) => {
  const muscleGroup = MUSCLE_GROUPS[categoryName as keyof typeof MUSCLE_GROUPS];
  return muscleGroup?.icon || '💪';
}; 