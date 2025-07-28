import { Tooltip } from '@/components/tooltip';
import { Info } from 'lucide-react';
import React from 'react';
import { InfoTooltipProps } from '../types';

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  position = 'top',
  className
}) => {
  return (
    <Tooltip
      content={content}
      position={position}
      trigger="hover"
      className={className}
    >
      <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors cursor-help" />
    </Tooltip>
  );
}; 