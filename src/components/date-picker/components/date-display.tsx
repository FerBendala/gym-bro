import React from 'react';

import { formatDateForDisplay } from '../utils';

interface DateDisplayProps {
  value: Date;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ value }) => {
  return (
    <div className="pt-2 text-xs text-gray-400">
      Fecha seleccionada:{' '}
      <span className="text-white font-medium">
        {formatDateForDisplay(value)}
      </span>
    </div>
  );
};
