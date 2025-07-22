import type { ApexOptions } from 'apexcharts';
import {
  Activity,
  AlertTriangle,
  BarChart,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  Footprints,
  PieChart,
  Scale,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { getAllAssignments } from '../../../api/database';
import { useNotification } from '../../../context/notification-context';
import { ExerciseAssignment, WorkoutRecord } from '../../../interfaces';
import { formatNumber } from '../../../utils/functions';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '../../../utils/functions/category-analysis';
import { calculateTrendsAnalysis } from '../../../utils/functions/trends-analysis';
import { Card, CardContent, CardHeader } from '../../card';
import { InfoTooltip } from '../../tooltip';

interface BalanceTabProps {
  records: WorkoutRecord[];
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

// Constantes para meta-categorías
const META_CATEGORIES = {
  UPPER_BODY: {
    id: 'upper_body',
    name: 'Tren Superior',
    categories: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    idealPercentage: 60, // Corregido: era 65%
    color: '#3B82F6'
  },
  LOWER_BODY: {
    id: 'lower_body',
    name: 'Tren Inferior',
    categories: ['Piernas', 'Glúteos'],
    idealPercentage: 35, // Mantenido
    color: '#10B981'
  },
  CORE: {
    id: 'core',
    name: 'Core',
    categories: ['Core'],
    idealPercentage: 5, // Mantenido
    color: '#8B5CF6'
  }
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
    case 'Pecho': return Activity;
    case 'Espalda': return BarChart;
    case 'Piernas': return Footprints;
    case 'Hombros': return Scale;
    case 'Brazos': return Dumbbell;
    case 'Core': return Activity;
    default: return BarChart;
  }
};

// Íconos para días de la semana (para el subtab de tendencias)
const dayIcons: Record<string, React.FC<any>> = {
  'Lunes': Target,
  'Martes': Activity,
  'Miércoles': Zap,
  'Jueves': BarChart,
  'Viernes': Trophy,
  'Sábado': Calendar,
  'Domingo': Clock
};

// Colores para días de la semana (para el subtab de tendencias)
const dayColors: Record<string, string> = {
  'Lunes': 'from-blue-500/80 to-cyan-500/80',
  'Martes': 'from-green-500/80 to-emerald-500/80',
  'Miércoles': 'from-purple-500/80 to-violet-500/80',
  'Jueves': 'from-orange-500/80 to-amber-500/80',
  'Viernes': 'from-red-500/80 to-pink-500/80',
  'Sábado': 'from-indigo-500/80 to-blue-500/80',
  'Domingo': 'from-teal-500/80 to-green-500/80'
};

// Función para calcular balance entre tren superior e inferior
const calculateUpperLowerBalance = (categoryMetrics: Array<{ category: string; percentage: number; totalVolume: number }>) => {
  const upperBodyCategories = ['Pecho', 'Espalda', 'Hombros', 'Brazos'];
  const lowerBodyCategories = ['Piernas'];
  const coreCategories = ['Core'];

  const upperBody = {
    percentage: categoryMetrics
      .filter(m => upperBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => upperBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: upperBodyCategories
  };

  const lowerBody = {
    percentage: categoryMetrics
      .filter(m => lowerBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => lowerBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: lowerBodyCategories
  };

  const core = {
    percentage: categoryMetrics
      .filter(m => coreCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => coreCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: coreCategories
  };

  // CORRECCIÓN: Calcular balance basado en desviación de porcentajes individuales vs ideales
  const upperBodyDeviation = Math.abs(upperBody.percentage - META_CATEGORIES.UPPER_BODY.idealPercentage);
  const lowerBodyDeviation = Math.abs(lowerBody.percentage - META_CATEGORIES.LOWER_BODY.idealPercentage);
  const coreDeviation = Math.abs(core.percentage - META_CATEGORIES.CORE.idealPercentage);

  // Considerar balanceado si ninguna categoría se desvía más de 5% del ideal (más estricto)
  const maxAcceptableDeviation = 5; // Cambiado de 10% a 5% para ser más estricto
  const isBalanced = upperBodyDeviation <= maxAcceptableDeviation &&
    lowerBodyDeviation <= maxAcceptableDeviation &&
    coreDeviation <= maxAcceptableDeviation;

  // Generar recomendación basada en las mayores desviaciones
  let recommendation = 'El balance entre tren superior e inferior es adecuado';

  if (!isBalanced) {
    const deviations = [
      { category: 'Tren Superior', deviation: upperBodyDeviation, current: upperBody.percentage, ideal: META_CATEGORIES.UPPER_BODY.idealPercentage },
      { category: 'Tren Inferior', deviation: lowerBodyDeviation, current: lowerBody.percentage, ideal: META_CATEGORIES.LOWER_BODY.idealPercentage },
      { category: 'Core', deviation: coreDeviation, current: core.percentage, ideal: META_CATEGORIES.CORE.idealPercentage }
    ];

    // Ordenar por desviación descendente
    deviations.sort((a, b) => b.deviation - a.deviation);

    const worstDeviation = deviations[0];
    if (worstDeviation.current > worstDeviation.ideal) {
      recommendation = `Considera reducir el entrenamiento de ${worstDeviation.category} (${worstDeviation.current.toFixed(1)}% vs ${worstDeviation.ideal}% ideal)`;
    } else {
      recommendation = `Considera aumentar el entrenamiento de ${worstDeviation.category} (${worstDeviation.current.toFixed(1)}% vs ${worstDeviation.ideal}% ideal)`;
    }
  }

  // DEBUG: Log para verificar la lógica corregida
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 DEBUG - Balance Tren Superior vs Inferior (CORREGIDO - UMBRAL 5%):', {
      upperBody: {
        percentage: upperBody.percentage,
        ideal: META_CATEGORIES.UPPER_BODY.idealPercentage,
        deviation: upperBodyDeviation,
        isWithinRange: upperBodyDeviation <= maxAcceptableDeviation,
        status: upperBodyDeviation <= maxAcceptableDeviation ? 'Equilibrado' : 'Desequilibrado'
      },
      lowerBody: {
        percentage: lowerBody.percentage,
        ideal: META_CATEGORIES.LOWER_BODY.idealPercentage,
        deviation: lowerBodyDeviation,
        isWithinRange: lowerBodyDeviation <= maxAcceptableDeviation,
        status: lowerBodyDeviation <= maxAcceptableDeviation ? 'Equilibrado' : 'Desequilibrado'
      },
      core: {
        percentage: core.percentage,
        ideal: META_CATEGORIES.CORE.idealPercentage,
        deviation: coreDeviation,
        isWithinRange: coreDeviation <= maxAcceptableDeviation,
        status: coreDeviation <= maxAcceptableDeviation ? 'Equilibrado' : 'Desequilibrado'
      },
      maxAcceptableDeviation,
      isBalanced,
      totalPercentage: upperBody.percentage + lowerBody.percentage + core.percentage
    });
  }

  return {
    upperBody,
    lowerBody,
    core,
    isBalanced,
    recommendation
  };
};

// Componente de gráfico de dona para distribución de volumen
interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  centerText: string;
  centerSubtext: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, centerText, centerSubtext }) => {
  const radius = 80;
  const strokeWidth = 16;
  const centerX = 100;
  const centerY = 100;

  let cumulativePercentage = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Chart container con altura fija */}
      <div className="relative w-48 h-48 mx-auto mb-4">
        <svg width="200" height="200" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            const pathData = createPath(startAngle, endAngle);

            cumulativePercentage += percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300 hover:brightness-110"
              />
            );
          })}
        </svg>

        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-white">{centerText}</div>
          <div className="text-xs text-gray-400">{centerSubtext}</div>
        </div>
      </div>

      {/* Leyenda con scroll si es necesario */}
      <div className="max-h-32 overflow-y-auto space-y-1 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm py-1">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300 truncate text-xs">{item.name}</span>
            </div>
            <span className="text-white font-medium ml-2 flex-shrink-0 text-xs">
              {formatSafePercentage(item.percentage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de gráfico gauge mejorado para scores
interface GaugeChartProps {
  value: number;
  max: number;
  title: string;
  color: string;
  size?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, max, title, color, size = 120 }) => {
  const safeValue = Math.max(0, Math.min(max, safeNumber(value, 0)));
  const radius = size / 2 - 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (safeValue / max) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Fondo del círculo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />
          {/* Progreso del círculo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-white">{formatNumber(safeValue, 0)}</div>
          <div className="text-xs text-gray-400">de {formatNumber(max, 0)}</div>
        </div>
      </div>

      {title && <div className="text-sm text-gray-300 mt-2 text-center">{title}</div>}
    </div>
  );
};

// Componente mejorado de Score de Balance con más información
interface BalanceScoreChartProps {
  score: number;
  muscleBalance: any[];
}

const BalanceScoreChart: React.FC<BalanceScoreChartProps> = ({ score, muscleBalance }) => {
  const safeScore = Math.max(0, Math.min(100, safeNumber(score, 0)));
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Calcular estado y colores
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 60) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Crítico';
  };

  const balancedCount = muscleBalance.filter(b => b.isBalanced).length;
  const criticalCount = muscleBalance.filter(b => b.priorityLevel === 'critical').length;
  const totalCategories = muscleBalance.length;

  return (
    <div className="text-center space-y-4">
      {/* Gráfico principal mejorado */}
      <div className="relative w-36 h-36 mx-auto">
        <svg width="144" height="144" className="transform -rotate-90">
          {/* Fondo del círculo */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="12"
          />
          {/* Gradiente para el progreso */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getScoreColor(safeScore)} />
              <stop offset="100%" stopColor={getScoreColor(safeScore)} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* Progreso del círculo con gradiente */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1500 ease-out"
            style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }}
          />
        </svg>

        {/* Texto central mejorado */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">{formatNumber(safeScore, 0)}</div>
          <div className="text-xs text-gray-400">de 100</div>
          <div className="text-xs font-medium mt-1" style={{ color: getScoreColor(safeScore) }}>
            {getScoreLabel(safeScore)}
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-sm font-bold text-green-400">{balancedCount}</div>
          <div className="text-xs text-gray-400">Equilibrados</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-sm font-bold text-red-400">{criticalCount}</div>
          <div className="text-xs text-gray-400">Críticos</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-sm font-bold text-blue-400">{totalCategories}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>

      {/* Recomendación contextual */}
      <div className="text-xs text-gray-400 px-2">
        {safeScore >= 80 && "¡Excelente balance! Mantén la consistencia."}
        {safeScore >= 60 && safeScore < 80 && "Buen balance general. Ajusta grupos críticos."}
        {safeScore >= 40 && safeScore < 60 && "Balance moderado. Revisa distribución."}
        {safeScore < 40 && "Balance crítico. Necesita reajuste urgente."}
      </div>
    </div>
  );
};

