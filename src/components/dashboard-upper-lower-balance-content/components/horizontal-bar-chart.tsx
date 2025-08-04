import React from 'react';

import type { HorizontalBarChartProps } from '../types';

import { formatNumberToString } from '@/utils';

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
  };
  
  return colorMap[color] || color;
};

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, onItemClick }) => {
  // Validar datos de entrada
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-500 text-sm">Sin datos disponibles</div>
      </div>
    );
  }

  // Validar y calcular el valor máximo con protección contra valores inválidos
  const validData = data.filter(item =>
    typeof item.value === 'number' &&
    typeof item.ideal === 'number' &&
    !isNaN(item.value) &&
    !isNaN(item.ideal)
  );

  if (validData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-500 text-sm">Datos inválidos</div>
      </div>
    );
  }

  const maxValue = Math.max(...validData.map(item => Math.max(item.value, item.ideal))) * 1.1;

  const handleItemClick = (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
    }
  };

  return (
    <div className="space-y-4">
      {validData.map((item, index) => (
        <div
          key={index}
          className="space-y-2 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-200"
          onClick={() => handleItemClick(item.name)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">{item.name}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">{formatNumberToString(item.value, 1)}%</span>
              <span className="text-xs text-gray-400">({formatNumberToString(item.ideal, 0)}% ideal)</span>
            </div>
          </div>

          <div className="relative">
            {/* Barra de fondo */}
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              {/* Zona ideal */}
              <div
                className="absolute h-full border-x border-white/20"
                style={{
                  left: `${Math.max(0, (item.ideal - 2) / maxValue * 100)}%`,
                  width: `${4 / maxValue * 100}%`,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%)',
                }}
              />

              {/* Barra actual */}
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                  background: `linear-gradient(90deg, ${item.color} 0%, ${getDarkerColor(item.color)} 100%)`,
                }}
              />

              {/* Indicador ideal */}
              <div
                className="absolute top-0 w-0.5 h-full"
                style={{ 
                  left: `${(item.ideal / maxValue) * 100}%`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 100%)',
                  boxShadow: '0 0 4px rgba(255,255,255,0.6)',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
