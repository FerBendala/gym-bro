import type { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';
import { formatNumber } from '../../../utils/functions';

interface BalanceRadarChartProps {
  balanceScore: number;
  consistency: number;
  intensity: number;
  frequency: number;
  progress: number;
  balanceLevel: 'excellent' | 'good' | 'unbalanced' | 'critical';
}

// Gráfico de Balance Radar usando ApexCharts
export const BalanceRadarChart: React.FC<BalanceRadarChartProps> = ({
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