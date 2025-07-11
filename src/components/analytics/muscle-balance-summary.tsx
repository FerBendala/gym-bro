import { Activity, AlertTriangle, Award, BarChart3, Dumbbell, Footprints, Hexagon, RotateCcw, Shield, Target, TrendingDown, TrendingUp, Triangle, Users } from 'lucide-react';
import React, { useMemo } from 'react';
import { getIdealVolumePercentage } from '../../constants/exercise-categories';
import { MUSCLE_GROUPS } from '../../constants/muscle-groups';
import type { WorkoutRecord } from '../../interfaces';
import { formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';

interface MuscleBalanceSummaryProps {
  records: WorkoutRecord[];
  selectedCategory?: string;
}

// Iconos más específicos para cada categoría muscular
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Pecho': Hexagon,        // Hexágono representa la forma de los pectorales
  'Espalda': Shield,       // Escudo representa la protección/soporte de la espalda
  'Piernas': Footprints,   // Huellas representan el movimiento de piernas
  'Hombros': Triangle,     // Triángulo representa la forma de los deltoides
  'Brazos': Dumbbell,      // Mancuerna es el icono más representativo para brazos
  'Core': RotateCcw        // Rotación representa los movimientos de core/abdominales
};

interface CategoryMetrics {
  name: string;
  icon: string;
  color: string;
  volume: number;
  exercises: number;
  frequency: number;
  avgWeight: number;
  maxWeight: number;
  progress: number;
  progressPercent: number;
  percentage: number;
  balanceScore: number;
  lastWorkout: Date;
  recommendations: string[];
}

interface BalanceAnalysis {
  categories: CategoryMetrics[];
  overallBalance: number;
  dominantCategory: CategoryMetrics | null;
  weakestCategory: CategoryMetrics | null;
  recommendations: string[];
  riskFactors: string[];
}

/**
 * Componente mejorado para el resumen de balance muscular
 */
