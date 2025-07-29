import { useState } from 'react';

/**
 * Hook para manejar el estado del selector de días
 */
export const useDaySelector = () => {
  const [showDaySelector, setShowDaySelector] = useState(false);

  const toggleDaySelector = () => {
    setShowDaySelector(!showDaySelector);
  };

  const closeDaySelector = () => {
    setShowDaySelector(false);
  };

  return {
    showDaySelector,
    toggleDaySelector,
    closeDaySelector,
  };
};
