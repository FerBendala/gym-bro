import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';

export interface FactorsChartProps {
  factors: {
    name: string;
    value: number | string;
    status: 'good' | 'warning' | 'bad';
  }[];
}

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
    data: factors.map(f => typeof f.value === 'number' ? f.value : parseFloat(f.value as string) || 0)
  }];

  return (
    <div className="w-full h-64">
      <Chart options={options} series={series} type="bar" height="100%" />
    </div>
  );
}; 