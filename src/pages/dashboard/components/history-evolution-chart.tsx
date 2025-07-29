import { History } from 'lucide-react';
import React from 'react';
import Chart from 'react-apexcharts';

import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import type { HistoryPoint } from '@/interfaces';
import { formatNumberToString } from '@/utils';

interface HistoryEvolutionChartProps {
  historyData: HistoryPoint[];
}

export const HistoryEvolutionChart: React.FC<HistoryEvolutionChartProps> = ({ historyData }) => {
  const chartData = React.useMemo(() => {
    const series = [{
      name: 'Volumen Semanal',
      data: historyData.map(point => ({
        x: `Semana ${point.weekNumber}`,
        y: point.value,
        details: point.details,
        date: point.date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      })),
    }];

    const options = {
      chart: {
        type: 'area' as const,
        height: 300,
        background: 'transparent',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      theme: {
        mode: 'dark' as const,
      },
      colors: ['#3b82f6'],
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#1d4ed8'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 100],
        },
      },
      grid: {
        borderColor: '#374151',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: historyData.map(point => `Semana ${point.weekNumber}`),
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '12px',
          },
        },
        axisBorder: {
          color: '#374151',
        },
        axisTicks: {
          color: '#374151',
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '12px',
          },
          formatter: (value: number) => `${formatNumberToString(value)} kg`,
        },
      },
      tooltip: {
        theme: 'dark',
        style: {
          fontSize: '12px',
        },
        custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
          const point = historyData[dataPointIndex];
          if (!point) return '';

          return `
            <div class="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
              <div class="font-semibold text-white mb-1">Semana ${point.weekNumber}</div>
              <div class="text-gray-300 text-sm mb-2">${point.date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}</div>
              <div class="space-y-1">
                <div class="text-blue-400 font-medium">${formatNumberToString(point.value)} kg</div>
                <div class="text-gray-400 text-xs">${point.totalWorkouts} entrenamientos</div>
                <div class="text-gray-400 text-xs">Peso máximo: ${formatNumberToString(point.maxWeight)} kg</div>
                <div class="text-gray-400 text-xs">${point.uniqueExercises} ejercicios únicos</div>
              </div>
            </div>
          `;
        },
      },
      markers: {
        size: 6,
        colors: ['#3b82f6'],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: {
          size: 8,
        },
      },
      dataLabels: {
        enabled: false,
      },
    };

    return { series, options };
  }, [historyData]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <History className="w-5 h-5 mr-2" />
          Evolución Temporal del Volumen
          <InfoTooltip
            content="Gráfico interactivo que muestra la evolución semanal del volumen de entrenamiento con tooltips detallados."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="area"
            height="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
};
