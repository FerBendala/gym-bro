import { AlertTriangle, BarChart, CheckCircle, Timer, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';
import { CategoryDashboardChart } from './category-dashboard-chart';
import { HorizontalBarChart } from './horizontal-bar-chart';

interface BalanceByGroupContentProps {
  muscleBalance: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
    volume?: number;
    intensityScore?: number;
    weeklyFrequency?: number;
    isBalanced?: boolean;
    priorityLevel?: string;
    progressTrend?: string;
    personalRecords?: any[];
    balanceHistory?: any;
  }>;
  categoryAnalysis: Record<string, any>;
  onItemClick?: (itemName: string) => void;
}

// Función de utilidad para manejar valores seguros
const safeNumber = (value: number | undefined, fallback: number = 0): number => {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
};

// Función para formatear porcentajes de forma consistente
const formatSafePercentage = (value: number, decimals: number = 1): string => {
  const safeValue = safeNumber(value, 0);
  return formatNumber(safeValue, decimals) + '%';
};

// Funciones auxiliares para colores e iconos de categorías
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Pecho': return 'from-red-500 to-red-700';
    case 'Espalda': return 'from-blue-500 to-blue-700';
    case 'Piernas': return 'from-green-500 to-green-700';
    case 'Hombros': return 'from-purple-500 to-purple-700';
    case 'Brazos': return 'from-orange-500 to-orange-700';
    case 'Core': return 'from-indigo-500 to-indigo-700';
    default: return 'from-gray-500 to-gray-700';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Pecho': return BarChart;
    case 'Espalda': return BarChart;
    case 'Piernas': return BarChart;
    case 'Hombros': return BarChart;
    case 'Brazos': return BarChart;
    case 'Core': return BarChart;
    default: return BarChart;
  }
};

export const BalanceByGroupContent: React.FC<BalanceByGroupContentProps> = ({
  muscleBalance,
  categoryAnalysis,
  onItemClick
}) => (
  <div className="space-y-6">
    {/* Gráfico de barras horizontales para balance por categoría */}
    <Card>
      <CardHeader className="pb-4">
        <h3 className="text-base lg:text-lg font-semibold text-white flex items-center">
          <BarChart className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Balance por Categoría</span>
          <div className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-300 cursor-help" title="Comparación visual del volumen actual vs ideal para cada grupo muscular">
            ℹ️
          </div>
        </h3>
      </CardHeader>
      <CardContent>
        <HorizontalBarChart
          data={muscleBalance
            .filter(balance => balance.volume && balance.volume > 0)
            .map(balance => ({
              name: balance.category,
              value: balance.percentage,
              ideal: balance.idealPercentage,
              color: getCategoryColor(balance.category).includes('red') ? '#EF4444' :
                getCategoryColor(balance.category).includes('blue') ? '#3B82F6' :
                  getCategoryColor(balance.category).includes('green') ? '#10B981' :
                    getCategoryColor(balance.category).includes('purple') ? '#8B5CF6' :
                      getCategoryColor(balance.category).includes('orange') ? '#F59E0B' :
                        getCategoryColor(balance.category).includes('indigo') ? '#6366F1' : '#6B7280'
            }))
          }
          onItemClick={onItemClick}
        />
      </CardContent>
    </Card>

    {/* Grid de métricas por categoría con gráficos intuitivos universales */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      {muscleBalance
        .filter(balance => (balance.volume && balance.volume > 0) || balance.priorityLevel === 'critical')
        .map((balance) => {
          const Icon = getCategoryIcon(balance.category);
          const colorGradient = getCategoryColor(balance.category);
          const categoryMetric = categoryAnalysis.categoryMetrics?.find((m: any) => m.category === balance.category);

          return (
            <Card key={balance.category} className="p-4 lg:p-5">
              <div id={`balance-card-${balance.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {/* Header con icono y título */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${colorGradient} flex-shrink-0`}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-base lg:text-lg truncate">{balance.category}</h4>
                    <div className="text-xs lg:text-sm text-gray-400">
                      {formatNumber(safeNumber(balance.volume, 0), 0)} kg total • {formatSafePercentage(balance.percentage)} del volumen
                    </div>
                  </div>
                </div>

                {/* Gráfico Dashboard Universal */}
                <CategoryDashboardChart
                  data={{
                    volume: balance.percentage,
                    idealVolume: balance.idealPercentage,
                    intensity: safeNumber(balance.intensityScore, 0),
                    frequency: safeNumber(balance.weeklyFrequency, 0),
                    strength: categoryMetric ? categoryMetric.weightProgression : 0,
                    records: categoryMetric ? categoryMetric.personalRecords : 0,
                    trend: balance.balanceHistory?.trend || 'stable'
                  }}
                  color={getCategoryColor(balance.category).includes('red') ? '#EF4444' :
                    getCategoryColor(balance.category).includes('blue') ? '#3B82F6' :
                      getCategoryColor(balance.category).includes('green') ? '#10B981' :
                        getCategoryColor(balance.category).includes('purple') ? '#8B5CF6' :
                          getCategoryColor(balance.category).includes('orange') ? '#F59E0B' :
                            getCategoryColor(balance.category).includes('indigo') ? '#6366F1' : '#6B7280'}
                />

                {/* Status y tendencia */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {balance.isBalanced ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-xs lg:text-sm text-gray-400">
                      {balance.isBalanced ? 'Equilibrado' : 'Desequilibrado'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {balance.progressTrend === 'improving' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-xs lg:text-sm text-green-400">Mejorando</span>
                      </>
                    )}
                    {balance.progressTrend === 'declining' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs lg:text-sm text-red-400">Declinando</span>
                      </>
                    )}
                    {balance.progressTrend === 'stable' && (
                      <>
                        <Timer className="w-4 h-4 text-gray-400" />
                        <span className="text-xs lg:text-sm text-gray-400">Estable</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Métricas adicionales */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <h5 className="text-xs lg:text-sm font-medium text-gray-400 mb-2">Métricas Detalladas:</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frecuencia:</span>
                      <span className="text-gray-400">{formatNumber(balance.weeklyFrequency || 0, 1)}/sem</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Intensidad:</span>
                      <span className="text-gray-400">{formatNumber(balance.intensityScore || 0, 0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">PRs:</span>
                      <span className="text-gray-400">{balance.personalRecords?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prioridad:</span>
                      <span className="text-gray-400">{balance.priorityLevel || 'normal'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
    </div>
  </div>
); 