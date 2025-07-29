import React, { useState } from 'react';

import type { ChartProgressLinesProps } from '../types';
import { generateAreaPath, generateProgressPath, getChartCoordinates } from '../utils';

interface TooltipData {
  exercise: string;
  weight: number;
  estimated1RM: number;
  date: Date;
  reps: number;
  sets: number;
}

/**
 * Líneas de progreso mejoradas con efectos visuales y interactividad
 */
export const EnhancedChartLines: React.FC<ChartProgressLinesProps> = ({
  exerciseData,
  dimensions,
  weightRange,
  dateRange,
  colors,
}) => {
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: TooltipData } | null>(null);

  return (
    <>
      {/* Definir gradientes para cada línea */}
      <defs>
        {colors.map((color, index) => (
          <linearGradient
            key={`gradient-${index}`}
            id={`gradient-${index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        ))}

        {/* Filtros para sombras */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
        </filter>

        {/* Filtro para glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Área de fondo para cada línea */}
      {Object.entries(exerciseData).map(([exerciseName, exerciseRecords], exerciseIndex) => {
        const isOtherHovered = hoveredExercise && hoveredExercise !== exerciseName;

        if (exerciseRecords.length < 2) return null;

        // Crear el área bajo la línea usando 1RM estimado
        const areaPathClosed = generateAreaPath(exerciseRecords, dateRange, weightRange, dimensions);

        return (
          <path
            key={`area-${exerciseName}`}
            d={areaPathClosed}
            fill={`url(#gradient-${exerciseIndex})`}
            opacity={isOtherHovered ? 0.1 : 0.2}
            className="transition-opacity duration-300"
          />
        );
      })}

      {/* Líneas principales */}
      {Object.entries(exerciseData).map(([exerciseName, exerciseRecords], exerciseIndex) => {
        const color = colors[exerciseIndex % colors.length];
        const isHovered = hoveredExercise === exerciseName;
        const isOtherHovered = hoveredExercise && hoveredExercise !== exerciseName;

        if (exerciseRecords.length < 2) {
          // Punto único con efecto glow
          const record = exerciseRecords[0];
          const { x, y } = getChartCoordinates(record, dateRange, weightRange, dimensions);

          return (
            <g key={exerciseName}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={color}
                filter={isHovered ? 'url(#glow)' : undefined}
                opacity={isOtherHovered ? 0.3 : 1}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredExercise(exerciseName)}
                onMouseLeave={() => setHoveredExercise(null)}
              />
            </g>
          );
        }

        // Crear la línea de progreso usando 1RM estimado
        const pathData = generateProgressPath(exerciseRecords, dateRange, weightRange, dimensions);

        return (
          <g key={exerciseName}>
            {/* Línea de fondo más gruesa para efecto de profundidad */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Línea principal */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={isHovered ? '3' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={isHovered ? 'url(#glow)' : undefined}
              opacity={isOtherHovered ? 0.3 : 1}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredExercise(exerciseName)}
              onMouseLeave={() => setHoveredExercise(null)}
            />

            {/* Puntos */}
            {exerciseRecords.map((record, pointIndex) => {
              const { x, y, estimated1RM } = getChartCoordinates(record, dateRange, weightRange, dimensions);

              return (
                <g key={pointIndex}>
                  {/* Círculo de fondo */}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="rgba(0,0,0,0.2)"
                  />

                  {/* Punto principal */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? '5' : '4'}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    filter={isHovered ? 'url(#glow)' : undefined}
                    opacity={isOtherHovered ? 0.3 : 1}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredExercise(exerciseName);
                      setHoveredPoint({
                        x: e.clientX,
                        y: e.clientY,
                        data: {
                          exercise: exerciseName,
                          weight: record.weight,
                          estimated1RM,
                          date: record.date,
                          reps: record.reps,
                          sets: record.sets,
                        },
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredExercise(null);
                      setHoveredPoint(null);
                    }}
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Tooltip flotante */}
      {hoveredPoint && (
        <foreignObject
          x={Math.min(hoveredPoint.x - dimensions.padding, dimensions.width - 220)}
          y={Math.max(hoveredPoint.y - 90, 10)}
          width="220"
          height="90"
        >
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
            <p className="text-white font-medium text-sm truncate">
              {hoveredPoint.data.exercise}
            </p>
            <p className="text-blue-300 text-xs font-medium">
              1RM Estimado: {hoveredPoint.data.estimated1RM.toFixed(1)}kg
            </p>
            <p className="text-gray-300 text-xs">
              Peso real: {hoveredPoint.data.weight}kg × {hoveredPoint.data.reps} × {hoveredPoint.data.sets}
            </p>
            <p className="text-gray-400 text-xs">
              {hoveredPoint.data.date.toLocaleDateString()}
            </p>
          </div>
        </foreignObject>
      )}
    </>
  );
};
