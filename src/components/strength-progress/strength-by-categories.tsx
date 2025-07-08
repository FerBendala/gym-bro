import { Award, BarChart3, Target, TrendingUp, Users, Zap } from 'lucide-react';
import React from 'react';
import type { WorkoutRecord } from '../../interfaces';
import { formatNumber } from '../../utils/functions';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import { useStrengthByCategory } from './hooks/use-strength-by-category';

interface StrengthByCategoriesProps {
  records: WorkoutRecord[];
}

/**
 * Componente para mostrar análisis de fuerza integrado con categorías
 */
export const StrengthByCategories: React.FC<StrengthByCategoriesProps> = ({ records }) => {
  const analysis = useStrengthByCategory(records);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos por categorías
        </h3>
        <p className="text-gray-500">
          Registra entrenamientos para ver el análisis de fuerza por categorías
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 bg-yellow-900/20';
    if (rank === 2) return 'text-gray-300 bg-gray-800/50';
    if (rank === 3) return 'text-orange-400 bg-orange-900/20';
    return 'text-gray-400 bg-gray-800/30';
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'elite': return '👑';
      case 'advanced': return '🎯';
      case 'intermediate': return '📈';
      default: return '🌱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con métricas generales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Progreso de Fuerza por Categorías</h2>
            <p className="text-gray-400">Análisis comparativo del desarrollo de fuerza</p>
          </div>
        </div>
      </div>

      {/* Métricas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.totalStrengthScore)}`}>
                  {analysis.totalStrengthScore}
                </p>
                <p className="text-sm text-gray-400">Score General</p>
              </div>
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.balanceScore)}`}>
                  {analysis.balanceScore}%
                </p>
                <p className="text-sm text-gray-400">Balance</p>
              </div>
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {analysis.categories.length}
                </p>
                <p className="text-sm text-gray-400">Categorías</p>
              </div>
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {analysis.bestCategory?.categoryName.slice(0, 8) || 'N/A'}
                </p>
                <p className="text-sm text-gray-400">Mejor Categoría</p>
              </div>
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de categorías */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Ranking de Desarrollo de Fuerza
            <InfoTooltip
              content="Categorías ordenadas por su puntuación de desarrollo de fuerza general."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.categories.map((category, index) => (
              <div
                key={category.categoryName}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-sm font-bold ${getRankColor(category.strengthRank)}`}>
                      #{category.strengthRank}
                    </span>
                    <h4 className="text-lg font-semibold text-white">{category.categoryName}</h4>
                    <span className="text-lg">
                      {getPhaseIcon(category.strengthAnalysis.strengthCurve.phase)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${getScoreColor(category.strengthScore)}`}>
                      {category.strengthScore}
                    </span>
                    <span className="text-sm text-gray-400">/100</span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Desarrollo de Fuerza</span>
                    <span>{category.strengthScore}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(category.strengthScore)} transition-all duration-500`}
                      style={{ width: `${category.strengthScore}%` }}
                    />
                  </div>
                </div>

                {/* Métricas clave */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">
                      {formatNumber(category.strengthAnalysis.currentMax1RM)}kg
                    </p>
                    <p className="text-xs text-gray-400">1RM Máximo</p>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">
                      {category.strengthAnalysis.consistencyMetrics.progressionConsistency}%
                    </p>
                    <p className="text-xs text-gray-400">Consistencia</p>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-400">
                      {formatNumber(category.categoryMetrics.totalVolume)}
                    </p>
                    <p className="text-xs text-gray-400">Volumen Total</p>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-400">
                      {category.categoryMetrics.workouts}
                    </p>
                    <p className="text-xs text-gray-400">Entrenamientos</p>
                  </div>
                </div>

                {/* Progreso y predicciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Progreso</span>
                      <span className={`font-bold ${category.strengthAnalysis.overallProgress.percentage > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                        {category.strengthAnalysis.overallProgress.percentage > 0 ? '+' : ''}{category.strengthAnalysis.overallProgress.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Fase</span>
                      <span className="font-bold text-white capitalize">
                        {category.strengthAnalysis.strengthCurve.phase}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Próximo PR</span>
                      <span className="font-bold text-blue-400">
                        {formatNumber(category.strengthAnalysis.predictions.next4WeeksPR)}kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recomendaciones */}
                {category.recommendations.length > 0 && (
                  <div className="border-t border-gray-700 pt-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Recomendaciones:</h5>
                    <div className="space-y-1">
                      {category.recommendations.map((rec, recIndex) => (
                        <p key={recIndex} className="text-sm text-gray-400">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones generales */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Recomendaciones de Enfoque
            <InfoTooltip
              content="Sugerencias estratégicas para mejorar el balance y desarrollo general de fuerza."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.focusRecommendations.map((recommendation, index) => (
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

      {/* Comparación de mejor vs peor categoría */}
      {analysis.bestCategory && analysis.worstCategory && analysis.bestCategory !== analysis.worstCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mejor categoría */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Mejor Categoría: {analysis.bestCategory.categoryName}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Score de Fuerza</span>
                  <span className="text-xl font-bold text-green-400">
                    {analysis.bestCategory.strengthScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">1RM Máximo</span>
                  <span className="font-bold text-white">
                    {formatNumber(analysis.bestCategory.strengthAnalysis.currentMax1RM)}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Velocidad de Progreso</span>
                  <span className="font-bold text-blue-400 capitalize">
                    {analysis.bestCategory.strengthAnalysis.overallProgress.rate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Próximo PR Estimado</span>
                  <span className="font-bold text-purple-400">
                    {formatNumber(analysis.bestCategory.strengthAnalysis.predictions.next4WeeksPR)}kg
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peor categoría */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                Categoría a Mejorar: {analysis.worstCategory.categoryName}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Score de Fuerza</span>
                  <span className="text-xl font-bold text-red-400">
                    {analysis.worstCategory.strengthScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">1RM Máximo</span>
                  <span className="font-bold text-white">
                    {formatNumber(analysis.worstCategory.strengthAnalysis.currentMax1RM)}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Riesgo de Meseta</span>
                  <span className={`font-bold ${analysis.worstCategory.strengthAnalysis.predictions.plateauRisk > 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {analysis.worstCategory.strengthAnalysis.predictions.plateauRisk}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Frecuencia Semanal</span>
                  <span className="font-bold text-blue-400">
                    {analysis.worstCategory.categoryMetrics.avgWorkoutsPerWeek.toFixed(1)} sesiones
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 