// Componente de gráfico de barras horizontales para distribución de volumen
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
              <span className="text-sm text-white">{formatSafePercentage(item.value)}</span>
              <span className="text-xs text-gray-400">({formatSafePercentage(item.ideal, 0)} ideal)</span>
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

// Componente de gráfico de radar para métricas múltiples
interface RadarChartProps {
  data: Array<{
    category: string;
    value: number;
    max: number;
  }>;
  size?: number;
}

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
          {data.trend === 'improving' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 rounded-full">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+</span>
            </div>
          )}
          {data.trend === 'declining' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-900/30 rounded-full">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">-</span>
            </div>
          )}
          {data.trend === 'stable' && (
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






interface BalanceRadarChartProps {
  balanceScore: number;
  consistency: number;
  intensity: number;
  frequency: number;
  progress: number;
  balanceLevel: 'excellent' | 'good' | 'unbalanced' | 'critical';
}

// Gráfico de Balance Radar usando ApexCharts
const BalanceRadarChart: React.FC<BalanceRadarChartProps> = ({
  balanceScore,
  consistency,
  intensity,
  frequency,
  progress,
  balanceLevel
}) => {
  const getRadarColor = (): string => {
    if (balanceLevel === 'excellent') return '#10b981'; // green
    if (balanceLevel === 'good') return '#3b82f6'; // blue
    if (balanceLevel === 'unbalanced') return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const options: ApexOptions = {
    chart: {
      type: 'radar',
      height: 350,
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#374151',
          fill: {
            colors: ['transparent']
          }
        }
      }
    },
    colors: [getRadarColor()],
    fill: {
      opacity: 0.3,
      colors: [getRadarColor()]
    },
    stroke: {
      width: 3,
      colors: [getRadarColor()]
    },
    markers: {
      size: 6,
      colors: ['#ffffff'],
      strokeColors: getRadarColor(),
      strokeWidth: 2
    },
    xaxis: {
      categories: [
        'Balance',
        'Consistencia',
        'Intensidad',
        'Frecuencia',
        'Progreso'
      ],
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    theme: {
      mode: 'dark'
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number, opts) => {
          const categories = ['Balance', 'Consistencia', 'Intensidad', 'Frecuencia', 'Progreso'];
          const category = categories[opts.dataPointIndex];

          switch (category) {
            case 'Balance':
              return `${formatNumber(balanceScore, 1)}% equilibrado`;
            case 'Consistencia':
              return `${formatNumber(consistency, 1)}% regular`;
            case 'Intensidad':
              return `${formatNumber(intensity, 1)}% efectiva`;
            case 'Frecuencia':
              return `${formatNumber(frequency, 1)}% óptima`;
            case 'Progreso':
              return `${formatNumber(progress, 1)}% mejorando`;
            default:
              return `${formatNumber(val, 1)}%`;
          }
        }
      }
    },
    legend: {
      show: false
    }
  };

  const series = [{
    name: 'Análisis de Balance',
    data: [
      balanceScore,
      consistency,
      intensity,
      frequency,
      progress
    ]
  }];

  return (
    <div className="w-full h-96">
      <Chart options={options} series={series} type="radar" height="100%" />
    </div>
  );
};



