import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { formatNumberToString } from '@/utils';
import { clamp } from '@/utils/functions/math-utils';

export interface TrendAnalysisChartProps {
  strengthTrend: number;
  volumeTrend: number;
  monthlyGrowthRate: number;
  plateauRisk: number;
  confidenceLevel: number;
  trendAnalysis: string;
}

export const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({
  strengthTrend,
  volumeTrend,
  monthlyGrowthRate,
  plateauRisk,
  confidenceLevel,
  trendAnalysis,
}) => {
  // Normalizar tendencias para el gráfico (0-100)
  const normalizeStrengthTrend = clamp((strengthTrend + 2) * 25, 0, 100); // -2 a +2 -> 0-100
  const normalizeVolumeTrend = clamp((volumeTrend + 50) * 1, 0, 100); // -50 a +50 -> 0-100
  const normalizeGrowthRate = Math.min(100, monthlyGrowthRate * 10); // 0-10kg -> 0-100
  const normalizeConfidence = confidenceLevel; // ya está 0-100
  const normalizePlateauRisk = 100 - plateauRisk; // invertir para que mayor = mejor

  const getRadarColor = (): string => {
    if (trendAnalysis === 'mejorando') return '#10b981'; // green
    if (trendAnalysis === 'empeorando') return '#ef4444'; // red
    if (trendAnalysis === 'estable') return '#3b82f6'; // blue
    return '#6b7280'; // gray
  };

  const options: ApexOptions = {
    chart: {
      type: 'radar',
      height: 350,
      background: 'transparent',
      toolbar: { show: false },
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#374151',
          fill: {
            colors: ['transparent'],
          },
        },
      },
    },
    colors: [getRadarColor()],
    fill: {
      opacity: 0.3,
      colors: [getRadarColor()],
    },
    stroke: {
      width: 3,
      colors: [getRadarColor()],
    },
    markers: {
      size: 6,
      colors: ['#ffffff'],
      strokeColors: getRadarColor(),
      strokeWidth: 2,
    },
    xaxis: {
      categories: [
        'Tendencia Fuerza',
        'Tendencia Volumen',
        'Crecimiento Mensual',
        'Confianza IA',
        'Estabilidad',
      ],
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100,
    },
    theme: {
      mode: 'dark',
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number, opts) => {
          const categories = ['Tendencia Fuerza', 'Tendencia Volumen', 'Crecimiento Mensual', 'Confianza IA', 'Estabilidad'];
          const category = categories[opts.dataPointIndex];

          switch (category) {
            case 'Tendencia Fuerza':
              return `${formatNumberToString(strengthTrend, 2)}kg/semana`;
            case 'Tendencia Volumen':
              return `${formatNumberToString(volumeTrend, 1)}kg/semana`;
            case 'Crecimiento Mensual':
              return `${formatNumberToString(monthlyGrowthRate, 1)}kg/mes`;
            case 'Confianza IA':
              return `${confidenceLevel}%`;
            case 'Estabilidad':
              return `${(100 - plateauRisk)}% estable`;
            default:
              return `${val}%`;
          }
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [{
    name: 'Análisis de Tendencia',
    data: [
      normalizeStrengthTrend,
      normalizeVolumeTrend,
      normalizeGrowthRate,
      normalizeConfidence,
      normalizePlateauRisk,
    ],
  }];

  return (
    <div className="w-full h-96">
      <Chart options={options} series={series} type="radar" height="100%" />
    </div>
  );
};
