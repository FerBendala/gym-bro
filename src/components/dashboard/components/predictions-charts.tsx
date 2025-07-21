import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

// Tipos para los props de los gráficos
export interface ConfidenceGaugeProps {
  confidence: number;
  level: string;
  color: string;
}

export interface DataQualityRadialProps {
  qualityScore: number;
  validationRate: number;
  hasRecentData: boolean;
  dataSpan: number;
}

export interface PredictionTimelineProps {
  currentWeight: number;
  nextWeekWeight: number;
  predictedPR: number;
  monthlyGrowthRate: number;
  strengthTrend: number;
}

export interface FactorsChartProps {
  factors: {
    name: string;
    value: number | string;
    status: 'good' | 'warning' | 'bad';
  }[];
}

// Gráfico de Gauge para Nivel de Confianza
export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ confidence, level, color }) => {
  const getGaugeColor = (conf: number): string => {
    if (conf >= 80) return '#10b981'; // green-500
    if (conf >= 60) return '#3b82f6'; // blue-500
    if (conf >= 40) return '#f59e0b'; // yellow-500
    if (conf >= 20) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 250,
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%',
          background: 'transparent'
        },
        track: {
          background: '#374151',
          strokeWidth: '100%'
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 700,
            color: getGaugeColor(confidence),
            offsetY: 8,
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    fill: {
      colors: [getGaugeColor(confidence)],
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [getGaugeColor(confidence)],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: [level],
    theme: {
      mode: 'dark'
    }
  };

  const series = [confidence];

  return (
    <div className="w-full h-64">
      <Chart options={options} series={series} type="radialBar" height="100%" />
    </div>
  );
};

// Gráfico Radial para Calidad de Datos
export const DataQualityRadial: React.FC<DataQualityRadialProps> = ({
  qualityScore,
  validationRate,
  hasRecentData,
  dataSpan
}) => {
  const getFactorScore = (factor: string): number => {
    switch (factor) {
      case 'Validación':
        return validationRate;
      case 'Datos Recientes':
        return hasRecentData ? 100 : 0;
      case 'Span Temporal':
        return Math.min(100, (dataSpan / 90) * 100);
      case 'Calidad Global':
        return qualityScore;
      default:
        return 0;
    }
  };

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 300,
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '12px',
            color: '#9ca3af'
          },
          value: {
            fontSize: '14px',
            color: '#ffffff',
            formatter: (val: number) => `${Math.round(val)}%`
          },
          total: {
            show: true,
            label: 'Calidad Global',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            formatter: () => `${qualityScore}/100`
          }
        },
        track: {
          background: '#374151',
          strokeWidth: '97%'
        }
      }
    },
    fill: {
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['Validación', 'Datos Recientes', 'Span Temporal', 'Calidad Global'],
    theme: {
      mode: 'dark'
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#9ca3af'
      },
      markers: {
        size: 6
      }
    }
  };

  const series = [
    getFactorScore('Validación'),
    getFactorScore('Datos Recientes'),
    getFactorScore('Span Temporal'),
    getFactorScore('Calidad Global')
  ];

  return (
    <div className="w-full h-80">
      <Chart options={options} series={series} type="radialBar" height="100%" />
    </div>
  );
};

