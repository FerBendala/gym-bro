import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

export interface ConfidenceGaugeProps {
  confidence: number;
  level: string;
  color: string;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ confidence, level }) => {
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
      toolbar: { show: false },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%',
          background: 'transparent',
        },
        track: {
          background: '#374151',
          strokeWidth: '100%',
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
            fontSize: '24px',
            fontWeight: 700,
            color: getGaugeColor(confidence),
            offsetY: 8,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
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
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: [level],
    theme: {
      mode: 'dark',
    },
  };

  const series = [confidence];

  return (
    <div className="w-full h-64">
      <Chart options={options} series={series} type="radialBar" height="100%" />
    </div>
  );
};
