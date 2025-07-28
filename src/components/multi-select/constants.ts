export const MULTI_SELECT_CONSTANTS = {
  DEFAULT_PLACEHOLDER: 'Selecciona opciones...',
  DEFAULT_SIZE: 'md' as const,
  DEFAULT_DISABLED: false,
  DEFAULT_VALUE: [] as string[],
} as const;

export const MULTI_SELECT_CLASSES = {
  dropdown: 'absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto',
  option: 'flex items-center px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors',
  optionSelected: 'bg-blue-600/20',
  checkbox: 'w-4 h-4 mr-3 border rounded flex items-center justify-center transition-colors',
  checkboxSelected: 'bg-blue-600 border-blue-600',
  checkboxUnselected: 'border-gray-600',
  optionText: 'text-sm text-white',
  chevron: 'w-4 h-4 text-gray-400 transition-transform',
  chevronOpen: 'transform rotate-180',
  button: 'flex items-center justify-between w-full cursor-pointer',
  buttonDisabled: 'opacity-50 cursor-not-allowed',
  buttonOpen: 'ring-2 ring-blue-500 border-transparent',
  placeholder: 'text-gray-400',
} as const; 