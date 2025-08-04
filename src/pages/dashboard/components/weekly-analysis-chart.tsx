import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { formatNumberToString } from '@/utils';
import type { DayMetrics } from '@/utils/functions/trends-interfaces';

interface WeeklyAnalysisChartProps {
  dailyTrends: DayMetrics[];
}

export const WeeklyAnalysisChart: React.FC<WeeklyAnalysisChartProps> = ({
  dailyTrends,
}) => {
  if (dailyTrends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">📊</div>
          <p className="text-gray-400 text-sm">Sin datos para mostrar</p>
        </div>
      </div>
    );
  }

  // Filtrar solo días que tengan entrenamientos
  const daysWithData = dailyTrends.filter(day => day.workouts > 0);

  if (daysWithData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">📊</div>
          <p className="text-gray-400 text-sm">No hay días con entrenamientos registrados</p>
          <p className="text-gray-500 text-xs mt-1">Registra algunos entrenamientos para ver el análisis</p>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico (solo días con datos)
  const categories = daysWithData.map(day => day.dayName);

  // Serie 1: Volumen total (barras)
  const volumeData = daysWithData.map(day => day.totalVolume);

  // Serie 2: Número de entrenamientos (línea)
  const workoutsData = daysWithData.map(day => day.workouts);

  // Serie 3: Peso máximo (línea)
  const maxWeightData = daysWithData.map(day => day.maxWeight);

  // Serie 4: Score de rendimiento (línea)
  const performanceData = daysWithData.map(day => day.performanceScore);

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 400,
      background: 'transparent',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    stroke: {
      width: [0, 3, 3, 3], // Barras sin stroke, líneas con stroke
      curve: 'smooth',
      dashArray: [0, 0, 5, 0], // Línea punteada para peso máximo
    },
    fill: {
      type: ['solid', 'gradient', 'gradient', 'gradient'],
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.1,
        gradientToColors: ['#1d4ed8', '#059669', '#d97706', '#dc2626'],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: true,
        color: '#374151',
      },
      axisTicks: {
        show: true,
        color: '#374151',
      },
    },
    yaxis: [
      {
        title: {
          text: 'Volumen (kg)',
          style: {
            color: '#9ca3af',
            fontSize: '12px',
          },
        },
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '11px',
          },
          formatter: (value: number) => formatNumberToString(value, 0),
        },
        axisBorder: {
          show: true,
          color: '#374151',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Entrenamientos',
          style: {
            color: '#9ca3af',
            fontSize: '12px',
          },
        },
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '11px',
          },
          formatter: (value: number) => formatNumberToString(value, 0),
        },
        axisBorder: {
          show: true,
          color: '#374151',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Peso Máx (kg)',
          style: {
            color: '#9ca3af',
            fontSize: '12px',
          },
        },
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '11px',
          },
          formatter: (value: number) => formatNumberToString(value, 0),
        },
        axisBorder: {
          show: true,
          color: '#374151',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Rendimiento (%)',
          style: {
            color: '#9ca3af',
            fontSize: '12px',
          },
        },
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '11px',
          },
          formatter: (value: number) => `${formatNumberToString(value, 0)}%`,
        },
        axisBorder: {
          show: true,
          color: '#374151',
        },
      },
    ],
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      x: {
        show: true,
        format: 'dddd',
      },
      y: [
        {
          title: {
            formatter: () => 'Volumen Total',
          },
          formatter: (value: number) => `${formatNumberToString(value, 0)} kg`,
        },
        {
          title: {
            formatter: () => 'Entrenamientos',
          },
          formatter: (value: number) => `${formatNumberToString(value, 0)} sesiones`,
        },
        {
          title: {
            formatter: () => 'Peso Máximo',
          },
          formatter: (value: number) => `${formatNumberToString(value, 0)} kg`,
        },
        {
          title: {
            formatter: () => 'Rendimiento',
          },
          formatter: (value: number) => `${formatNumberToString(value, 1)}%`,
        },
      ],
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      labels: {
        colors: '#9ca3af',
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
    theme: {
      mode: 'dark',
    },
  };

  const series = [
    {
      name: 'Volumen Total',
      type: 'column',
      data: volumeData,
    },
    {
      name: 'Entrenamientos',
      type: 'line',
      data: workoutsData,
    },
    {
      name: 'Peso Máximo',
      type: 'line',
      data: maxWeightData,
    },
    {
      name: 'Rendimiento',
      type: 'line',
      data: performanceData,
    },
  ];

  return (
    <div className="w-full">
      <Chart
        options={options}
        series={series}
        type="line"
        height={400}
      />
    </div>
  );
}; 