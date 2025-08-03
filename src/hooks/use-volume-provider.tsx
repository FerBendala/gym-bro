import { createContext, ReactNode, useContext } from 'react';
import { useVolumeConfig } from './use-volume-config';

interface VolumeConfigContextType {
  volumeDistribution: Record<string, number>;
  loading: boolean;
  error: string | null;
  getIdealPercentage: (category: string) => number;
  getVolumeDistribution: () => Record<string, number>;
}

const VolumeConfigContext = createContext<VolumeConfigContextType | undefined>(undefined);

interface VolumeConfigProviderProps {
  children: ReactNode;
}

export const VolumeConfigProvider = ({ children }: VolumeConfigProviderProps) => {
  const volumeConfig = useVolumeConfig();
  return (
    <VolumeConfigContext.Provider value={volumeConfig}>
      {children}
    </VolumeConfigContext.Provider>
  );
};

export const useAppVolumeConfig = (): VolumeConfigContextType => {
  const context = useContext(VolumeConfigContext);
  if (context === undefined) {
    throw new Error('useAppVolumeConfig debe usarse dentro de VolumeConfigProvider');
  }
  return context;
}; 