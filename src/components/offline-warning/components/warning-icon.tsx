import React from 'react';
import type { WarningIconProps } from '../types';

export const WarningIcon: React.FC<WarningIconProps> = ({
  icon: Icon,
  className = ''
}) => {
  return <Icon className={className} />;
}; 