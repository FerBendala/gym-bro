import { Activity, BarChart3, Calendar, Target } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { BalanceChart } from './balance-chart';

interface GeneralContentProps {
  balanceScore: number;
  finalConsistency: number;
  avgIntensity: number;
  avgFrequency: number;
  muscleBalance: Array<{
    category: string;
    percentage: number;
    totalVolume: number;
    idealPercentage: number;
  }>;
  onItemClick?: (itemName: string) => void;
}

export const GeneralContent: React.FC<GeneralContentProps> = ({
  balanceScore,
  finalConsistency,
  avgIntensity,
  avgFrequency,
  muscleBalance,
  onItemClick
}) => {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Score de Balance"
          value={`${Math.round(balanceScore)}/100`}
          icon={Target}
          variant={balanceScore >= 80 ? 'success' : balanceScore >= 60 ? 'warning' : 'danger'}
          tooltip="Evaluación del balance entre grupos musculares. 80+ es excelente, 60-79 es bueno, <60 necesita mejora."
        />
        <StatCard
          title="Consistencia"
          value={`${Math.round(finalConsistency)}%`}
          icon={BarChart3}
          variant={finalConsistency >= 70 ? 'success' : finalConsistency >= 50 ? 'warning' : 'danger'}
          tooltip="Porcentaje de días con entrenamiento vs días totales."
        />
        <StatCard
          title="Intensidad Promedio"
          value={`${Math.round(avgIntensity)}kg`}
          icon={Activity}
          variant="primary"
          tooltip="Peso promedio utilizado en todos los ejercicios."
        />
        <StatCard
          title="Frecuencia"
          value={`${avgFrequency} sesiones`}
          icon={Calendar}
          variant={avgFrequency >= 4 ? 'success' : avgFrequency >= 2 ? 'warning' : 'danger'}
          tooltip="Número total de sesiones de entrenamiento registradas."
        />
      </div>

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
}; 