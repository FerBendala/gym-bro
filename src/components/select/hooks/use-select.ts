import { useMemo } from 'react';
import { SELECT_CONSTANTS } from '../constants';
import { SelectProps } from '../types';
import { buildSelectClasses, determineValidationState, shouldUseGroups } from '../utils';

export const useSelect = ({
  error,
  groups = [],
  size = SELECT_CONSTANTS.DEFAULT_SIZE,
  variant = SELECT_CONSTANTS.DEFAULT_VARIANT,
  validation,
  className,
}: SelectProps) => {
  const validationState = useMemo(() =>
    determineValidationState(validation, error),
    [validation, error]
  );

  const useGroups = useMemo(() =>
    shouldUseGroups(groups),
    [groups]
  );

  const selectClasses = useMemo(() =>
    buildSelectClasses(size, variant, validationState, className),
    [size, variant, validationState, className]
  );

  const hasError = Boolean(error);

  return {
    validationState,
    useGroups,
    selectClasses,
    hasError,
  };
}; 