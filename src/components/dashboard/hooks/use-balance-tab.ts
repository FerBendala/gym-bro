import { useMemo, useState } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateBalanceAnalysis } from '../utils/balance-utils';

export type BalanceSubTab = 'general' | 'balanceByGroup' | 'upperLower' | 'trends';

export const useBalanceTab = (records: WorkoutRecord[]) => {
  const [activeSubTab, setActiveSubTab] = useState<BalanceSubTab>('general');

  const balanceData = useMemo(() => {
    if (records.length === 0) {
      return {
        balanceScore: 0,
        finalConsistency: 0,
        avgIntensity: 0,
        avgFrequency: 0,
        muscleBalance: [],
        categoryAnalysis: {},
        upperLowerBalance: {},
        selectedView: 'general' as const
      };
    }

    return calculateBalanceAnalysis(records);
  }, [records]);

  const handleViewChange = (view: 'general' | 'upperLower' | 'byGroup' | 'trends') => {
    // Esta función se puede expandir si necesitamos manejar cambios de vista
    return view;
  };

  const handleBalanceItemClick = (itemName: string) => {
    console.log('Balance item clicked:', itemName);
    // Aquí se puede agregar lógica adicional para manejar clicks en elementos del balance
  };

  const handleUpperLowerItemClick = (itemName: string) => {
    console.log('Upper/Lower item clicked:', itemName);
    // Aquí se puede agregar lógica adicional para manejar clicks en elementos upper/lower
  };

  return {
    activeSubTab,
    setActiveSubTab,
    ...balanceData,
    handleViewChange,
    handleBalanceItemClick,
    handleUpperLowerItemClick
  };
}; 