import { Activity, BarChart3, Calendar, Target } from 'lucide-react';
import React from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { Card, CardContent, CardHeader } from '../../card';
import { StatCard } from '../../stat-card';
import { useBalanceTab } from '../hooks/use-balance-tab';
import { BalanceChart } from './balance-chart';
import { BalanceMetrics } from './balance-metrics';

interface BalanceTabProps {
  records: WorkoutRecord[];
}

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const {
    balanceScore,
    finalConsistency,
    avgIntensity,
    avgFrequency,
    muscleBalance,
    categoryAnalysis,
    upperLowerBalance,
    handleBalanceItemClick,
    handleUpperLowerItemClick
  } = useBalanceTab(records);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">⚖️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Sin datos para análisis de balance
        </h3>
        <p className="text-gray-500">
          Registra algunos entrenamientos para ver tu balance muscular
        </p>
      </div>
    );
  }

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
            onItemClick={handleBalanceItemClick}
          />
        </CardContent>
      </Card>

      {/* Métricas detalladas */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">📊</span>
            Métricas Detalladas
          </h3>
        </CardHeader>
        <CardContent>
          <BalanceMetrics
            categoryAnalysis={categoryAnalysis}
            upperLowerBalance={upperLowerBalance}
            onUpperLowerClick={handleUpperLowerItemClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 