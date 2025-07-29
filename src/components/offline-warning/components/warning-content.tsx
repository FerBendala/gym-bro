import React from 'react';

import { WARNING_LAYOUT_CLASSES } from '../constants';
import type { WarningIconProps, WarningMessageProps } from '../types';

import { WarningIcon } from './warning-icon';
import { WarningMessage } from './warning-message';

interface WarningContentProps extends WarningIconProps, WarningMessageProps { }

export const WarningContent: React.FC<WarningContentProps> = ({
  icon,
  className: iconClassName,
  message,
}) => {
  return (
    <div className={WARNING_LAYOUT_CLASSES.container}>
      <WarningIcon icon={icon} className={iconClassName} />
      <WarningMessage message={message} />
    </div>
  );
};
