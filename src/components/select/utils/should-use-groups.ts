import { SelectGroup } from '@/interfaces/ui.interfaces';

export const shouldUseGroups = (groups: SelectGroup[]): boolean => {
  return groups.length > 0;
};
