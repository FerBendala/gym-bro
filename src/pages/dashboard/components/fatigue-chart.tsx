import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { Card, CardContent, CardHeader } from '@/components/card';

export interface FatigueChartProps {
  fatigueIndex: number;
  recoveryRate: number;
  recoveryScore: number;
  consistency: number;
  frequency: number;
  volumeScore: number;
  intensityScore: number;
  plateauRisk: number;
  overreachingRisk: 'Bajo' | 'Medio' | 'Alto';
}

export const FatigueChart: React.FC<FatigueChartProps> = ({
  fatigueIndex,
  recoveryRate,
  recoveryScore,
  consistency,
  frequency,
  volumeScore,
  intensityScore,
  plateauRisk,
  overreachingRisk,
}) => {
  // Normalizar frecuencia para mostrar como porcentaje (5 días = 100%)
  const normalizedFrequency = Math.min(100, frequency * 20);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        borderRadius: 4,
      },
    },
    colors: [
      '#ef4444', // Rojo - Fatiga
      '#10b981', // Verde - Recuperación
      '#3b82f6', // Azul - Consistencia
      '#f59e0b', // Amarillo - Frecuencia
      '#8b5cf6', // Púrpura - Volumen
      '#06b6d4', // Cyan - Intensidad
      '#84cc16', // Verde lima - Estabilidad
      '#f97316', // Naranja - Seguridad
    ],
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#ffffff'],
        fontSize: '12px',
        fontWeight: 'bold',
      },
      formatter: (val: number, opts) => {
        const categories = [
          'Fatiga',
          'Recuperación',
          'Consistencia',
          'Frecuencia',
          'Volumen',
          'Intensidad',
          'Estabilidad',
          'Seguridad',
        ];
        const category = categories[opts.dataPointIndex];

        switch (category) {
          case 'Fatiga':
            return `${fatigueIndex}%`;
          case 'Recuperación':
            return `${recoveryRate}%`;
          case 'Consistencia':
            return `${consistency}%`;
          case 'Frecuencia':
            return `${frequency.toFixed(1)} días/sem`;
          case 'Volumen':
            return `${volumeScore}%`;
          case 'Intensidad':
            return `${intensityScore}%`;
          case 'Estabilidad':
            return `${(100 - plateauRisk)}%`;
          case 'Seguridad':
            return overreachingRisk;
          default:
            return `${val}%`;
        }
      },
    },
    xaxis: {
      categories: [
        'Índice Fatiga',
        'Tasa Recuperación',
        'Consistencia',
        'Frecuencia',
        'Volumen',
        'Intensidad',
        'Estabilidad',
        'Riesgo Sobreentrenamiento',
      ],
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '11px',
        },
      },
    },
    theme: {
      mode: 'dark',
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number, opts) => {
          const categories = [
            'Fatiga',
            'Recuperación',
            'Consistencia',
            'Frecuencia',
            'Volumen',
            'Intensidad',
            'Estabilidad',
            'Seguridad',
          ];
          const category = categories[opts.dataPointIndex];

          switch (category) {
            case 'Fatiga':
              return `${fatigueIndex}% - ${fatigueIndex < 30 ? 'Baja' : fatigueIndex < 60 ? 'Moderada' : 'Alta'}`;
            case 'Recuperación':
              return `${recoveryRate}% (Score: ${recoveryScore})`;
            case 'Consistencia':
              return `${consistency}% - ${consistency >= 80 ? 'Excelente' : consistency >= 60 ? 'Buena' : 'Baja'}`;
            case 'Frecuencia':
              return `${frequency.toFixed(1)} días/semana - ${frequency >= 4 ? 'Óptima' : frequency >= 3 ? 'Buena' : 'Baja'}`;
            case 'Volumen':
              return `${volumeScore}% - ${volumeScore >= 80 ? 'Óptimo' : volumeScore >= 60 ? 'Adecuado' : 'Subóptimo'}`;
            case 'Intensidad':
              return `${intensityScore}% - ${intensityScore >= 80 ? 'Óptima' : intensityScore >= 60 ? 'Buena' : 'Baja'}`;
            case 'Estabilidad':
              return `${(100 - plateauRisk)}% estable - ${plateauRisk < 30 ? 'Bajo riesgo' : plateauRisk < 60 ? 'Riesgo moderado' : 'Alto riesgo'}`;
            case 'Seguridad':
              return `Riesgo: ${overreachingRisk}`;
            default:
              return `${val}%`;
          }
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4,
    },
  };

  const series = [{
    name: 'Métricas',
    data: [
      fatigueIndex,
      recoveryRate,
      consistency,
      normalizedFrequency,
      volumeScore,
      intensityScore,
      100 - plateauRisk, // Invertir para que mayor = mejor
      overreachingRisk === 'Bajo' ? 100 : overreachingRisk === 'Medio' ? 60 : 20,
    ],
  }];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">
          Análisis de Fatiga y Rendimiento
        </h3>
        <p className="text-sm text-gray-400">
          Métricas visuales de tu estado de entrenamiento
        </p>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={350} />
      </CardContent>
    </Card>
  );
};
