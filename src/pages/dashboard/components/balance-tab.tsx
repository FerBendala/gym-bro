import { BarChart3, Brain, PieChart, Scale } from 'lucide-react';
import React from 'react';

import { useBalanceTab } from '../hooks/use-balance-tab';
import { EmptyState } from '../shared';

import { BalanceByGroupContent, GeneralContent, TrendsContent } from '.';

import { UpperLowerBalanceContent } from '@/components/dashboard-upper-lower-balance-content';
import type { WorkoutRecord } from '@/interfaces';

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
    userVolumeDistribution,
    handleBalanceItemClick,
    handleUpperLowerItemClick,
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
      name: 'Vista General',
      icon: BarChart3,
      description: 'Análisis general con Balance Radar',
    },
    {
      id: 'balanceByGroup' as const,
      name: 'Por Categoría',
      icon: PieChart,
      description: 'Análisis detallado por categorías',
    },
    {
      id: 'upperLower' as const,
      name: 'Superior vs Inferior',
      icon: Scale,
      description: 'Balance entre tren superior e inferior',
    },
    {
      id: 'trends' as const,
      name: 'Análisis Temporal',
      icon: Brain,
      description: 'Análisis de tendencias y predicciones',
    },
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
          muscleBalance={muscleBalance}
          categoryAnalysis={categoryAnalysis}
          onItemClick={handleBalanceItemClick}
        />
      )}

      {activeSubTab === 'upperLower' && Object.keys(upperLowerBalance).length > 0 && (
        <UpperLowerBalanceContent
          upperLowerBalance={upperLowerBalance}
          categoryAnalysis={categoryAnalysis}
          muscleBalance={muscleBalance}
          onItemClick={handleUpperLowerItemClick}
          userVolumeDistribution={userVolumeDistribution}
        />
      )}

      {activeSubTab === 'trends' && (
        <TrendsContent records={records} />
      )}
    </div>
  );
};
