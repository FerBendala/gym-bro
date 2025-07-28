import { formatDayLabel } from '@/utils';
import React from 'react';
import type { TabButtonProps } from '../types';
import { getTabButtonClasses } from '../utils';

export const TabButton: React.FC<TabButtonProps> = ({
  day,
  isActive,
  onClick,
  size,
  variant,
  isMobile = false
}) => {
  const handleClick = () => onClick(day);

  const buttonClasses = getTabButtonClasses(
    isActive,
    variant || { active: '', inactive: '' },
    size || '',
    isMobile
  );

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
    >
      {formatDayLabel(day)}
    </button>
  );
}; 