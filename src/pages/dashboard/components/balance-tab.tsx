import { UpperLowerBalanceContent } from '@/components/dashboard-upper-lower-balance-content';
import type { WorkoutRecord } from '@/interfaces';
import { BarChart3, Brain, PieChart, Scale } from 'lucide-react';
import React from 'react';
import { BalanceByGroupContent, GeneralContent, TrendsContent } from '.';
import { useBalanceTab } from '../hooks/use-balance-tab';
import { EmptyState } from '../shared';


interface BalanceTabProps {
  records: WorkoutRecord[];
}

export const BalanceTab: React.FC<BalanceTabProps> = ({ records }) => {
  const {
    activeSubTab,
    setActiveSubTab,
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
      <EmptyState
        icon={() => <span className="text-2xl">⚖️</span>}
        title="Sin datos para análisis de balance"
        description="Registra algunos entrenamientos para ver tu balance muscular"
      />
    );
  }

  const subTabs = [
    {
      id: 'general' as const,
      name: 'General',
      icon: BarChart3,
      description: 'Análisis general con Balance Radar'
    },
    {
      id: 'balanceByGroup' as const,
      name: 'Balance por Grupo',
      icon: PieChart,
      description: 'Análisis detallado por categorías'
    },
    {
      id: 'upperLower' as const,
      name: 'Tren Superior vs Inferior',
      icon: Scale,
      description: 'Balance entre tren superior e inferior'
    },
    {
      id: 'trends' as const,
      name: 'Tendencias',
      icon: Brain,
      description: 'Análisis de tendencias y predicciones'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navegación de SubTabs */}
      <div className="flex bg-gray-800 rounded-lg p-1 overflow-hidden">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 lg:py-3 rounded-md text-xs lg:text-sm font-medium transition-all duration-200 min-w-0
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="hidden md:block truncate">{tab.name}</span>
              <span className="md:hidden truncate">{tab.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de SubTabs */}
      {activeSubTab === 'general' && (
        <GeneralContent
          balanceScore={balanceScore}
          finalConsistency={finalConsistency}
          avgIntensity={avgIntensity}
          avgFrequency={avgFrequency}
          muscleBalance={muscleBalance}
        />
      )}

      {activeSubTab === 'balanceByGroup' && muscleBalance.length > 0 && (
        <BalanceByGroupContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          muscleBalance={muscleBalance as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          categoryAnalysis={categoryAnalysis as any}
          onItemClick={handleBalanceItemClick}
        />
      )}

      {activeSubTab === 'upperLower' && Object.keys(upperLowerBalance).length > 0 && (
        <UpperLowerBalanceContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          upperLowerBalance={upperLowerBalance as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          categoryAnalysis={categoryAnalysis as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          muscleBalance={muscleBalance as any}
          onItemClick={handleUpperLowerItemClick}
        />
      )}

      {activeSubTab === 'trends' && (
        <TrendsContent records={records} />
      )}
    </div>
  );
}; 