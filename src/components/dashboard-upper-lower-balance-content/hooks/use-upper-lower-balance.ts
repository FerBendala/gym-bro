import { useMemo } from 'react';

import type { MetaCategoryData, UpperLowerBalanceContentProps } from '../types';
import { calculateChartData, createMetaCategoryData } from '../utils';

export const useUpperLowerBalance = ({
  upperLowerBalance,
  categoryAnalysis,
  muscleBalance,
  userVolumeDistribution,
}: Omit<UpperLowerBalanceContentProps, 'onItemClick'> & {
  userVolumeDistribution: Record<string, number>;
}) => {
  const metaCategoryData = useMemo(() => {
    // Validar datos de entrada
    if (!upperLowerBalance) {
      console.warn('upperLowerBalance es null o undefined');
      return [];
    }

    if (!userVolumeDistribution) {
      console.warn('userVolumeDistribution es null o undefined');
      return [];
    }

    return createMetaCategoryData(upperLowerBalance, userVolumeDistribution);
  }, [upperLowerBalance, userVolumeDistribution]);

  const getChartDataForMeta = useMemo(() => {
    return (meta: MetaCategoryData) => {
      // Validar datos de entrada
      if (!categoryAnalysis || !muscleBalance) {
        console.warn('categoryAnalysis o muscleBalance son null o undefined');
        return {
          volume: 0,
          idealVolume: 0,
          intensity: 0,
          frequency: 0,
          strength: 0,
          records: 0,
          trend: '=',
        };
      }

      return calculateChartData(meta, categoryAnalysis, muscleBalance);
    };
  }, [categoryAnalysis, muscleBalance]);

  return {
    metaCategoryData,
    getChartDataForMeta,
  };
};
