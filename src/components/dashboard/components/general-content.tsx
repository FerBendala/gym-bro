import { BarChart } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { InfoTooltip } from '../../tooltip';
import { BalanceChart } from './balance-chart';

interface GeneralContentProps {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  muscleBalance: any[];
  onItemClick: (itemName: string) => void;
}

export const GeneralContent: React.FC<GeneralContentProps> = ({
  balanceScore,
  finalConsistency,
  avgIntensity,
  avgFrequency,
  muscleBalance,
  onItemClick
}) => (
  <div className="space-y-6">
    {/* Score de Balance General - Diseño Mejorado */}
    <Card className="p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <CardHeader className="pb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mr-4">
            <BarChart className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
          </div>
          <span className="truncate">Análisis General de Balance</span>
          <InfoTooltip
            content="Análisis general del balance muscular y rendimiento de entrenamiento"
            position="top"
            className="ml-3 flex-shrink-0"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Score de Balance"
            value={`${Math.round(balanceScore)}/100`}
            icon={BarChart}
            variant={balanceScore >= 80 ? 'success' : balanceScore >= 60 ? 'warning' : 'danger'}
            tooltip="Evaluación del balance entre grupos musculares. 80+ es excelente, 60-79 es bueno, <60 necesita mejora."
          />
          <StatCard
            title="Consistencia"
            value={`${Math.round(finalConsistency)}%`}
            icon={BarChart}
            variant={finalConsistency >= 70 ? 'success' : finalConsistency >= 50 ? 'warning' : 'danger'}
            tooltip="Porcentaje de días con entrenamiento vs días totales."
          />
          <StatCard
            title="Intensidad Promedio"
            value={`${Math.round(avgIntensity)}kg`}
            icon={BarChart}
            variant="primary"
            tooltip="Peso promedio utilizado en todos los ejercicios."
          />
          <StatCard
            title="Frecuencia"
            value={`${avgFrequency} sesiones`}
            icon={BarChart}
            variant={avgFrequency >= 4 ? 'success' : avgFrequency >= 2 ? 'warning' : 'danger'}
            tooltip="Número total de sesiones de entrenamiento registradas."
          />
        </div>
      </CardContent>
    </Card>

    {/* Gráfico de balance */}
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📈</span>
          Distribución por Categorías
        </h3>
      </CardHeader>
      <CardContent>
        <BalanceChart
          muscleBalance={muscleBalance}
          onItemClick={onItemClick}
        />
      </CardContent>
    </Card>
  </div>
); 