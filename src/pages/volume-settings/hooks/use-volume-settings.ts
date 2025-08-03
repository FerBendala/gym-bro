import { useEffect, useState } from 'react';

import { VOLUME_SETTINGS_CONSTANTS, VOLUME_SETTINGS_MESSAGES } from '../constants';
import type { VolumeDistribution, VolumeSettingsState } from '../types';

import { UserSettingsService } from '@/api/services';
import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants/exercise.constants';
import { useNotification } from '@/stores/notification';
import { logger } from '@/utils';
import type { UserSettings } from '@/utils/data/indexeddb-types';
import { getItem, updateItem } from '@/utils/data/indexeddb-utils';
import { clamp } from '@/utils/functions/math-utils';

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
        // Intentar cargar desde Firebase primero
        const firebaseResult = await UserSettingsService.getUserSettings();

        if (firebaseResult.success && firebaseResult.data?.customVolumeDistribution) {
          setState(prev => ({
            ...prev,
            volumeDistribution: firebaseResult.data!.customVolumeDistribution!,
          }));
          logger.info('Configuración de volumen cargada desde Firebase');
        } else {
          // Si no hay datos en Firebase, intentar cargar desde IndexedDB
          const indexedDbResult = await getItem<UserSettings>('metadata', 'userSettings');
          if (indexedDbResult.success && indexedDbResult.data?.value?.customVolumeDistribution) {
            setState(prev => ({
              ...prev,
              volumeDistribution: indexedDbResult.data!.value.customVolumeDistribution!,
            }));
            logger.info('Configuración de volumen cargada desde IndexedDB');
          }
        }
      } catch (error) {
        logger.error('Error cargando configuración de volumen:', error as Error);
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadCurrentSettings();
  }, []);

  // Actualizar porcentaje de un grupo muscular
  const handleVolumeChange = (category: string, value: number) => {
    const clampedValue = clamp(value, 0, 100);
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
    0,
  );

  // Guardar configuración
  const handleSave = async () => {
    if (Math.abs(totalPercentage - VOLUME_SETTINGS_CONSTANTS.TARGET_TOTAL) > VOLUME_SETTINGS_CONSTANTS.TOLERANCE) {
      showNotification(VOLUME_SETTINGS_MESSAGES.TOTAL_ERROR, 'error');
      return;
    }

    setState(prev => ({ ...prev, saving: true }));
    try {
      // Guardar en IndexedDB primero
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

      await updateItem<UserSettings>('metadata', newSettings);

      // Luego guardar en Firebase
      const firebaseResult = await UserSettingsService.updateVolumeDistribution(state.volumeDistribution);

      if (firebaseResult.success) {
        showNotification(VOLUME_SETTINGS_MESSAGES.SAVE_SUCCESS, 'success');
        logger.info('Configuración de volumen guardada en IndexedDB y Firebase');
        return true;
      } else {
        // Si Firebase falla, al menos se guardó en IndexedDB
        showNotification('Configuración guardada localmente. Error al sincronizar con la nube.', 'warning');
        logger.warn('Error guardando en Firebase, pero se guardó en IndexedDB');
        return true;
      }
    } catch (error) {
      logger.error('Error guardando configuración:', error as Error);
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
