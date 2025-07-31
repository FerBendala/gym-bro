import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SELECT_CONSTANTS } from '../constants';
import { SelectProps } from '../types';
import { buildSelectClasses, determineValidationState, getDisplayText, shouldUseGroups } from '../utils';

export const useSelect = ({
  error,
  groups = [],
  size = SELECT_CONSTANTS.DEFAULT_SIZE,
  variant = SELECT_CONSTANTS.DEFAULT_VARIANT,
  validation,
  className,
  value,
  onChange,
  disabled = false,
  options = [],
  placeholder,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validationState = useMemo(() =>
    determineValidationState(validation, error),
    [validation, error],
  );

  const useGroups = useMemo(() =>
    shouldUseGroups(groups),
    [groups],
  );

  const selectClasses = useMemo(() =>
    buildSelectClasses(size, variant, validationState, className),
    [size, variant, validationState, className],
  );

  const displayText = useMemo(() => {
    return getDisplayText(String(value), options, groups, placeholder);
  }, [value, options, groups, placeholder]);

  const hasError = Boolean(error);

  // Click outside para cerrar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verificar si el click fue fuera del dropdown
      const target = event.target as Node;

      // Si el dropdown está abierto, verificar si el click fue fuera
      if (isOpen) {
        // Verificar si el click fue en el botón del select
        const isButtonClick = dropdownRef.current?.contains(target);

        // Verificar si el click fue en el portal del dropdown
        const dropdownPortal = document.getElementById('select-dropdown-portal');
        const isDropdownClick = dropdownPortal?.contains(target);

        // Si no fue click en el botón ni en el dropdown, cerrar
        if (!isButtonClick && !isDropdownClick) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [isOpen, disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOptionSelect = useCallback((optionValue: string) => {
    if (onChange) {
      // Crear un evento más realista para react-hook-form
      const event = {
        target: {
          value: optionValue,
          name: 'exerciseId', // Nombre del campo para react-hook-form
          type: 'select-one',
          id: 'exerciseId',
          className: '',
          multiple: false,
          required: false,
          size: 1,
          selectedIndex: 0,
          selectedOptions: null,
          willValidate: true,
          validity: null,
          validationMessage: '',
          checkValidity: () => true,
          reportValidity: () => true,
          setCustomValidity: () => { },
        },
        currentTarget: {
          value: optionValue,
          name: 'exerciseId',
          type: 'select-one',
          id: 'exerciseId',
          className: '',
          multiple: false,
          required: false,
          size: 1,
          selectedIndex: 0,
          selectedOptions: null,
          willValidate: true,
          validity: null,
          validationMessage: '',
          checkValidity: () => true,
          reportValidity: () => true,
          setCustomValidity: () => { },
        },
        type: 'change',
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 2,
        isTrusted: false,
        timeStamp: Date.now(),
        preventDefault: () => { },
        stopPropagation: () => { },
        stopImmediatePropagation: () => { },
        composedPath: () => [],
        initEvent: () => { },
        nativeEvent: new Event('change'),
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => { },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
    setIsOpen(false);
  }, [onChange]);

  return {
    validationState,
    useGroups,
    selectClasses,
    hasError,
    isOpen,
    dropdownRef,
    displayText,
    handleToggle,
    handleClose,
    handleOptionSelect,
  };
};
