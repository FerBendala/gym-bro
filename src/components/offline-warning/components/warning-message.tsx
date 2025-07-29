import React from 'react';

import type { WarningMessageProps } from '../types';

export const WarningMessage: React.FC<WarningMessageProps> = ({ message }) => {
  return <p className="text-yellow-400 text-xs">{message}</p>;
};
