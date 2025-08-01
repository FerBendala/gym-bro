import type { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { formatNumberToString } from '@/utils';

interface BalanceRadarChartProps {
  balanceScore: number;
  consistency: number;
  intensity: number;
  frequency: number;
  progress: number;
  balanceLevel: 'excellent' | 'good' | 'unbalanced' | 'critical';
}

export const BalanceRadarChart: React.FC<BalanceRadarChartProps> = ({
  balanceScore,
  consistency,
  intensity,
  frequency,
  progress,
  balanceLevel,
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
      height: '100%',
      background: 'transparent',
      toolbar: { show: false },
      // Mejorar el responsive
      redrawOnWindowResize: true,
      redrawOnParentResize: true,
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
        'Balance',
        'Consistencia',
        'Intensidad',
        'Frecuencia',
        'Progreso',
      ],
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '11px',
          fontWeight: 500,
        },
        // Mejorar el responsive de las etiquetas
        maxHeight: 60,
        trim: false,
        hideOverlappingLabels: false,
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
          const categories = ['Balance', 'Consistencia', 'Intensidad', 'Frecuencia', 'Progreso'];
          const category = categories[opts.dataPointIndex];

          switch (category) {
            case 'Balance':
              return `${formatNumberToString(balanceScore, 1)}% equilibrado`;
            case 'Consistencia':
              return `${formatNumberToString(consistency, 1)}% regular`;
            case 'Intensidad':
              return `${formatNumberToString(intensity, 1)}% efectiva`;
            case 'Frecuencia':
              return `${formatNumberToString(frequency, 1)}% óptima`;
            case 'Progreso':
              return `${formatNumberToString(progress, 1)}% mejorando`;
            default:
              return `${formatNumberToString(val, 1)}%`;
          }
        },
      },
    },
    legend: {
      show: false,
    },
    // Mejorar el responsive
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            radar: {
              size: 120,
            },
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '10px',
              },
            },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          plotOptions: {
            radar: {
              size: 100,
            },
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '9px',
              },
            },
          },
        },
      },
    ],
  };

  const series = [{
    name: 'Análisis de Balance',
    data: [
      balanceScore,
      consistency,
      intensity,
      frequency,
      progress,
    ],
  }];

  return (
    <div className="w-full h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[350px]">
      <Chart options={options} series={series} type="radar" height="100%" />
    </div>
  );
};
