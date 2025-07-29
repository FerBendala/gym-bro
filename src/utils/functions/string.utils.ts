/**
 * Utilidades para manejo de strings y formateo de texto
 * Funciones puras para operaciones con texto
 */

import type { WorkoutRecord } from '@/interfaces';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';

/**
 * Combina clases CSS de forma segura
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Combina estilos CSS con variantes y modificadores
 */
export const combineStyles = (
  base: string,
  variants: Record<string, string> = {},
  modifiers: Record<string, boolean> = {},
  className?: string
): string => {
  const variantClasses = Object.entries(variants)
    .filter(([value]) => value)
    .map(([value]) => value)
    .join(' ');

  const modifierClasses = Object.entries(modifiers)
    .filter(([enabled]) => enabled)
    .map(([key]) => key)
    .join(' ');

  return cn(base, variantClasses, modifierClasses, className);
};

/**
 * Aplica clases condicionales
 */
export const conditionalClasses = (
  conditions: Record<string, boolean | undefined>
): string => {
  return Object.entries(conditions)
    .filter(([condition]) => condition)
    .map(([className]) => className)
    .join(' ');
};

/**
 * Valida y normaliza un tamaño
 */
export const validateSize = <T extends string>(
  size: T | undefined,
  allowedSizes: readonly T[],
  defaultSize: T
): T => {
  if (!size || !allowedSizes.includes(size)) {
    return defaultSize;
  }
  return size;
};

/**
 * Valida y normaliza una variante
 */
export const validateVariant = <T extends string>(
  variant: T | undefined,
  allowedVariants: readonly T[],
  defaultVariant: T
): T => {
  if (!variant || !allowedVariants.includes(variant)) {
    return defaultVariant;
  }
  return variant;
};

/**
 * Formatea un número con decimales específicos
 */
export const formatNumberToString = (num: number, maxDecimals: number = 1): string => {
  if (isNaN(num)) return '0';

  const rounded = Math.round(num * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);
  return rounded.toString();
};

/**
 * Formatea un porcentaje
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  if (isNaN(value)) return '0%';
  return `${formatNumberToString(value, decimals)}%`;
};

/**
 * Formatea duración en segundos a formato legible
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Formatea peso con unidad
 */
export const formatWeight = (value: number, unit = 'kg'): string => {
  if (isNaN(value)) return `0 ${unit}`;
  return `${formatNumberToString(value)} ${unit}`;
};

/**
 * Formatea repeticiones
 */
export const formatReps = (value: number): string => {
  if (isNaN(value)) return '0 reps';
  return `${Math.round(value)} reps`;
};

/**
 * Formatea series
 */
export const formatSets = (value: number): string => {
  if (isNaN(value)) return '0 sets';
  return `${Math.round(value)} sets`;
};

/**
 * Formatea volumen
 */
export const formatVolumeToKg = (volume: number): string => {
  if (isNaN(volume)) return '0 kg';
  return `${formatNumberToString(volume)} kg`;
};

/**
 * Formatea descripción de entrenamiento
 */
export const formatWorkoutDescription = (record: WorkoutRecord): string => {
  if (!record) return '';

  const weight = formatWeight(record.weight || 0);
  const reps = formatReps(record.reps || 0);
  const sets = formatSets(record.sets || 0);

  return `${weight} × ${reps} × ${sets}`;
};

/**
 * Normaliza una URL
 */
export const normalizeURL = (url: string): string => {
  if (!url) return '';

  // Asegurar que tenga protocolo
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return url;
  }
};

/**
 * Extrae el dominio de una URL
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(normalizeURL(url));
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
};

/**
 * Genera un título automático basado en el tipo
 */
export const generateAutoTitle = (type: string, hostname?: string): string => {
  switch (type) {
    case 'youtube':
      return 'Video de YouTube';
    case 'image':
      return 'Imagen';
    case 'video':
      return 'Video';
    case 'document':
      return 'Documento';
    default:
      return hostname ? `Enlace de ${hostname}` : 'Enlace';
  }
};

/**
 * Valida si una URL es válida
 */
export const isValidURL = (url: string): boolean => {
  if (!url) return false;

  try {
    new URL(normalizeURL(url));
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtiene información de un archivo desde URL
 */
export const getFileInfoFromString = (url: string): {
  extension: string;
  fileName: string;
  isMedia: boolean;
} => {
  try {
    const urlObj = new URL(normalizeURL(url));
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv'];
    const isMedia = mediaExtensions.includes(extension);

    return {
      extension,
      fileName,
      isMedia
    };
  } catch {
    return {
      extension: '',
      fileName: '',
      isMedia: false
    };
  }
};

/**
 * Filtra opciones de select por texto de búsqueda
 */
export const filterSelectOptions = (
  options: Array<{ value: string; label: string }>,
  searchText: string
): Array<{ value: string; label: string }> => {
  if (!searchText) return options;

  const normalizedSearch = searchText.toLowerCase().trim();

  return options.filter(option =>
    option.label.toLowerCase().includes(normalizedSearch) ||
    option.value.toLowerCase().includes(normalizedSearch)
  );
};

/**
 * Agrupa ejercicios por categoría para usar en componentes Select
 */
export const groupExercisesByCategory = (exercises: Array<{ id: string; name: string; categories: string[] }>): Array<{
  label: string;
  options: Array<{ value: string; label: string }>;
}> => {
  const grouped: Record<string, Array<{ value: string; label: string }>> = {};

  exercises.forEach(exercise => {
    exercise.categories.forEach(category => {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        value: exercise.id,
        label: exercise.name
      });
    });
  });

  return Object.entries(grouped).map(([category, options]) => ({
    label: category,
    options: options.sort((a, b) => a.label.localeCompare(b.label))
  })).sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Encuentra una opción por valor
 */
export const findOptionByValue = (
  options: Array<{ value: string; label: string }>,
  value: string
): { value: string; label: string } | undefined => {
  return options.find(option => option.value === value);
};

/**
 * Obtiene la etiqueta de una opción por valor
 */
export const getOptionLabel = (
  options: Array<{ value: string; label: string }>,
  value: string,
  fallback = value
): string => {
  const option = findOptionByValue(options, value);
  return option?.label || fallback;
};

/**
 * Valida si un valor es válido para un select
 */
export const isValidSelectValue = (
  options: Array<{ value: string; label: string }>,
  value: string
): boolean => {
  return options.some(option => option.value === value);
};

/**
 * Obtiene el color de ajuste de volumen basado en el valor
 * Función genérica para colores de volumen en toda la aplicación
 */
export const getVolumeAdjustmentColor = (adjustment: number): string => {
  if (adjustment > 0) return 'text-green-400';
  if (adjustment < 0) return 'text-red-400';
  return 'text-gray-400';
}; 