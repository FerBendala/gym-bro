import { useEffect, useState } from 'react';

import { UserSettingsService } from '@/api/services';
import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants/exercise.constants';
import { logger } from '@/utils';
import type { UserSettings } from '@/utils/data/indexeddb-types';
import { getItem } from '@/utils/data/indexeddb-utils';

export interface VolumeConfig {
  volumeDistribution: Record<string, number>;
  loading: boolean;
  error: string | null;
}

// ✅ MECANISMO DE ACTUALIZACIÓN AUTOMÁTICA
let updateCallbacks: (() => void)[] = [];

export const subscribeToVolumeConfigUpdates = (callback: () => void) => {
  updateCallbacks.push(callback);
  return () => {
    updateCallbacks = updateCallbacks.filter(cb => cb !== callback);
  };
};

export const notifyVolumeConfigUpdate = () => {
  updateCallbacks.forEach(callback => callback());
};

export const useVolumeConfig = () => {
  const [state, setState] = useState<VolumeConfig>({
    volumeDistribution: IDEAL_VOLUME_DISTRIBUTION,
    loading: true,
    error: null,
  });

  const loadVolumeConfig = async () => {
    try {
      // Intentar cargar desde Firebase primero
      const firebaseResult = await UserSettingsService.getUserSettings();

      if (firebaseResult.success && firebaseResult.data?.customVolumeDistribution) {
        setState({
          volumeDistribution: firebaseResult.data.customVolumeDistribution,
          loading: false,
          error: null,
        });
        logger.info('Configuración de volumen cargada desde Firebase');
      } else {
        // Si no hay datos en Firebase, intentar cargar desde IndexedDB
        const indexedDbResult = await getItem<UserSettings>('metadata', 'userSettings');

        if (indexedDbResult.success && indexedDbResult.data?.value?.customVolumeDistribution) {
          setState({
            volumeDistribution: indexedDbResult.data.value.customVolumeDistribution,
            loading: false,
            error: null,
          });
          logger.info('Configuración de volumen cargada desde IndexedDB');
        } else {
          // Usar valores por defecto si no hay configuración personalizada
          setState({
            volumeDistribution: IDEAL_VOLUME_DISTRIBUTION,
            loading: false,
            error: null,
          });
          logger.info('Usando configuración de volumen por defecto');
        }
      }
    } catch (error) {
      logger.error('Error cargando configuración de volumen:', error as Error);
      setState({
        volumeDistribution: IDEAL_VOLUME_DISTRIBUTION,
        loading: false,
        error: 'Error cargando configuración',
      });
    }
  };

  useEffect(() => {
    loadVolumeConfig();
  }, []);

  // ✅ SUSCRIBIRSE A ACTUALIZACIONES
  useEffect(() => {
    const unsubscribe = subscribeToVolumeConfigUpdates(() => {
      logger.info('Actualizando configuración de volumen automáticamente');
      loadVolumeConfig();
    });

    return unsubscribe;
  }, []);

  const getIdealPercentage = (category: string): number => {
    return state.volumeDistribution[category] || IDEAL_VOLUME_DISTRIBUTION[category] || 15;
  };

  const getVolumeDistribution = (): Record<string, number> => {
    return state.volumeDistribution;
  };

  return {
    ...state,
    getIdealPercentage,
    getVolumeDistribution,
  };
}; 