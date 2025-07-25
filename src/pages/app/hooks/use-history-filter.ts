import { useEffect, useState } from 'react';
import type { HistoryFilter } from '../types';

export const useHistoryFilter = (activeTab: string) => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter | null>(null);

  const handleGoToHistory = (exerciseId: string, exerciseName: string) => {
    setHistoryFilter({ exerciseId, exerciseName });
  };

  useEffect(() => {
    if (activeTab !== 'history') {
      setHistoryFilter(null);
    }
  }, [activeTab]);

  return {
    historyFilter,
    handleGoToHistory
  };
}; 