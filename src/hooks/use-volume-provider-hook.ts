import { useContext } from 'react';
import { VolumeConfigContext } from './volume-config-context';

export const useAppVolumeConfig = () => {
  const context = useContext(VolumeConfigContext);
  if (context === undefined) {
    throw new Error('useAppVolumeConfig debe usarse dentro de VolumeConfigProvider');
  }
  return context;
};