// Timeline de Predicciones
export const PredictionTimeline: React.FC<PredictionTimelineProps> = ({
  currentWeight,
  nextWeekWeight,
  predictedPR,
  strengthTrend
}) => {

  const generateTimelineData = () => {
    const weeks = [];
    const currentDate = new Date();

    // Validar strengthTrend para evitar valores irreales
    const validStrengthTrend = Math.max(-2, Math.min(2, strengthTrend));

    // Datos históricos (últimas 4 semanas) - con progresión realista
    for (let i = 4; i >= 1; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7));

      // Calcular peso histórico con límites realistas
      const historicalWeight = currentWeight - (validStrengthTrend * i);
      const minHistoricalWeight = currentWeight * 0.85; // Máximo 15% menos
      const maxHistoricalWeight = currentWeight * 1.05; // Máximo 5% más

      weeks.push({
        x: date.getTime(),
        y: Math.max(minHistoricalWeight, Math.min(maxHistoricalWeight, historicalWeight))
      });
    }

    // Dato actual
    weeks.push({
      x: currentDate.getTime(),
      y: currentWeight
    });

    // Predicciones futuras
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    weeks.push({
      x: nextWeek.getTime(),
      y: nextWeekWeight
    });

    // Predicción de PR (estimando en 4-8 semanas)
    const prDate = new Date(currentDate);
    prDate.setDate(prDate.getDate() + (6 * 7)); // 6 semanas
    weeks.push({
      x: prDate.getTime(),
      y: predictedPR
    });



    return weeks;
  };

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      width: 3,
      curve: 'smooth'
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
        stops: [0, 100]
      }
    },
    markers: {
      size: 6,
      colors: ['#ffffff'],
      strokeColors: ['#3b82f6', '#10b981'],
      strokeWidth: 2,
      hover: {
        size: 8
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#9ca3af'
        },
        format: 'dd MMM'
      },
      axisBorder: {
        color: '#374151'
      },
      axisTicks: {
        color: '#374151'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af'
        },
        formatter: (val: number) => `${val.toFixed(1)}kg`
      },
      title: {
        text: 'Peso (kg)',
        style: {
          color: '#9ca3af'
        }
      }
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3
    },
    theme: {
      mode: 'dark'
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val.toFixed(1)}kg`
      }
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
            background: '#ef4444'
          }
        }
      }]
    }
  };

  const series = [{
    name: 'Tendencia y Predicción',
    data: generateTimelineData()
  }];

  return (
    <div className="w-full h-80">
      <Chart options={options} series={series} type="line" height="100%" />
    </div>
  );
};

// Gráfico de Factores (Bar Chart)
export const FactorsChart: React.FC<FactorsChartProps> = ({ factors }) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 250,
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 6,
        dataLabels: {
          position: 'center'
        }
      }
    },
    colors: factors.map(factor => {
      switch (factor.status) {
        case 'good': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'bad': return '#ef4444';
        default: return '#6b7280';
      }
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'middle',
      style: {
        colors: ['#ffffff'],
        fontSize: '12px',
        fontWeight: 600
      },
      formatter: (val: number) => `${val}%`
    },
    xaxis: {
      categories: factors.map(f => f.name),
      labels: {
        style: {
          colors: '#9ca3af'
        }
      },
      axisBorder: {
        color: '#374151'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af'
        }
      }
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3
    },
    theme: {
      mode: 'dark'
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val}%`
      }
    },
    legend: {
      show: false
    }
  };

  const series = [{
    name: 'Score',
    data: factors.map(f => f.value)
  }];

  return (
    <div className="w-full h-64">
      <Chart options={options} series={series} type="bar" height="100%" />
    </div>
  );
};

// Nuevos componentes para Análisis de Tendencia y PR

export interface TrendAnalysisChartProps {
  strengthTrend: number;
  volumeTrend: number;
  monthlyGrowthRate: number;
  plateauRisk: number;
  confidenceLevel: number;
  trendAnalysis: string;
}

export interface PRProgressChartProps {
  currentWeight: number;
  predictedPR: number;
  baseline1RM: number;
  confidence: number;
  timeToNextPR: number;
  improvement: number;
}

