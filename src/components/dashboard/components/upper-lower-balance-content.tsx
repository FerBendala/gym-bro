import { Activity, Dumbbell, Footprints, Scale, Timer, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import { formatNumber } from '../../../utils/functions';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';

const META_CATEGORIES = {
  UPPER_BODY: { idealPercentage: 60 },
  LOWER_BODY: { idealPercentage: 35 },
  CORE: { idealPercentage: 5 }
};

interface UpperLowerBalanceContentProps {
  upperLowerBalance: any;
  categoryAnalysis: any;
  muscleBalance: any[];
  onItemClick: (itemName: string) => void;
}

const UpperLowerBalanceContent: React.FC<UpperLowerBalanceContentProps> = ({
  upperLowerBalance,
  categoryAnalysis,
  muscleBalance,
  onItemClick
}) => {
  // Preparar datos para las meta-categorías
  const metaCategoryData: Array<{
    category: string;
    icon: any;
    color: string;
    gradient: string;
    percentage: number;
    volume: number;
    idealPercentage: number;
    categories: string[];
    isBalanced: boolean;
  }> = [
      {
        category: 'Tren Superior',
        icon: Dumbbell,
        color: '#3B82F6',
        gradient: 'from-blue-500 to-blue-700',
        percentage: upperLowerBalance.upperBody.percentage,
        volume: upperLowerBalance.upperBody.volume,
        idealPercentage: META_CATEGORIES.UPPER_BODY.idealPercentage,
        categories: upperLowerBalance.upperBody.categories,
        isBalanced: Math.abs(upperLowerBalance.upperBody.percentage - META_CATEGORIES.UPPER_BODY.idealPercentage) <= 5
      },
      {
        category: 'Tren Inferior',
        icon: Footprints,
        color: '#10B981',
        gradient: 'from-green-500 to-green-700',
        percentage: upperLowerBalance.lowerBody.percentage,
        volume: upperLowerBalance.lowerBody.volume,
        idealPercentage: META_CATEGORIES.LOWER_BODY.idealPercentage,
        categories: upperLowerBalance.lowerBody.categories,
        isBalanced: Math.abs(upperLowerBalance.lowerBody.percentage - META_CATEGORIES.LOWER_BODY.idealPercentage) <= 5
      }
    ];

  // Agregar Core si tiene volumen
  if (upperLowerBalance.core.volume > 0) {
    metaCategoryData.push({
      category: 'Core',
      icon: Activity,
      color: '#6366F1',
      gradient: 'from-indigo-500 to-indigo-700',
      percentage: upperLowerBalance.core.percentage,
      volume: upperLowerBalance.core.volume,
      idealPercentage: META_CATEGORIES.CORE.idealPercentage,
      categories: upperLowerBalance.core.categories,
      isBalanced: Math.abs(upperLowerBalance.core.percentage - META_CATEGORIES.CORE.idealPercentage) <= 5
    });
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de barras horizontales para balance de meta-categorías */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-base lg:text-lg font-semibold text-white flex items-center">
            <Scale className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Balance Tren Superior vs Inferior</span>
            <InfoTooltip
              content="Comparación del volumen de entrenamiento entre tren superior (pecho, espalda, hombros, brazos) e inferior (piernas)"
              position="top"
              className="ml-2 flex-shrink-0"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <HorizontalBarChart
            data={metaCategoryData.map(meta => ({
              name: meta.category,
              value: meta.percentage,
              ideal: meta.idealPercentage,
              color: meta.color
            }))}
            onItemClick={onItemClick}
          />
        </CardContent>
      </Card>

      {/* Grid de métricas por meta-categoría usando el mismo estilo que General */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {metaCategoryData.map((meta) => {
          const Icon = meta.icon;

          // Calcular métricas agregadas para esta meta-categoría
          const categoryMetrics = meta.categories
            .map((cat: string) => categoryAnalysis.categoryMetrics.find((m: any) => m.category === cat))
            .filter(Boolean);

          // Obtener datos de muscleBalance para tendencias reales
          const muscleBalanceData = meta.categories
            .map((cat: string) => muscleBalance.find((b: any) => b.category === cat))
            .filter(Boolean);

          const totalFrequency = categoryMetrics.reduce((sum: number, m: any) => sum + (m.avgWorkoutsPerWeek || 0), 0) / Math.max(1, categoryMetrics.length);
          const avgIntensity = categoryMetrics.reduce((sum: number, m: any) => sum + (m.intensityScore || 0), 0) / Math.max(1, categoryMetrics.length);
          const totalRecords = categoryMetrics.reduce((sum: number, m: any) => sum + (m.personalRecords?.length || 0), 0);
          const avgStrength = categoryMetrics.reduce((sum: number, m: any) => sum + (m.progressTrend?.strength || 0), 0) / Math.max(1, categoryMetrics.length);

          // Determinar tendencia general basada en muscleBalance (más confiable)
          const improvingCount = muscleBalanceData.filter((b: any) => b.balanceHistory?.trend === 'improving').length;
          const stableCount = muscleBalanceData.filter((b: any) => b.balanceHistory?.trend === 'stable').length;
          const decliningCount = muscleBalanceData.filter((b: any) => b.balanceHistory?.trend === 'declining').length;

          // Lógica mejorada: si la mayoría está mejorando, es improving
          let trend = 'stable';
          if (improvingCount > decliningCount && improvingCount > stableCount) {
            trend = 'improving';
          } else if (decliningCount > improvingCount && decliningCount > stableCount) {
            trend = 'declining';
          } else if (stableCount > improvingCount && stableCount > decliningCount) {
            trend = 'stable';
          } else if (improvingCount === decliningCount && improvingCount > 0) {
            trend = 'stable'; // Empate entre improving y declining
          } else if (improvingCount > 0) {
            trend = 'improving'; // Si hay al menos uno mejorando y no hay declining mayoritario
          }

          const chartData = {
            volume: meta.percentage,
            idealVolume: meta.idealPercentage,
            intensity: avgIntensity,
            frequency: totalFrequency,
            strength: avgStrength,
            records: totalRecords,
            trend: trend === 'improving' ? '+' : trend === 'declining' ? '-' : '='
          };

          return (
            <Card key={meta.category} className="p-4 lg:p-5">
              <div id={`upper-lower-card-${meta.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {/* Header con icono y estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 lg:p-2.5 rounded-lg bg-gradient-to-br ${meta.gradient} flex-shrink-0`}>
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base lg:text-lg font-semibold text-white truncate">
                        {meta.category}
                      </h4>
                      <p className="text-xs lg:text-sm text-gray-400">
                        {formatNumber(meta.volume, 0)} kg total • {formatNumber(meta.percentage, 1)}% del volumen
                      </p>
                    </div>
                  </div>

                  {/* Estado balanceado/desequilibrado */}
                  <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${meta.isBalanced
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {meta.isBalanced ? 'Equilibrado' : 'Desequilibrado'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${trend === 'improving' ? 'bg-blue-500/20 text-blue-400' :
                      trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                      {trend === 'improving' ? 'Mejorando' :
                        trend === 'declining' ? 'Declinando' :
                          'Estable'}
                    </span>
                  </div>
                </div>

                {/* Dashboard universal */}
                <CategoryDashboardChart
                  data={chartData}
                  color={meta.color}
                />

                {/* Categorías incluidas */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <h5 className="text-xs lg:text-sm font-medium text-gray-400 mb-2">Incluye:</h5>
                  <div className="space-y-1">
                    {meta.categories.map((category: string) => {
                      const catData = categoryAnalysis.categoryMetrics.find((m: any) => m.category === category);
                      return (
                        <div key={category} className="flex justify-between text-xs">
                          <span className="text-gray-500">{category}</span>
                          <span className="text-gray-400">
                            {catData ? formatNumber(catData.percentage, 1) + '%' : '0%'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Componente de barras horizontales
interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    ideal: number;
    color: string;
  }>;
  onItemClick?: (itemName: string) => void;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, onItemClick }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.value, item.ideal))) * 1.1;

  const handleItemClick = (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-200"
          onClick={() => handleItemClick(item.name)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">{item.name}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">{formatNumber(item.value, 1)}%</span>
              <span className="text-xs text-gray-400">({formatNumber(item.ideal, 0)}% ideal)</span>
            </div>
          </div>

          <div className="relative">
            {/* Barra de fondo */}
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              {/* Zona ideal */}
              <div
                className="absolute h-full bg-white/10 border-x border-white/20"
                style={{
                  left: `${Math.max(0, (item.ideal - 2) / maxValue * 100)}%`,
                  width: `${4 / maxValue * 100}%`
                }}
              />

              {/* Barra actual */}
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                  backgroundColor: item.color
                }}
              />

              {/* Indicador ideal */}
              <div
                className="absolute top-0 w-0.5 h-full bg-white"
                style={{ left: `${(item.ideal / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de dashboard universal para categorías
interface CategoryDashboardChartProps {
  data: {
    volume: number;
    idealVolume: number;
    intensity: number;
    frequency: number;
    strength: number;
    records: number;
    trend: string;
  };
  color: string;
}

const CategoryDashboardChart: React.FC<CategoryDashboardChartProps> = ({ data, color }) => {
  // Calcular valores dinámicos basados en datos reales
  const maxFrequency = Math.max(data.frequency, 3.5); // Máximo realista para frecuencia semanal
  const frequencyPercentage = (data.frequency / maxFrequency) * 100;
  const idealFrequencyPercentage = (2.5 / maxFrequency) * 100; // 2.5 veces por semana como ideal

  // Normalizar fuerza: convertir progresión (-100 a +100) a escala 0-100
  const normalizedStrength = Math.max(0, Math.min(100, ((data.strength + 100) / 2)));
  const strengthIdeal = 50; // 0% de progresión como punto neutral

  // Calcular ideal de intensidad basado en datos disponibles
  const intensityIdeal = Math.min(80, Math.max(60, data.intensity * 0.9)); // 10% menos que actual como objetivo conservador

  const metrics = [
    {
      label: 'Volumen',
      value: data.volume,
      max: Math.max(data.idealVolume * 1.5, data.volume, 100),
      ideal: data.idealVolume,
      unit: '%',
      color: color
    },
    {
      label: 'Intensidad',
      value: data.intensity,
      max: 100,
      ideal: intensityIdeal,
      unit: '%',
      color: '#3B82F6'
    },
    {
      label: 'Frecuencia',
      value: frequencyPercentage,
      max: 100,
      ideal: idealFrequencyPercentage,
      unit: '/sem',
      color: '#8B5CF6'
    },
    {
      label: 'Fuerza',
      value: normalizedStrength,
      max: 100,
      ideal: strengthIdeal,
      unit: '%',
      color: data.strength > 0 ? '#10B981' : data.strength < 0 ? '#EF4444' : '#6B7280'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Métricas principales en barras horizontales */}
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">{metric.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">
                  {metric.label === 'Frecuencia'
                    ? formatNumber(data.frequency, 1) + '/sem'
                    : metric.label === 'Fuerza'
                      ? (data.strength > 0 ? '+' : '') + formatNumber(data.strength, 0) + '%'
                      : formatNumber(metric.value, 0) + metric.unit
                  }
                </span>
                {metric.label === 'Volumen' && (
                  <span className="text-gray-500 text-xs">
                    (ideal: {formatNumber(metric.ideal, 0)}%)
                  </span>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              {/* Indicador ideal */}
              {metric.label === 'Volumen' && (
                <div
                  className="absolute top-0 w-0.5 h-full bg-white/60 z-10"
                  style={{ left: `${(metric.ideal / metric.max) * 100}%` }}
                />
              )}

              {/* Barra de progreso actual */}
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${Math.min(100, (metric.value / metric.max) * 100)}%`,
                  backgroundColor: metric.color
                }}
              >
                {/* Brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Records y estado en una fila */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-400">PRs:</span>
          <span className="text-sm font-bold text-yellow-400">
            {formatNumber(data.records, 0)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {data.trend === '+' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 rounded-full">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+</span>
            </div>
          )}
          {data.trend === '-' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-900/30 rounded-full">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">-</span>
            </div>
          )}
          {data.trend === '=' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-800/50 rounded-full">
              <Timer className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">=</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { UpperLowerBalanceContent };
