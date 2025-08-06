import { MODERN_THEME } from '@/constants/theme';
import { cn } from '@/utils';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SelectDropdownProps } from '../types';

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  isOpen,
  disabled,
  options = [],
  groups = [],
  selectedValue,
  onOptionSelect,
  placeholder,
  dropdownRef,
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let container = document.getElementById('select-dropdown-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'select-dropdown-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  if (!isOpen || disabled || !portalContainer) return null;

  // Calcular posición del dropdown
  const getDropdownPosition = () => {
    if (dropdownRef?.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
    }
    return { top: 0, left: 0, width: 'auto' };
  };

  const position = getDropdownPosition();

  const renderOption = (option: { value: string; label: string; disabled?: boolean }) => {
    const isSelected = String(option.value) === String(selectedValue);
    const isDisabled = option.disabled || false;

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => {
          if (!isDisabled) {
            onOptionSelect(option.value);
          }
        }}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200',
          {
            'bg-blue-600/20 text-blue-400 border border-blue-500/30': isSelected,
            'text-gray-300 hover:bg-gray-800/50 hover:text-white': !isSelected && !isDisabled,
            'text-gray-500 cursor-not-allowed': isDisabled,
          },
        )}
        disabled={isDisabled}
      >
        <span className="font-medium">
          {option.label}
        </span>
        {isSelected && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    );
  };

  const renderGroup = (group: { label: string; options: { value: string; label: string; disabled?: boolean }[] }) => {
    return (
      <div key={group.label} className="mb-2">
        <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
          {group.label}
        </div>
        <div className="space-y-1">
          {group.options.map(renderOption)}
        </div>
      </div>
    );
  };

  const dropdownContent = (
    <div
      className={cn(
        'fixed bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl',
        'z-[999999]',
        MODERN_THEME.animations.slide.down,
      )}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      <div className="p-2 max-h-60 overflow-y-auto">
        {placeholder && (
          <button
            type="button"
            onClick={() => onOptionSelect('')}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200',
              String(selectedValue) === '' || !selectedValue
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
            )}
          >
            <span className="font-medium text-gray-400">
              {placeholder}
            </span>
            {(String(selectedValue) === '' || !selectedValue) && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}

        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map(renderGroup)}
          </div>
        ) : (
          <div className="space-y-1">
            {options.map(renderOption)}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dropdownContent, portalContainer);
};