// Gráfico de Análisis de Tendencia (Radar Chart)
export const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({
  strengthTrend,
  volumeTrend,
  monthlyGrowthRate,
  plateauRisk,
  confidenceLevel,
  trendAnalysis
}) => {
  // Normalizar valores para el radar chart (0-100)
  const normalizeStrengthTrend = Math.min(100, Math.max(0, (strengthTrend + 2) * 25)); // -2 a +2 -> 0-100
  const normalizeVolumeTrend = Math.min(100, Math.max(0, (volumeTrend + 50) * 1)); // -50 a +50 -> 0-100
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
        'Tendencia Fuerza',
        'Tendencia Volumen',
        'Crecimiento Mensual',
        'Confianza IA',
        'Estabilidad'
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
          const categories = ['Tendencia Fuerza', 'Tendencia Volumen', 'Crecimiento Mensual', 'Confianza IA', 'Estabilidad'];
          const category = categories[opts.dataPointIndex];

          switch (category) {
            case 'Tendencia Fuerza':
              return `${strengthTrend.toFixed(2)}kg/semana`;
            case 'Tendencia Volumen':
              return `${volumeTrend.toFixed(1)}kg/semana`;
            case 'Crecimiento Mensual':
              return `${monthlyGrowthRate.toFixed(1)}kg/mes`;
            case 'Confianza IA':
              return `${confidenceLevel}%`;
            case 'Estabilidad':
              return `${(100 - plateauRisk)}% estable`;
            default:
              return `${val}%`;
          }
        }
      }
    },
    legend: {
      show: false
    }
  };

  const series = [{
    name: 'Análisis de Tendencia',
    data: [
      normalizeStrengthTrend,
      normalizeVolumeTrend,
      normalizeGrowthRate,
      normalizeConfidence,
      normalizePlateauRisk
    ]
  }];

  return (
    <div className="w-full h-96">
      <Chart options={options} series={series} type="radar" height="100%" />
    </div>
  );
};

// Gráfico de Progreso hacia PR (Semi-Gauge)
export const PRProgressChart: React.FC<PRProgressChartProps> = ({
  currentWeight,
  predictedPR,
  baseline1RM,
  confidence,
  timeToNextPR,
}) => {
  // Validar datos de entrada
  const validCurrentWeight = Math.max(0, currentWeight || 0);
  const validPredictedPR = Math.max(validCurrentWeight, predictedPR || validCurrentWeight * 1.05);
  const validBaseline1RM = Math.max(validCurrentWeight, baseline1RM || validCurrentWeight);

  // Calcular progreso como porcentaje hacia el PR
  // Usar baseline1RM como punto de partida y predictedPR como objetivo
  const progressPercentage = validBaseline1RM > 0 ?
    Math.min(100, Math.max(0, ((validCurrentWeight - validBaseline1RM) / (validPredictedPR - validBaseline1RM)) * 100)) : 0;

  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return '#10b981'; // green
    if (progress >= 70) return '#3b82f6'; // blue
    if (progress >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 300,
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '60%',
          background: 'transparent'
        },
        track: {
          background: '#374151',
          strokeWidth: '100%',
          margin: 5
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 700,
            color: getProgressColor(progressPercentage),
            offsetY: 5,
            formatter: () => `${Math.round(validCurrentWeight * 100) / 100}kg`
          }
        }
      }
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
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: [`Peso Actual`],
    theme: {
      mode: 'dark'
    }
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
          <div className="text-xs text-gray-400">Baseline</div>
          <div className="text-sm font-medium text-white">{validBaseline1RM.toFixed(1)}kg</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Objetivo PR</div>
          <div className="text-sm font-medium text-purple-400">{validPredictedPR.toFixed(1)}kg</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Tiempo</div>
          <div className="text-sm font-medium text-white">{Math.max(1, Math.min(52, timeToNextPR || 8))}sem</div>
        </div>
      </div>

      {/* Barra de confianza */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Confianza de Predicción</span>
          <span>{Math.max(5, Math.min(95, confidence || 50))}%</span>
        </div>
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${(confidence || 50) >= 70 ? 'bg-green-500' :
              (confidence || 50) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.max(5, Math.min(95, confidence || 50))}%` }}
          />
        </div>
      </div>
    </div>
  );
}; 