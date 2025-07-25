import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants/exercise.constants';
import { useNotification } from '@/stores/notification-store';
import type { UserSettings } from '@/utils/data/indexeddb-types';
import { getItem, updateItem } from '@/utils/data/indexeddb-utils';
import { useEffect, useState } from 'react';
import { VOLUME_SETTINGS_CONSTANTS, VOLUME_SETTINGS_MESSAGES } from '../constants';
import type { VolumeDistribution, VolumeSettingsState } from '../types';

export const useVolumeSettings = () => {
  const [state, setState] = useState<VolumeSettingsState>({
    volumeDistribution: IDEAL_VOLUME_DISTRIBUTION,
    loading: true,
    saving: false,
  });
  const { showNotification } = useNotification();

  // Cargar configuración actual
  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const result = await getItem<UserSettings>('metadata', 'userSettings');
        if (result.success && result.data?.value?.customVolumeDistribution) {
          setState(prev => ({
            ...prev,
            volumeDistribution: result.data?.value.customVolumeDistribution || IDEAL_VOLUME_DISTRIBUTION,
          }));
        }
      } catch (error) {
        console.error('Error cargando configuración de volumen:', error);
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadCurrentSettings();
  }, []);

  // Actualizar porcentaje de un grupo muscular
  const handleVolumeChange = (category: string, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setState(prev => ({
      ...prev,
      volumeDistribution: {
        ...prev.volumeDistribution,
        [category]: clampedValue,
      },
    }));
  };

  // Calcular total de porcentajes
  const totalPercentage = Object.values(state.volumeDistribution).reduce(
    (sum, value) => sum + value,
    0
  );

  // Guardar configuración
  const handleSave = async () => {
    if (Math.abs(totalPercentage - VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL) > VOLUME_SETTINGS_CONSTANTS.TOLERANCE) {
      showNotification(VOLUME_SETTINGS_MESSAGES.TOTAL_ERROR, 'error');
      return;
    }

    setState(prev => ({ ...prev, saving: true }));
    try {
      const currentResult = await getItem<UserSettings>('metadata', 'userSettings');
      const currentSettings = currentResult.success ? currentResult.data : null;

      const newSettings: UserSettings = {
        key: 'userSettings',
        value: {
          ...currentSettings?.value,
          customVolumeDistribution: state.volumeDistribution,
        },
        updatedAt: Date.now(),
      };

      const result = await updateItem<UserSettings>('metadata', newSettings);
      if (result.success) {
        showNotification(VOLUME_SETTINGS_MESSAGES.SAVE_SUCCESS, 'success');
        return true;
      } else {
        throw new Error(result.error || 'Error guardando configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showNotification(VOLUME_SETTINGS_MESSAGES.SAVE_ERROR, 'error');
      return false;
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // Restablecer valores por defecto
  const handleReset = () => {
    setState(prev => ({
      ...prev,
      volumeDistribution: IDEAL_VOLUME_DISTRIBUTION,
    }));
    showNotification(VOLUME_SETTINGS_MESSAGES.RESET_SUCCESS, 'info');
  };

  // Normalizar porcentajes automáticamente
  const handleNormalize = () => {
    if (totalPercentage === 0) return;

    const factor = VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL / totalPercentage;
    const normalized = Object.entries(state.volumeDistribution).reduce((acc, [key, value]) => {
      acc[key] = Math.round(value * factor * 10) / 10;
      return acc;
    }, {} as VolumeDistribution);

    setState(prev => ({
      ...prev,
      volumeDistribution: normalized,
    }));
    showNotification(VOLUME_SETTINGS_MESSAGES.NORMALIZE_SUCCESS, 'info');
  };

  return {
    state,
    totalPercentage,
    handleVolumeChange,
    handleSave,
    handleReset,
    handleNormalize,
  };
}; 