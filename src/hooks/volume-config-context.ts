import { createContext } from 'react';

interface VolumeConfigContextType {
  volumeDistribution: Record<string, number>;
  loading: boolean;
  error: string | null;
  getIdealPercentage: (category: string) => number;
  getVolumeDistribution: () => Record<string, number>;
}

export const VolumeConfigContext = createContext<VolumeConfigContextType | undefined>(undefined);
