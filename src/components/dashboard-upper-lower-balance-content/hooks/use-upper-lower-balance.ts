import { useMemo } from 'react';

import type { MetaCategoryData, UpperLowerBalanceContentProps } from '../types';
import { calculateChartData, createMetaCategoryData } from '../utils';

export const useUpperLowerBalance = ({
  upperLowerBalance,
  categoryAnalysis,
  muscleBalance,
}: Omit<UpperLowerBalanceContentProps, 'onItemClick'>) => {
  const metaCategoryData = useMemo(() => {
    return createMetaCategoryData(upperLowerBalance);
  }, [upperLowerBalance]);

  const getChartDataForMeta = useMemo(() => {
    return (meta: MetaCategoryData) => {
      return calculateChartData(meta, categoryAnalysis, muscleBalance);
    };
  }, [categoryAnalysis, muscleBalance]);

  return {
    metaCategoryData,
    getChartDataForMeta,
  };
};
