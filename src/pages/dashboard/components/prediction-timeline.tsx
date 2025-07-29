import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { formatNumberToString } from '@/utils';
import { clamp } from '@/utils/functions/math-utils';

export interface PredictionTimelineProps {
  currentWeight: number;
  nextWeekWeight: number;
  predictedPR: number;
  monthlyGrowthRate: number;
  strengthTrend: number;
}

export const PredictionTimeline: React.FC<PredictionTimelineProps> = ({
  currentWeight,
  nextWeekWeight,
  predictedPR,
  strengthTrend,
}) => {
  const generateTimelineData = () => {
    const weeks = [];
    const currentDate = new Date();

    // Validar tendencia de fuerza
    const validStrengthTrend = clamp(strengthTrend, -2, 2);

    // Datos históricos (últimas 4 semanas) - con progresión realista
    for (let i = 4; i >= 1; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7));

      // Calcular peso histórico con límites realistas
      const historicalWeight = currentWeight - (validStrengthTrend * i);
      const minHistoricalWeight = currentWeight * 0.85; // Máximo 15% menos
      const maxHistoricalWeight = currentWeight * 1.05; // Máximo 5% más

      // Calcular posición Y normalizada
      const y = clamp(historicalWeight, minHistoricalWeight, maxHistoricalWeight);

      weeks.push({
        x: date.getTime(),
        y,
      });
    }

    // Dato actual
    weeks.push({
      x: currentDate.getTime(),
      y: currentWeight,
    });

    // Predicciones futuras
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    weeks.push({
      x: nextWeek.getTime(),
      y: nextWeekWeight,
    });

    // Predicción de PR (estimando en 4-8 semanas)
    const prDate = new Date(currentDate);
    prDate.setDate(prDate.getDate() + (6 * 7)); // 6 semanas
    weeks.push({
      x: prDate.getTime(),
      y: predictedPR,
    });

    return weeks;
  };

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    colors: ['#3b82f6', '#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['#1d4ed8', '#059669'],
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      size: 6,
      colors: ['#ffffff'],
      strokeColors: ['#3b82f6', '#10b981'],
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#9ca3af',
        },
        format: 'dd MMM',
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
        },
        formatter: (val: number) => `${formatNumberToString(val, 1)}kg`,
      },
      title: {
        text: 'Peso (kg)',
        style: {
          color: '#9ca3af',
        },
      },
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3,
    },
    theme: {
      mode: 'dark',
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${formatNumberToString(val, 1)}kg`,
      },
    },
    annotations: {
      xaxis: [{
        x: new Date().getTime(),
        borderColor: '#ef4444',
        borderWidth: 2,
        strokeDashArray: 5,
        label: {
          text: 'Hoy',
          style: {
            color: '#ffffff',
            background: '#ef4444',
          },
        },
      }],
    },
  };

  const series = [{
    name: 'Tendencia y Predicción',
    data: generateTimelineData(),
  }];

  return (
    <div className="w-full h-80">
      <Chart options={options} series={series} type="line" height="100%" />
    </div>
  );
};
