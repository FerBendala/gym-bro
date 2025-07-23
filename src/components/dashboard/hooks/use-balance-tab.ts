import type { WorkoutRecord } from '@/interfaces';
import { useMemo } from 'react';
import { calculateBalanceAnalysis } from '../utils/balance-utils';

export const useBalanceTab = (records: WorkoutRecord[]) => {
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
    // Lógica para manejar clicks en elementos de balance
    console.log('Clicked balance item:', itemName);
  };

  const handleUpperLowerItemClick = (itemName: string) => {
    // Lógica para manejar clicks en elementos upper/lower
    console.log('Clicked upper/lower item:', itemName);
  };

  return {
    ...balanceData,
    handleViewChange,
    handleBalanceItemClick,
    handleUpperLowerItemClick
  };
}; 