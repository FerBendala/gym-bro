import React from 'react';

export interface LegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
  maxLabelLength?: number;
}

/**
 * Componente genérico para leyendas de gráficos
 * Reutilizable en ExerciseProgressChart, Dashboard charts, etc.
 */
export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  className = '',
  maxLabelLength = 32
}) => {
  if (items.length === 0) {
    return null;
  }

  const truncateLabel = (label: string): string => {
    return label.length > maxLabelLength
      ? `${label.substring(0, maxLabelLength)}...`
      : label;
  };

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span
            className="text-sm text-gray-300 truncate"
            title={item.label}
          >
            {truncateLabel(item.label)}
          </span>
        </div>
      ))}
    </div>
  );
}; 