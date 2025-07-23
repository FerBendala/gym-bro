import { Activity, BarChart, Dumbbell, Footprints, Scale } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';

interface BalanceByGroupContentProps {
  muscleBalance: any[];
  categoryAnalysis: any;
  onItemClick: (itemName: string) => void;
}

// Funciones auxiliares para colores e iconos de categorías
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Pecho': return 'from-red-500 to-red-700';
    case 'Espalda': return 'from-blue-500 to-blue-700';
    case 'Piernas': return 'from-green-500 to-green-700';
    case 'Hombros': return 'from-purple-500 to-purple-700';
    case 'Brazos': return 'from-orange-500 to-orange-700';
    case 'Core': return 'from-indigo-500 to-indigo-700';
    default: return 'from-gray-500 to-gray-700';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Pecho': return Activity;
    case 'Espalda': return BarChart;
    case 'Piernas': return Footprints;
    case 'Hombros': return Scale;
    case 'Brazos': return Dumbbell;
    case 'Core': return Activity;
    default: return BarChart;
  }
};

export const BalanceByGroupContent: React.FC<BalanceByGroupContentProps> = ({
  muscleBalance,
  categoryAnalysis,
  onItemClick
}) => {
  return (
    <div className="space-y-6">
      {/* Análisis por Categorías */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Análisis por Categorías
            <InfoTooltip
              content="Análisis detallado del volumen y balance por cada categoría muscular"
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {muscleBalance.map((item) => {
              const Icon = getCategoryIcon(item.name);
              const gradientClass = getCategoryColor(item.name);

              return (
                <div
                  key={item.name}
                  id={`balance-card-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 p-4 hover:border-gray-500/50 transition-all duration-200 cursor-pointer"
                  onClick={() => onItemClick(item.name)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-white">{item.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{item.volume}kg</div>
                      <div className="text-sm text-gray-400">{item.percentage}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ejercicios:</span>
                      <span className="text-white">{item.exercises}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sesiones:</span>
                      <span className="text-white">{item.sessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Promedio:</span>
                      <span className="text-white">{Math.round(item.avgWeight)}kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Categorías */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📈</span>
            Métricas de Categorías
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(categoryAnalysis).map(([key, value]: [string, any]) => (
              <StatCard
                key={key}
                title={key}
                value={typeof value === 'number' ? Math.round(value) : value}
                icon={BarChart}
                variant="primary"
                tooltip={`Métrica de ${key.toLowerCase()}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 