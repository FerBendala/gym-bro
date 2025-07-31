import { SelectGroup, SelectOption } from '@/interfaces/ui.interfaces';

export const getDisplayText = (
  value: string | undefined,
  options: SelectOption[],
  groups: SelectGroup[],
  placeholder?: string,
): string => {
  // Si no hay valor, mostrar placeholder
  if (!value || value === '') {
    return placeholder || '';
  }

  // Buscar en opciones simples
  const simpleOption = options.find(option => String(option.value) === String(value));
  if (simpleOption) {
    return simpleOption.label;
  }

  // Buscar en grupos
  for (const group of groups) {
    const groupOption = group.options.find(option => String(option.value) === String(value));
    if (groupOption) {
      return groupOption.label;
    }
  }

  // Si no se encuentra, devolver el valor original o placeholder
  return placeholder || String(value);
}; 