export const MuscleBalanceSummary: React.FC<MuscleBalanceSummaryProps> = ({
  records,
  selectedCategory = 'all'
}) => {
  const analysis = useMemo((): BalanceAnalysis => {
    if (records.length === 0) {
      return {
        categories: [],
        overallBalance: 0,
        dominantCategory: null,
        weakestCategory: null,
        recommendations: ['Registra entrenamientos para ver el análisis de balance muscular'],
        riskFactors: []
      };
    }

    // Filtrar registros válidos
    const validRecords = records.filter(record =>
      record.exercise && record.exercise.name && record.exercise.name !== 'Ejercicio desconocido'
    );

    if (validRecords.length === 0) {
      return {
        categories: [],
        overallBalance: 0,
        dominantCategory: null,
        weakestCategory: null,
        recommendations: ['No hay datos válidos de ejercicios para analizar'],
        riskFactors: []
      };
    }

    // Calcular métricas por categoría
    const categoryData: Record<string, {
      volume: number;
      exercises: Set<string>;
      records: WorkoutRecord[];
      weights: number[];
    }> = {};

    validRecords.forEach(record => {
      const categories = record.exercise?.categories || ['Sin categoría'];
      const totalVolume = record.weight * record.reps * record.sets;

      categories.forEach(category => {
        if (!categoryData[category]) {
          categoryData[category] = {
            volume: 0,
            exercises: new Set(),
            records: [],
            weights: []
          };
        }

        // CORREGIDO: Asignar volumen completo a cada categoría
        // Un ejercicio multi-categoría trabaja realmente ambos grupos musculares
        categoryData[category].volume += totalVolume;
        categoryData[category].exercises.add(record.exercise!.name);
        categoryData[category].records.push(record);
        categoryData[category].weights.push(record.weight);
      });
    });

    const totalVolume = Object.values(categoryData).reduce((sum, data) => sum + data.volume, 0);
    const totalDays = new Set(validRecords.map(r => r.date.toDateString())).size;

    // Crear métricas por categoría
    const categories: CategoryMetrics[] = Object.entries(categoryData).map(([categoryName, data]) => {
      // Buscar información del grupo muscular
      const muscleGroup = Object.values(MUSCLE_GROUPS).find(group =>
        group.categories.some(cat => cat === categoryName) || group.name === categoryName
      );

      const icon = muscleGroup?.icon || '💪';
      const color = muscleGroup?.color || 'gray';

      // Calcular métricas básicas
      const percentage = totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0;
      const exerciseCount = data.exercises.size;
      const frequency = data.records.length;
      const avgWeight = data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length;
      const maxWeight = Math.max(...data.weights);

      // Calcular progreso temporal
      const sortedRecords = data.records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstRecord = sortedRecords[0];
      const lastRecord = sortedRecords[sortedRecords.length - 1];

      let progress = 0;
      let progressPercent = 0;

      if (sortedRecords.length > 1) {
        const first1RM = firstRecord.weight * (1 + Math.min(firstRecord.reps, 20) / 30);
        const last1RM = lastRecord.weight * (1 + Math.min(lastRecord.reps, 20) / 30);
        progress = last1RM - first1RM;
        progressPercent = first1RM > 0 ? (progress / first1RM) * 100 : 0;
      }

      // Calcular score de balance (0-100)
      const idealPercentage = getIdealVolumePercentage(categoryName);
      const balanceDeviation = Math.abs(percentage - idealPercentage);
      const balanceScore = Math.max(0, 100 - (balanceDeviation * 3));

      // Fecha del último entrenamiento
      const lastWorkout = new Date(Math.max(...data.records.map(r => new Date(r.date).getTime())));

      // Generar recomendaciones específicas
      const recommendations = generateCategoryRecommendations(categoryName, {
        percentage,
        idealPercentage,
        frequency,
        progressPercent,
        balanceScore
      });

      return {
        name: categoryName,
        icon,
        color,
        volume: data.volume,
        exercises: exerciseCount,
        frequency,
        avgWeight,
        maxWeight,
        progress,
        progressPercent,
        percentage,
        balanceScore,
        lastWorkout,
        recommendations
      };
    }).sort((a, b) => b.volume - a.volume);

    // Análisis general de balance
    const overallBalance = categories.length > 0
      ? categories.reduce((sum, cat) => sum + cat.balanceScore, 0) / categories.length
      : 0;

    const dominantCategory = categories[0] || null;
    const weakestCategory = categories[categories.length - 1] || null;

    // Generar recomendaciones generales
    const recommendations = generateGeneralRecommendations(categories, overallBalance);
    const riskFactors = identifyRiskFactors(categories);

    return {
      categories,
      overallBalance,
      dominantCategory,
      weakestCategory,
      recommendations,
      riskFactors
    };
  }, [records, selectedCategory]);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
      green: 'text-green-400 bg-green-900/20 border-green-500/30',
      purple: 'text-purple-400 bg-purple-900/20 border-purple-500/30',
      red: 'text-red-400 bg-red-900/20 border-red-500/30',
      yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
      indigo: 'text-indigo-400 bg-indigo-900/20 border-indigo-500/30',
      orange: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
      pink: 'text-pink-400 bg-pink-900/20 border-pink-500/30',
      teal: 'text-teal-400 bg-teal-900/20 border-teal-500/30',
    };
    return colorMap[color] || 'text-gray-400 bg-gray-900/20 border-gray-500/30';
  };

  const getBalanceColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/20';
    if (score >= 60) return 'text-blue-400 bg-blue-900/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-red-400 bg-red-900/20';
  };

  const getBalanceIcon = (score: number) => {
    if (score >= 80) return <Shield className="w-4 h-4" />;
    if (score >= 60) return <Target className="w-4 h-4" />;
    if (score >= 40) return <Activity className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (analysis.categories.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Sin datos de balance muscular
            </h3>
            <p className="text-gray-500">
              Registra entrenamientos para ver el análisis de balance entre grupos musculares
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con métricas generales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Balance Muscular</h3>
                <p className="text-gray-400">Análisis de distribución y equilibrio entre grupos musculares</p>
              </div>
            </div>
            <InfoTooltip
              content="Evaluación del equilibrio en el desarrollo de diferentes grupos musculares para prevenir desequilibrios y optimizar el rendimiento."
              position="left"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${getBalanceColor(analysis.overallBalance)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(analysis.overallBalance)}%
                  </p>
                  <p className="text-sm text-gray-400">Balance General</p>
                </div>
                {getBalanceIcon(analysis.overallBalance)}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {analysis.categories.length}
                  </p>
                  <p className="text-sm text-gray-400">Grupos Activos</p>
                </div>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {analysis.dominantCategory?.name.slice(0, 8) || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">Dominante</p>
                </div>
                <Award className="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {analysis.weakestCategory?.name.slice(0, 8) || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">Más Débil</p>
                </div>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis detallado por categoría */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Análisis Detallado por Categoría</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.categories.map((category, index) => {
              // Obtener el componente de icono específico
              const IconComponent = categoryIcons[category.name] || Dumbbell;

              return (
                <div
                  key={category.name}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:border-opacity-80 ${getColorClasses(category.color)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-lg">
                        <IconComponent className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white flex items-center">
                          {category.name}
                          <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-400">
                          {category.exercises} ejercicio{category.exercises !== 1 ? 's' : ''} • {category.frequency} sesiones
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {formatNumber(category.volume)} kg
                      </p>
                      <p className="text-sm text-gray-400">
                        {category.percentage.toFixed(1)}% del total
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso mejorada */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{category.name}</span>
                      <span>{category.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getColorClasses(category.color).split(' ')[0]} bg-current`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Métricas específicas */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-lg font-bold text-white">
                        {formatNumber(category.avgWeight)}kg
                      </p>
                      <p className="text-xs text-gray-400">Peso Promedio</p>
                    </div>

                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-lg font-bold text-white">
                        {formatNumber(category.maxWeight)}kg
                      </p>
                      <p className="text-xs text-gray-400">Peso Máximo</p>
                    </div>

                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1">
                        <p className={`text-lg font-bold ${category.progressPercent > 0 ? 'text-green-400' :
                          category.progressPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {category.progressPercent > 0 ? '+' : ''}{category.progressPercent.toFixed(1)}%
                        </p>
                        {category.progressPercent !== 0 && (
                          category.progressPercent > 0 ?
                            <TrendingUp className="w-4 h-4 text-green-400" /> :
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">Progreso</p>
                    </div>

                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-center space-x-1">
                        <p className={`text-lg font-bold ${getBalanceColor(category.balanceScore).split(' ')[0]}`}>
                          {Math.round(category.balanceScore)}
                        </p>
                        {getBalanceIcon(category.balanceScore)}
                      </div>
                      <p className="text-xs text-gray-400">Balance Score</p>
                    </div>
                  </div>

                  {/* Recomendaciones por categoría */}
                  {category.recommendations.length > 0 && (
                    <div className="border-t border-gray-700 pt-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Recomendaciones:</h5>
                      <div className="space-y-1">
                        {category.recommendations.slice(0, 2).map((rec, recIndex) => (
                          <p key={recIndex} className="text-xs text-gray-400 flex items-start">
                            <span className="text-blue-400 mr-1">•</span>
                            {rec}
                          </p>
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

      {/* Análisis y recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recomendaciones generales */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Recomendaciones de Balance
              <InfoTooltip
                content="Sugerencias para mejorar el equilibrio muscular y prevenir desequilibrios."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Factores de riesgo */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Factores de Riesgo
              <InfoTooltip
                content="Identificación de posibles desequilibrios que podrían llevar a lesiones."
                position="top"
                className="ml-2"
              />
            </h3>
          </CardHeader>
          <CardContent>
            {analysis.riskFactors.length > 0 ? (
              <div className="space-y-3">
                {analysis.riskFactors.map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">{risk}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-medium">Sin factores de riesgo detectados</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tu balance muscular actual parece saludable
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Funciones auxiliares
const generateCategoryRecommendations = (
  categoryName: string,
  metrics: { percentage: number; idealPercentage: number; frequency: number; progressPercent: number; balanceScore: number }
): string[] => {
  const recommendations: string[] = [];
  const { percentage, idealPercentage, frequency, progressPercent, balanceScore } = metrics;

  if (percentage < idealPercentage - 5) {
    recommendations.push(`Aumentar volumen de ${categoryName.toLowerCase()} en un ${(idealPercentage - percentage).toFixed(1)}%`);
  }

  if (frequency < 2) {
    recommendations.push(`Entrenar ${categoryName.toLowerCase()} al menos 2 veces por semana`);
  }

  if (progressPercent < 0) {
    recommendations.push(`Revisar progresión en ${categoryName.toLowerCase()} - hay una tendencia descendente`);
  }

  if (balanceScore < 60) {
    recommendations.push(`Priorizar equilibrio en ${categoryName.toLowerCase()} para evitar desequilibrios`);
  }

  return recommendations.slice(0, 3);
};

const generateGeneralRecommendations = (
  categories: CategoryMetrics[],
  overallBalance: number
): string[] => {
  const recommendations: string[] = [];

  if (overallBalance < 60) {
    recommendations.push('Balance general mejorable - redistribuir volumen entre grupos musculares');
  }

  const lowBalanceCategories = categories.filter(cat => cat.balanceScore < 50);
  if (lowBalanceCategories.length > 0) {
    recommendations.push(`Priorizar: ${lowBalanceCategories.map(cat => cat.name).join(', ')}`);
  }

  const underrepresentedCategories = categories.filter(cat => cat.percentage < 5);
  if (underrepresentedCategories.length > 0) {
    recommendations.push(`Incluir más ejercicios de: ${underrepresentedCategories.map(cat => cat.name).join(', ')}`);
  }

  const dominantCategories = categories.filter(cat => cat.percentage > 40);
  if (dominantCategories.length > 0) {
    recommendations.push(`Reducir énfasis en: ${dominantCategories.map(cat => cat.name).join(', ')}`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Mantener el balance actual - distribución saludable entre grupos musculares');
  }

  return recommendations.slice(0, 4);
};

const identifyRiskFactors = (categories: CategoryMetrics[]): string[] => {
  const riskFactors: string[] = [];

  // Desequilibrios críticos
  const criticalImbalances = categories.filter(cat => cat.balanceScore < 30);
  if (criticalImbalances.length > 0) {
    riskFactors.push(`Desequilibrios críticos en: ${criticalImbalances.map(cat => cat.name).join(', ')}`);
  }

  // Progreso negativo
  const decliningCategories = categories.filter(cat => cat.progressPercent < -10);
  if (decliningCategories.length > 0) {
    riskFactors.push(`Pérdida de fuerza en: ${decliningCategories.map(cat => cat.name).join(', ')}`);
  }

  // Grupos dominantes excesivos
  const overDominant = categories.filter(cat => cat.percentage > 50);
  if (overDominant.length > 0) {
    riskFactors.push(`Sobreentrenamiento posible en: ${overDominant.map(cat => cat.name).join(', ')}`);
  }

  // Grupos completamente abandonados
  const abandoned = categories.filter(cat => cat.frequency === 0);
  if (abandoned.length > 2) {
    riskFactors.push(`Múltiples grupos musculares sin entrenar: ${abandoned.map(cat => cat.name).join(', ')}`);
  }

  return riskFactors.slice(0, 3);
}; 