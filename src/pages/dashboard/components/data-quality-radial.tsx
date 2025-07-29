import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

export interface DataQualityRadialProps {
  qualityScore: number;
  validationRate: number;
  hasRecentData: boolean;
  dataSpan: number;
}

export const DataQualityRadial: React.FC<DataQualityRadialProps> = ({
  qualityScore,
  validationRate,
  hasRecentData,
  dataSpan,
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
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '12px',
            color: '#9ca3af',
          },
          value: {
            fontSize: '14px',
            color: '#ffffff',
            formatter: (val: number) => `${Math.round(val)}%`,
          },
          total: {
            show: true,
            label: 'Calidad Global',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            formatter: () => `${qualityScore}/100`,
          },
        },
        track: {
          background: '#374151',
          strokeWidth: '97%',
        },
      },
    },
    fill: {
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Validación', 'Datos Recientes', 'Span Temporal', 'Calidad Global'],
    theme: {
      mode: 'dark',
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#9ca3af',
      },
      markers: {
        size: 6,
      },
    },
  };

  const series = [
    getFactorScore('Validación'),
    getFactorScore('Datos Recientes'),
    getFactorScore('Span Temporal'),
    getFactorScore('Calidad Global'),
  ];

  return (
    <div className="w-full h-80">
      <Chart options={options} series={series} type="radialBar" height="100%" />
    </div>
  );
};
