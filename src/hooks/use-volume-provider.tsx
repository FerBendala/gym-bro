import { ReactNode } from 'react';
import { useVolumeConfig } from './use-volume-config';
import { VolumeConfigContext } from './volume-config-context';

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
