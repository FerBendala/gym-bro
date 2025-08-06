import React from 'react';

import { SelectLabelProps } from '../types';
import { buildLabelClasses } from '../utils';

export const SelectLabel: React.FC<SelectLabelProps> = ({ label, size, hasError }) => {
  const labelClasses = buildLabelClasses(size, hasError);

  return (
    <label className={labelClasses}>
      {label}
    </label>
  );
};