interface GeneralContentProps {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  muscleBalance: any[];
}

const GeneralContent: React.FC<GeneralContentProps> = ({
  balanceScore,
  finalConsistency,
  avgIntensity,
  avgFrequency,
  muscleBalance
}) => (
  <div className="space-y-6">
    {/* Score de Balance General - Diseño Mejorado */}
    <Card className="p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <CardHeader className="pb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mr-4">
            <BarChart className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
          </div>
          <span className="truncate">Análisis General de Balance</span>
          <InfoTooltip
            content="Análisis general del balance muscular y rendimiento de entrenamiento"
            position="top"
            className="ml-3 flex-shrink-0"
          />
        </h3>
      </CardHeader>
      <CardContent>
        {/* Score Principal con Diseño Mejorado */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
          {/* Score Visual con Gradiente */}
          <div className="flex items-center space-x-6 mb-6 lg:mb-0">
            <div className="relative">
              {/* Círculo de progreso */}
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 border-gray-700 flex items-center justify-center relative overflow-hidden">
                {/* Gradiente de fondo según el score */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${balanceScore >= 70 ? '#10b981' : balanceScore >= 50 ? '#3b82f6' : balanceScore >= 30 ? '#f59e0b' : '#ef4444'} 0deg, ${balanceScore * 3.6}deg, #374151 ${balanceScore * 3.6}deg, 360deg)`
                  }}
                />
                {/* Contenido del círculo */}
                <div className="relative z-10 text-center">
                  <div className={`text-2xl lg:text-3xl font-bold ${balanceScore >= 70 ? 'text-green-400' :
                    balanceScore >= 50 ? 'text-blue-400' :
                      balanceScore >= 30 ? 'text-yellow-400' :
                        'text-red-400'}`}>
                    {formatNumber(balanceScore, 1)}%
                  </div>
                  <div className="text-xs text-gray-400">score</div>
                </div>
              </div>

              {/* Icono flotante */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <div className="text-lg">
                  {balanceScore >= 70 ? '🎯' :
                    balanceScore >= 50 ? '📈' :
                      balanceScore >= 30 ? '⚠️' :
                        '❌'}
                </div>
              </div>
            </div>

            {/* Información del estado */}
            <div className="text-center lg:text-left">
              <div className={`text-lg lg:text-xl font-bold mb-2 ${balanceScore >= 70 ? 'text-green-400' :
                balanceScore >= 50 ? 'text-blue-400' :
                  balanceScore >= 30 ? 'text-yellow-400' :
                    'text-red-400'}`}>
                {balanceScore >= 70 ? 'EXCELENTE' :
                  balanceScore >= 50 ? 'BUENO' :
                    balanceScore >= 30 ? 'DESEQUILIBRADO' :
                      'CRÍTICO'}
              </div>
              <div className="text-sm text-gray-400 max-w-xs">
                {balanceScore >= 70 ? 'Tu balance muscular es óptimo. Mantén esta consistencia.' :
                  balanceScore >= 50 ? 'Buen progreso. Enfócate en los grupos desequilibrados.' :
                    balanceScore >= 30 ? 'Necesitas reequilibrar tu entrenamiento.' :
                      'Requiere atención inmediata. Revisa tu rutina.'}
              </div>
            </div>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="text-lg font-bold text-blue-400">{formatNumber(finalConsistency, 1)}%</div>
              <div className="text-xs text-gray-400">Consistencia</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="text-lg font-bold text-purple-400">{formatNumber(avgIntensity, 1)}%</div>
              <div className="text-xs text-gray-400">Intensidad</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="text-lg font-bold text-green-400">{formatNumber(avgFrequency, 1)}/sem</div>
              <div className="text-xs text-gray-400">Frecuencia</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="text-lg font-bold text-orange-400">{muscleBalance.filter(b => b.isBalanced).length}/{muscleBalance.length}</div>
              <div className="text-xs text-gray-400">Equilibrados</div>
            </div>
          </div>
        </div>

        {/* Gráfico Radar Mejorado */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl"></div>
          <div className="relative z-10">
            <BalanceRadarChart
              balanceScore={balanceScore}
              consistency={finalConsistency}
              intensity={avgIntensity}
              frequency={avgFrequency}
              progress={balanceScore}
              balanceLevel={balanceScore >= 70 ? 'excellent' : balanceScore >= 50 ? 'good' : balanceScore >= 30 ? 'unbalanced' : 'critical'}
            />
          </div>
        </div>


      </CardContent>
    </Card>
  </div>
);

// Componente para el análisis de tren superior vs inferior

// Componente para el análisis de tren superior vs inferior con charts
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
        isBalanced: Math.abs(upperLowerBalance.upperBody.percentage - META_CATEGORIES.UPPER_BODY.idealPercentage) <= 5 // Más estricto: 5% en lugar de 10%
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
        isBalanced: Math.abs(upperLowerBalance.lowerBody.percentage - META_CATEGORIES.LOWER_BODY.idealPercentage) <= 5 // Más estricto: 5% en lugar de 10%
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
      isBalanced: Math.abs(upperLowerBalance.core.percentage - META_CATEGORIES.CORE.idealPercentage) <= 5 // Más estricto: 5% en lugar de 10%
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

          // Debug logs
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 DEBUG - ${meta.category} tendencias:`, {
              category: meta.category,
              categories: meta.categories,
              muscleBalanceData: muscleBalanceData.map((b: any) => ({ category: b.category, trend: b.balanceHistory?.trend })),
              improvingCount,
              stableCount,
              decliningCount,
              totalCategories: muscleBalanceData.length
            });
          }

          // Debug específico para pecho, espalda y piernas
          const pechoBalance = muscleBalance.find((b: any) => b.category === 'Pecho');
          const espaldaBalance = muscleBalance.find((b: any) => b.category === 'Espalda');
          const piernasBalance = muscleBalance.find((b: any) => b.category === 'Piernas');

          if (pechoBalance) {
            console.log('🔍 DEBUG - PECHO BALANCE:', {
              category: pechoBalance.category,
              progressTrend: pechoBalance.progressTrend,
              balanceHistoryTrend: pechoBalance.balanceHistory?.trend,
              volume: pechoBalance.volume,
              percentage: pechoBalance.percentage
            });
          }

          if (espaldaBalance) {
            console.log('🔍 DEBUG - ESPALDA BALANCE:', {
              category: espaldaBalance.category,
              progressTrend: espaldaBalance.progressTrend,
              balanceHistoryTrend: espaldaBalance.balanceHistory?.trend,
              volume: espaldaBalance.volume,
              percentage: espaldaBalance.percentage
            });
          }

          if (piernasBalance) {
            console.log('🔍 DEBUG - PIERNAS BALANCE:', {
              category: piernasBalance.category,
              progressTrend: piernasBalance.progressTrend,
              balanceHistoryTrend: piernasBalance.balanceHistory?.trend,
              volume: piernasBalance.volume,
              percentage: piernasBalance.percentage
            });
          }

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
                        {formatNumber(meta.volume, 0)} kg total • {formatSafePercentage(meta.percentage)} del volumen
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
                            {catData ? formatSafePercentage(catData.percentage) : '0%'}
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

interface BalanceByGroupContentProps {
  muscleBalance: any[];
  categoryAnalysis: any;
  onItemClick: (itemName: string) => void;
}

const BalanceByGroupContent: React.FC<BalanceByGroupContentProps> = ({
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
          <InfoTooltip
            content="Comparación visual del volumen actual vs ideal para cada grupo muscular"
            position="top"
            className="ml-2 flex-shrink-0"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <HorizontalBarChart
          data={muscleBalance
            .filter(balance => balance.volume > 0)
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
        .filter(balance => balance.volume > 0 || balance.priorityLevel === 'critical')
        .map((balance) => {
          const Icon = getCategoryIcon(balance.category);
          const colorGradient = getCategoryColor(balance.category);
          const categoryMetric = categoryAnalysis.categoryMetrics.find((m: any) => m.category === balance.category);

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
                    {balance.balanceHistory?.trend === 'improving' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-xs lg:text-sm text-green-400">Mejorando</span>
                      </>
                    )}
                    {balance.balanceHistory?.trend === 'declining' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs lg:text-sm text-red-400">Declinando</span>
                      </>
                    )}
                    {balance.balanceHistory?.trend === 'stable' && (
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
                      <span className="text-gray-400">{balance.priorityLevel}</span>
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

interface TrendsContentProps {
  records: WorkoutRecord[];
}

const TrendsContent: React.FC<TrendsContentProps> = ({ records }) => {
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

  return (
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
            {analysis.dayMetricsOrdered.map((day) => {
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
                    <div className="text-right ml-2 sm:ml-4">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {day.workouts}
                      </div>
                      <div className="text-xs text-gray-400">
                        entrenamientos
                      </div>
                      <div className="mt-1 sm:mt-2 flex justify-end">
                        {day.workouts > 0 ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>

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
};

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const { showNotification } = useNotification();
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'balanceByGroup' | 'upperLower' | 'trends'>('general');

  // Función para hacer smooth scroll a una card específica
  const scrollToCard = (cardId: string) => {
    const element = document.getElementById(cardId);
    if (element) {
      // Calcular la posición con offset para que se vea el título
      const elementPosition = element.offsetTop;
      const offset = 100; // Offset de 100px hacia arriba para ver el título

      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  // Función para manejar clicks en items del gráfico de balance por categoría
  const handleBalanceItemClick = (itemName: string) => {
    const cardId = `balance-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    scrollToCard(cardId);
  };

  // Función para manejar clicks en items del gráfico de tren superior vs inferior
  const handleUpperLowerItemClick = (itemName: string) => {
    const cardId = `upper-lower-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    scrollToCard(cardId);
  };

  // Cargar asignaciones al montar el componente
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setIsLoading(true);
        const assignments = await getAllAssignments();
        setAssignments(assignments);
      } catch (error) {
        console.error('Error cargando asignaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, []);

  // Calcular métricas y análisis con asignaciones
  const categoryMetrics = useMemo(() => {
    if (isLoading) return { categoryMetrics: [], muscleBalance: [], dominantCategory: null, leastTrainedCategory: null, balanceScore: 0 };
    return calculateCategoryAnalysis(records, assignments);
  }, [records, assignments, isLoading]);

  const muscleBalance = useMemo(() => {
    if (isLoading) return [];
    return analyzeMuscleBalance(records, assignments);
  }, [records, assignments, isLoading]);

  // NUEVO: Calcular métricas recientes (últimas 8 semanas)
  const recentMuscleBalance = useMemo(() => {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const recentRecords = records.filter(r => new Date(r.date) >= eightWeeksAgo);

    return recentRecords.length > 0 ? analyzeMuscleBalance(recentRecords, assignments) : [];
  }, [records, assignments]);

  const balanceScore = useMemo(() => calculateBalanceScore(muscleBalance, records), [muscleBalance, records]);

  // Calcular consistencia corregida - usar frecuencia como base si balanceHistory no existe
  const calculateConsistency = () => {
    const calculations = muscleBalance.map(b => {
      let consistencyValue = 0;
      let source = 'none';

      if (b.balanceHistory?.consistency !== undefined && b.balanceHistory.consistency > 0) {
        consistencyValue = b.balanceHistory.consistency;
        source = 'balanceHistory';
      } else {
        const frequency = b.weeklyFrequency || 0;
        consistencyValue = Math.min(100, (frequency / 2.5) * 100);
        source = 'frequency';
      }

      return {
        category: b.category,
        value: consistencyValue,
        source,
        frequency: b.weeklyFrequency,
        originalConsistency: b.balanceHistory?.consistency
      };
    });

    const total = calculations.reduce((sum, calc) => sum + calc.value, 0);
    const average = total / muscleBalance.length;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEBUG - Cálculo Consistencia:', {
        calculations,
        total,
        average,
        sourcesUsed: calculations.map(c => `${c.category}: ${c.source}`)
      });
    }

    return average;
  };

  // NUEVO: Calcular consistencia basada en datos recientes
  const calculateRecentConsistency = () => {
    if (recentMuscleBalance.length === 0) return 0;

    const calculations = recentMuscleBalance.map(b => {
      // Para datos recientes, SIEMPRE calcular basado en frecuencia
      // Ignorar balanceHistory.consistency porque es del período completo
      const frequency = b.weeklyFrequency || 0;

      // Frecuencias óptimas por grupo muscular
      const optimalFrequencies: Record<string, number> = {
        'Piernas': 2.0,
        'Pecho': 2.5,
        'Espalda': 2.5,
        'Brazos': 3.0,
        'Hombros': 3.0,
        'Core': 3.5
      };

      const optimal = optimalFrequencies[b.category] || 2.5;

      // Calcular score de frecuencia (0-100)
      const frequencyScore = Math.min(100, (frequency / optimal) * 100);

      // Para consistencia reciente, dar más peso a la frecuencia (80%)
      // y menos a la regularidad (20%) ya que es un período corto
      const consistencyValue = frequencyScore * 0.8 + 20; // +20 base por mantener rutina

      return {
        category: b.category,
        value: Math.min(100, consistencyValue),
        frequency: frequency,
        optimal: optimal,
        frequencyScore: frequencyScore
      };
    });

    const total = calculations.reduce((sum, calc) => sum + calc.value, 0);
    const average = total / recentMuscleBalance.length;

    if (process.env.NODE_ENV === 'development') {
      console.log('🆕 DEBUG - Consistencia Reciente Recalculada:', {
        calculations,
        average
      });
    }

    return average;
  };

  const historicalConsistency = calculateConsistency();
  const recentConsistency = calculateRecentConsistency();

  // Debug adicional para comparar consistencias
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 DEBUG - Comparación de consistencias:', {
      historicalBalance: muscleBalance.map(b => ({
        category: b.category,
        consistency: b.balanceHistory?.consistency || 0,
        frequency: b.weeklyFrequency
      })),
      recentBalance: recentMuscleBalance.map(b => ({
        category: b.category,
        consistency: b.balanceHistory?.consistency || 0,
        frequency: b.weeklyFrequency
      })),
      historicalConsistency,
      recentConsistency,
      recentDataExists: recentMuscleBalance.length > 0
    });
  }

  // Usar promedio ponderado: 70% reciente + 30% histórico si hay datos recientes
  const finalConsistency = recentMuscleBalance.length > 0
    ? (recentConsistency * 0.7 + historicalConsistency * 0.3)
    : historicalConsistency;

  const radarData = [
    { category: 'Balance', value: safeNumber(balanceScore), max: 100 },
    {
      category: 'Consistencia',
      value: safeNumber(finalConsistency),
      max: 100
    },
    {
      category: 'Intensidad',
      value: safeNumber(muscleBalance.reduce((sum, b) => sum + (b.intensityScore || 0), 0) / muscleBalance.length),
      max: 100
    },
    {
      category: 'Frecuencia',
      value: Math.min(100, safeNumber(muscleBalance.reduce((sum, b) => sum + (b.weeklyFrequency || 0), 0) / muscleBalance.length) * 33.33),
      max: 100
    },
    {
      category: 'Progreso',
      value: Math.min(100, muscleBalance.filter(b => b.progressTrend === 'improving').length * 25),
      max: 100
    }
  ];

  // Calcular métricas promedio para explicaciones
  const avgIntensity = muscleBalance.reduce((sum, b) => sum + (b.intensityScore || 0), 0) / muscleBalance.length;
  const avgFrequency = Math.min(100, muscleBalance.reduce((sum, b) => sum + (b.weeklyFrequency || 0), 0) / muscleBalance.length * 33.33);

  // Debug final: mostrar valores calculados del radar (SOLO EN DESARROLLO)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 DEBUG - Radar Data Final:', {
      radarData: radarData.map(r => ({ [r.category]: r.value })),
      progressTrends: muscleBalance.map(b => ({ category: b.category, trend: b.progressTrend })),
      improvingCount: muscleBalance.filter(b => b.progressTrend === 'improving').length,
      avgFrequency,
      frequencyRadarValue: radarData.find(r => r.category === 'Frecuencia')?.value,
      weeklyFrequencies: muscleBalance.map(b => ({ category: b.category, weeklyFrequency: b.weeklyFrequency }))
    });
  }

  // Mostrar toast de balance cuando se cargan los datos
  useEffect(() => {
    if (!isLoading && assignments.length > 0 && categoryMetrics.categoryMetrics.length > 0) {
      const upperLowerBalance = calculateUpperLowerBalance(categoryMetrics.categoryMetrics);

      // Definir el contenido de la notificación aquí
      const message = upperLowerBalance.isBalanced
        ? 'Balance Equilibrado: ' + upperLowerBalance.recommendation
        : 'Desequilibrio Detectado: ' + upperLowerBalance.recommendation;

      const type = upperLowerBalance.isBalanced ? 'success' : 'warning';

      showNotification(message, type);
    }
  }, [isLoading, assignments, showNotification, categoryMetrics.categoryMetrics]);

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

  const subTabs = [
    {
      id: 'general' as const,
      name: 'General',
      icon: BarChart,
      description: 'Análisis general con Balance Radar'
    },
    {
      id: 'balanceByGroup' as const,
      name: 'Balance por Grupo',
      icon: PieChart,
      description: 'Análisis detallado por categorías'
    },
    {
      id: 'upperLower' as const,
      name: 'Tren Superior vs Inferior',
      icon: Scale,
      description: 'Balance entre tren superior e inferior'
    },
    {
      id: 'trends' as const,
      name: 'Tendencias',
      icon: Brain,
      description: 'Análisis de tendencias de entrenamiento'
    }
  ];

  // Debug: log para ver los valores reales (SOLO EN DESARROLLO)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DEBUG - Consistencia valores:', {
      muscleBalance: muscleBalance.length,
      consistencyValues: muscleBalance.map(b => ({
        category: b.category,
        volume: b.volume,
        percentage: b.percentage,
        isBalanced: b.isBalanced,
        priorityLevel: b.priorityLevel,
        progressTrend: b.progressTrend,
        weeklyFrequency: b.weeklyFrequency,
        intensityScore: b.intensityScore,
        balanceHistory: b.balanceHistory,
        hasConsistency: !!b.balanceHistory?.consistency,
        consistencyValue: b.balanceHistory?.consistency || 'undefined'
      })),
      balanceScore,
      avgConsistency: muscleBalance.reduce((sum, b) => sum + (b.balanceHistory?.consistency || 0), 0) / muscleBalance.length,
      detailedMuscleBalance: muscleBalance.map(b => ({
        category: b.category,
        volume: b.volume,
        percentage: b.percentage,
        isBalanced: b.isBalanced,
        priorityLevel: b.priorityLevel,
        progressTrend: b.progressTrend,
        weeklyFrequency: b.weeklyFrequency,
        intensityScore: b.intensityScore,
        balanceHistory: b.balanceHistory,
        hasConsistency: !!b.balanceHistory?.consistency,
        consistencyValue: b.balanceHistory?.consistency || 'undefined'
      }))
    });
  }

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
        <GeneralContent
          balanceScore={balanceScore}
          finalConsistency={finalConsistency}
          avgIntensity={avgIntensity}
          avgFrequency={avgFrequency}
          muscleBalance={muscleBalance}
        />
      )}

      {activeSubTab === 'balanceByGroup' && (
        <BalanceByGroupContent
          muscleBalance={muscleBalance}
          categoryAnalysis={categoryMetrics}
          onItemClick={handleBalanceItemClick}
        />
      )}

      {activeSubTab === 'upperLower' && (
        <UpperLowerBalanceContent
          upperLowerBalance={calculateUpperLowerBalance(categoryMetrics.categoryMetrics)}
          categoryAnalysis={categoryMetrics}
          muscleBalance={muscleBalance}
          onItemClick={handleUpperLowerItemClick}
        />
      )}

      {activeSubTab === 'trends' && (
        <TrendsContent records={records} />
      )}
    </div>
  );
}; 