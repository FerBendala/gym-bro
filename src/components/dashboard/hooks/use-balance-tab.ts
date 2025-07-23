import { useState } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateBalanceAnalysis } from '../utils/balance-utils';

export const useBalanceTab = (records: WorkoutRecord[]) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'balanceByGroup' | 'upperLower' | 'trends'>('general');

  // Calcular métricas de balance
  const {
    balanceScore,
    finalConsistency,
    avgIntensity,
    avgFrequency,
    muscleBalance,
    categoryAnalysis,
    upperLowerBalance
  } = calculateBalanceAnalysis(records);

  // Función para hacer smooth scroll a una card específica
  const scrollToCard = (cardId: string) => {
    const element = document.getElementById(cardId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offset = 100;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  // Función para manejar clicks en items del gráfico de balance por categoría
  const handleBalanceItemClick = (itemName: string) => {
    const cardId = `balance-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    scrollToCard(cardId);
  };

  // Función para manejar clicks en items del balance superior vs inferior
  const handleUpperLowerItemClick = (itemName: string) => {
    const cardId = `upper-lower-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    scrollToCard(cardId);
  };

  return {
    // Estado de subtabs
    activeSubTab,
    setActiveSubTab,

    // Métricas calculadas
    balanceScore,
    finalConsistency,
    avgIntensity,
    avgFrequency,
    muscleBalance,
    categoryAnalysis,
    upperLowerBalance,

    // Handlers
    handleBalanceItemClick,
    handleUpperLowerItemClick
  };
}; 