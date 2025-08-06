import React from 'react';

export interface LegendItem {
  label: string;
  color: string;
}

// Función para obtener un color más oscuro para el gradiente
const getDarkerColor = (color: string): string => {
  // Mapeo de colores a versiones más oscuras
  const colorMap: Record<string, string> = {
    '#3B82F6': '#1D4ED8', // Azul
    '#10B981': '#059669', // Verde
    '#F59E0B': '#D97706', // Naranja
    '#EF4444': '#DC2626', // Rojo
    '#8B5CF6': '#7C3AED', // Púrpura
    '#F97316': '#EA580C', // Naranja oscuro
    '#06B6D4': '#0891B2', // Cian
    '#84CC16': '#65A30D', // Verde lima
    '#6B7280': '#4B5563', // Gris
    '#6366F1': '#4F46E5', // Indigo
  };

  return colorMap[color] || color;
};

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
  maxLabelLength = 32,
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
            style={{ background: `linear-gradient(45deg, ${item.color} 0%, ${getDarkerColor(item.color)} 100%)` }}
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
