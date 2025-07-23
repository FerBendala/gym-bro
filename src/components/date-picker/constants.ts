export const DATE_PICKER_DEFAULTS = {
  LABEL: 'Fecha',
  PLACEHOLDER: 'Seleccionar fecha',
  CLASS_NAME: '',
  DISABLED: false
} as const;

export const DATE_FORMATS = {
  INPUT: 'YYYY-MM-DD',
  DISPLAY: {
    locale: 'es-ES',
    options: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  }
} as const; 