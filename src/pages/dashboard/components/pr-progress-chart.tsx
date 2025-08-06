import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

import { formatNumberToString } from '@/utils';
import { clamp } from '@/utils/functions/math-utils';

export interface PRProgressChartProps {
  currentWeight: number;
  predictedPR: number;
  baseline1RM: number;
  confidence: number;
  timeToNextPR: number;
  improvement: number;
  exerciseCategory?: string; // ✅ NUEVO: Categoría del ejercicio
  strengthTrend?: number; // ✅ NUEVO: Tendencia de fuerza para progreso dinámico
}

export const PRProgressChart: React.FC<PRProgressChartProps> = ({
  currentWeight,
  predictedPR,
  baseline1RM,
  confidence,
  timeToNextPR,
  exerciseCategory,
  strengthTrend = 0, // ✅ NUEVO: Tendencia de fuerza
}) => {
  // ✅ MEJORADO: Validación más robusta de datos de entrada
  const validCurrentWeight = Math.max(0, currentWeight || 0);
  const validPredictedPR = Math.max(validCurrentWeight, predictedPR || validCurrentWeight * 1.05);
  // ✅ CORRECCIÓN: Usar baseline calculado, no forzar mínimo artificial
  const validBaseline1RM = Math.max(0, baseline1RM || validCurrentWeight * 0.7);

  // ✅ MEJORADO: Cálculo más seguro del progreso hacia el PR
  let progressPercentage = 0;

  if (validBaseline1RM > 0 && validPredictedPR > validBaseline1RM) {
    const totalProgress = validPredictedPR - validBaseline1RM;

    // ✅ DINÁMICO: Calcular progreso basado en tendencia real
    let currentProgress: number;

    // Calcular progreso dinámico basado en la relación actual vs baseline
    const progressRatio = validCurrentWeight / validBaseline1RM;

    // ✅ MEJORADO: Usar tendencia de fuerza para progreso dinámico
    const trendMultiplier = Math.max(0.5, Math.min(2.0, 1 + (strengthTrend / 100)));

    if (progressRatio >= 1.0) {
      // Si ya superó el baseline, progreso normal con tendencia
      currentProgress = (validCurrentWeight - validBaseline1RM) * trendMultiplier;
    } else if (progressRatio >= 0.8) {
      // Si está cerca del baseline (80-100%), considerar tendencia
      const baseProgress = totalProgress * 0.4;
      currentProgress = baseProgress * trendMultiplier;
    } else if (progressRatio >= 0.6) {
      // Si está a media distancia (60-80%), considerar tendencia
      const baseProgress = totalProgress * 0.25;
      currentProgress = baseProgress * trendMultiplier;
    } else {
      // Si está lejos del baseline (<60%), considerar tendencia
      const baseProgress = totalProgress * 0.1;
      currentProgress = baseProgress * trendMultiplier;
    }

    if (totalProgress > 0) {
      if (currentProgress >= totalProgress) {
        // Si ya alcanzó o superó el PR objetivo
        progressPercentage = 95; // 95% para mostrar casi completo
      } else {
        // Calcular progreso normal
        progressPercentage = clamp((currentProgress / totalProgress) * 100, 5, 95);
      }
    }
  }

  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return '#10b981'; // green
    if (progress >= 70) return '#3b82f6'; // blue
    if (progress >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 400,
      background: 'transparent',
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '60%',
          background: 'transparent',
        },
        track: {
          background: '#374151',
          strokeWidth: '100%',
          margin: 5,
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 700,
            color: getProgressColor(progressPercentage),
            offsetY: 5,
            formatter: () => `${formatNumberToString(validCurrentWeight, 1)}kg`,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [getProgressColor(progressPercentage)],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Peso Actual'],
    theme: {
      mode: 'dark',
    },
  };

  const series = [progressPercentage];

  return (
    <div className="w-full space-y-4">
      {/* Gráfico Semi-Gauge */}
      <div className="w-full h-64">
        <Chart options={options} series={series} type="radialBar" height="100%" />
      </div>

      {/* Métricas adicionales debajo del gauge */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-500/20">
        <div className="text-center">
          <div className="text-xs text-gray-400">
            {exerciseCategory ? `Baseline (${exerciseCategory})` : 'Baseline'}
          </div>
          <div className="text-sm font-medium text-white">{formatNumberToString(validBaseline1RM, 1)}kg</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Objetivo PR</div>
          <div className="text-sm font-medium text-purple-400">{formatNumberToString(validPredictedPR, 1)}kg</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Tiempo</div>
          <div className="text-sm font-medium text-white">{clamp(timeToNextPR || 8, 1, 52)}sem</div>
        </div>
      </div>

      {/* Barra de confianza */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Confianza de Predicción</span>
          <span>{clamp((confidence || 0.5) * 100, 5, 95)}%</span>
        </div>
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${(confidence || 0.5) >= 0.7 ? 'bg-green-500' :
              (confidence || 0.5) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${clamp((confidence || 0.5) * 100, 5, 95)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
