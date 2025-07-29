import { useMemo } from 'react';

import { OFFLINE_WARNING_DEFAULTS } from '../constants';
import type { OfflineWarningProps } from '../types';
import { getAlertStyles, getIconClassName } from '../utils';

export const useOfflineWarning = (props: OfflineWarningProps) => {
  const {
    message = OFFLINE_WARNING_DEFAULTS.message,
    className = '',
    variant = OFFLINE_WARNING_DEFAULTS.variant,
    icon = OFFLINE_WARNING_DEFAULTS.icon,
    iconClassName = '',
  } = props;

  const alertStyles = useMemo(() => {
    const containerClassName = `${OFFLINE_WARNING_DEFAULTS.containerClassName} ${className}`;
    return getAlertStyles(variant, containerClassName);
  }, [variant, className]);

  const finalIconClassName = useMemo(() => {
    return getIconClassName(OFFLINE_WARNING_DEFAULTS.iconClassName, iconClassName);
  }, [iconClassName]);

  return {
    message,
    icon,
    alertStyles,
    finalIconClassName,
  };
};
