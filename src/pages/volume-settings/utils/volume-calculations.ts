import { VOLUME_SETTINGS_CONSTANTS } from '../constants';
import type { VolumeDistribution } from '../types';

export const calculateTotalPercentage = (volumeDistribution: VolumeDistribution): number => {
  return Object.values(volumeDistribution).reduce((sum, value) => sum + value, 0);
};

export const isTotalValid = (totalPercentage: number): boolean => {
  return Math.abs(totalPercentage - VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL) <= VOLUME_SETTINGS_CONSTANTS.TOLERANCE;
};

export const getTotalStatus = (totalPercentage: number) => {
  if (totalPercentage === VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL) {
    return {
      isValid: true,
      className: 'border-green-500/30 bg-green-950/20',
      message: 'Distribución correcta',
    };
  }

  if (totalPercentage > VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL) {
    return {
      isValid: false,
      className: 'border-red-500/30 bg-red-950/20',
      message: 'Excede el 100% - ajusta los valores',
    };
  }

  return {
    isValid: false,
    className: 'border-yellow-500/30 bg-yellow-950/20',
    message: 'Falta para llegar al 100%',
  };
};

export const normalizeVolumeDistribution = (volumeDistribution: VolumeDistribution): VolumeDistribution => {
  const totalPercentage = calculateTotalPercentage(volumeDistribution);
  if (totalPercentage === 0) return volumeDistribution;

  const factor = VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL / totalPercentage;
  return Object.entries(volumeDistribution).reduce((acc, [key, value]) => {
    acc[key] = Math.round(value * factor * 10) / 10;
    return acc;
  }, {} as VolumeDistribution);
};
