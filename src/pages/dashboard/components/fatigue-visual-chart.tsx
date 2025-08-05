import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { Card, CardContent, CardHeader } from '@/components/card';

export interface FatigueVisualChartProps {
  fatigueIndex: number;
  recoveryRate: number;
  recoveryScore: number;
  consistency: number;
  frequency: number;
  volumeScore: number;
  intensityScore: number;
  plateauRisk: number;
  overreachingRisk: string;
}

export const FatigueVisualChart: React.FC<FatigueVisualChartProps> = ({
  fatigueIndex,
  recoveryRate,
  recoveryScore,
  consistency,
  frequency,
  volumeScore,
  intensityScore,
  plateauRisk
}) => {
  // Normalizar valores para el gráfico
  const normalizedFatigue = 100 - fatigueIndex;
  const normalizedFrequency = frequency * 20; // Convertir días/semana a porcentaje
  const normalizedPlateau = 100 - plateauRisk;

  // Configuración del gráfico radar
  const radarOptions: ApexOptions = {
    chart: {
      type: 'radar',
      height: 350,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#374151',
          strokeWidth: '1',
          fill: {
            colors: ['rgba(55, 65, 81, 0.1)'],
          },
        },
      },
    },
    colors: ['#3b82f6'],
    fill: {
      opacity: 0.3,
      colors: ['#3b82f6'],
    },
    stroke: {
      width: 3,
      colors: ['#3b82f6'],
    },
    markers: {
      size: 6,
      colors: ['#ffffff'],
      strokeColors: '#3b82f6',
      strokeWidth: 2,
    },
    xaxis: {
      categories: [
        'Recuperación',
        'Consistencia',
        'Frecuencia',
        'Volumen',
        'Intensidad',
        'Estabilidad',
        'Gestión Fatiga',
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
      style: {
        fontSize: '12px',
      },
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const categories = [
          'Recuperación',
          'Consistencia',
          'Frecuencia',
          'Volumen',
          'Intensidad',
          'Estabilidad',
          'Gestión Fatiga',
        ];
        const category = categories[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];

        let description = '';
        switch (category) {
          case 'Recuperación':
            description = `Capacidad de tu cuerpo para recuperarse entre sesiones. Basado en tu índice de fatiga (${fatigueIndex}%) y tiempo de descanso.`;
            break;
          case 'Consistencia':
            description = `Regularidad en tu entrenamiento. Mide qué tan constante eres con tu rutina semanal y si mantienes la frecuencia esperada.`;
            break;
          case 'Frecuencia':
            description = `Promedio de días que entrenas por semana. Calculado usando solo semanas completadas para mayor precisión.`;
            break;
          case 'Volumen':
            description = `Cantidad total de trabajo (peso × repeticiones × series) por sesión. Comparado con un objetivo dinámico basado en tu nivel y progreso.`;
            break;
          case 'Intensidad':
            description = `Qué tan cerca entrenas de tu máximo actual. Considera el peso promedio vs tu máximo reciente y bonifica la progresión.`;
            break;
          case 'Estabilidad':
            description = `Consistencia en tu rendimiento. Mide qué tan estable es tu progreso sin grandes fluctuaciones.`;
            break;
          case 'Gestión Fatiga':
            description = `Qué tan bien manejas la fatiga acumulada. Combina frecuencia, volumen y recuperación para evaluar tu gestión del estrés.`;
            break;
          default:
            description = `Valor: ${value}%`;
        }

        return `
          <div style="
            background: #1f2937;
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 12px;
            max-width: 280px;
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="
              color: #ffffff;
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 8px;
            ">
              ${category}: ${value}%
            </div>
            <div style="
              color: #9ca3af;
              font-size: 12px;
              line-height: 1.4;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: normal;
            ">
              ${description}
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
  };

  const radarSeries = [{
    name: 'Balance de Rendimiento',
    data: [
      recoveryRate,
      consistency,
      normalizedFrequency,
      volumeScore,
      intensityScore,
      consistency,
      normalizedFatigue,
    ],
  }];

  return (
    <Card key={`${fatigueIndex}-${recoveryRate}-${consistency}-${frequency}-${volumeScore}-${intensityScore}-${plateauRisk}`}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">
          Análisis Visual de Fatiga y Rendimiento
        </h3>
        <p className="text-sm text-gray-400">
          Balance general y métricas clave de tu estado de entrenamiento
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico Radar Principal */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-4 text-center">
              Balance General de Rendimiento
            </h4>
            <Chart options={radarOptions} series={radarSeries} type="radar" height={350} />
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{consistency}%</div>
              <div className="text-xs text-gray-400">Consistencia</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{frequency.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Días/Semana</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{volumeScore}%</div>
              <div className="text-xs text-gray-400">Volumen</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{intensityScore}%</div>
              <div className="text-xs text-gray-400">Intensidad</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 