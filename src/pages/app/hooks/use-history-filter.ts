import { useNavigateTo } from '@/stores/modern-layout';
import { useEffect, useState } from 'react';
import type { HistoryFilter } from '../types';

export const useHistoryFilter = (activeTab: string) => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter | null>(null);
  const navigateTo = useNavigateTo();

  const handleGoToHistory = (exerciseId: string, exerciseName: string) => {
    // Configurar el filtro para el ejercicio específico
    setHistoryFilter({ exerciseId, exerciseName });

    // Navegar a la pestaña de historial
    navigateTo('history');
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