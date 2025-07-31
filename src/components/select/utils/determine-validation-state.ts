import { SelectValidation } from '../types';

export const determineValidationState = (
  validation?: SelectValidation,
  error?: string,
): SelectValidation => {
  if (error) return 'error';
  if (validation) return validation;
  return 'default';
}; 