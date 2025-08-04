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
        </div>
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 400,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    stroke: {
      width: [0, 3, 3],
      curve: 'smooth',
    },
    fill: {
      type: ['gradient', 'gradient', 'gradient'],
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#1d4ed8', '#059669', '#d97706'],
        opacityFrom: 1,
        opacityTo: 0.4,
        stops: [0, 50, 100],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '70%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: daysWithData.map(day => day.dayName),
      labels: {
        style: { colors: '#9ca3af', fontSize: '12px' },
      },
      axisBorder: { show: true, color: '#374151' },
      axisTicks: { show: true, color: '#374151' },
    },
    yaxis: [
      {
        title: { text: 'Volumen (kg)', style: { color: '#9ca3af', fontSize: '12px' } },
        labels: {
          style: { colors: '#9ca3af', fontSize: '11px' },
          formatter: (value: number) => formatNumberToString(value, 0),
        },
        axisBorder: { show: true, color: '#374151' },
      },
      {
        opposite: true,
        title: { text: 'Entrenamientos', style: { color: '#9ca3af', fontSize: '12px' } },
        labels: {
          style: { colors: '#9ca3af', fontSize: '11px' },
          formatter: (value: number) => formatNumberToString(value, 0),
        },
        axisBorder: { show: true, color: '#374151' },
      },
      {
        opposite: true,
        title: { text: 'Peso Máx (kg)', style: { color: '#9ca3af', fontSize: '12px' } },
        labels: {
          style: { colors: '#9ca3af', fontSize: '11px' },
          formatter: (value: number) => formatNumberToString(value, 0),
        },
        axisBorder: { show: true, color: '#374151' },
      },
    ],
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: [
        {
          title: { formatter: () => 'Volumen Total' },
          formatter: (value: number) => `${formatNumberToString(value, 0)} kg`,
        },
        {
          title: { formatter: () => 'Entrenamientos' },
          formatter: (value: number) => `${formatNumberToString(value, 0)} sesiones`,
        },
        {
          title: { formatter: () => 'Peso Máximo' },
          formatter: (value: number) => `${formatNumberToString(value, 0)} kg`,
        },
      ],
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      labels: { colors: '#9ca3af' },
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    theme: { mode: 'dark' },
  };

  const series = [
    {
      name: 'Volumen Total',
      type: 'column',
      data: daysWithData.map(day => day.totalVolume),
    },
    {
      name: 'Entrenamientos',
      type: 'line',
      data: daysWithData.map(day => day.workouts),
    },
    {
      name: 'Peso Máximo',
      type: 'line',
      data: daysWithData.map(day => day.maxWeight),
    },
  ];

  return (
    <div className="w-full">
      <Chart options={options} series={series} type="line" height={400} />
    </div>
  );
};
