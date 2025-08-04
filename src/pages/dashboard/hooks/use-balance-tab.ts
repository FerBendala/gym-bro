import { useMemo, useState } from 'react';

import { useAppVolumeConfig } from '@/hooks/use-volume-provider.tsx';
import { calculateBalanceAnalysis } from '../utils/balance-utils';

import type { WorkoutRecord } from '@/interfaces';

export type BalanceSubTab = 'general' | 'balanceByGroup' | 'upperLower' | 'trends';

export const useBalanceTab = (records: WorkoutRecord[]) => {
  const [activeSubTab, setActiveSubTab] = useState<BalanceSubTab>('general');
  const { getVolumeDistribution } = useAppVolumeConfig();

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
        selectedView: 'general' as const,
      };
    }

    const customVolumeDistribution = getVolumeDistribution();
    return calculateBalanceAnalysis(records, customVolumeDistribution);
  }, [records, getVolumeDistribution]);

  const userVolumeDistribution = useMemo(() => {
    return getVolumeDistribution();
  }, [getVolumeDistribution]);

  const handleViewChange = (view: 'general' | 'upperLower' | 'byGroup' | 'trends') => {
    // Esta función se puede expandir si necesitamos manejar cambios de vista
    return view;
  };

  const scrollToCard = (cardId: string) => {
    const element = document.getElementById(cardId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  };

  const handleBalanceItemClick = (itemName: string) => {
    // Scroll suave al elemento correspondiente
    const cardId = `balance-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    scrollToCard(cardId);
  };

  const handleUpperLowerItemClick = (itemName: string) => {
    // Scroll suave al elemento correspondiente
    const cardId = `upper-lower-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    scrollToCard(cardId);
  };

  return {
    activeSubTab,
    setActiveSubTab,
    ...balanceData,
    userVolumeDistribution,
    handleViewChange,
    handleBalanceItemClick,
    handleUpperLowerItemClick,
    scrollToCard,
  };
};
