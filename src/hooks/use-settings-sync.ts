import { useCallback, useState } from 'react';

import { UserSettingsData, UserSettingsService } from '@/api/services';
import { useNotification } from '@/stores/notification';
import { logger } from '@/utils';
import type { UserSettings } from '@/utils/data/indexeddb-types';
import { getItem, updateItem } from '@/utils/data/indexeddb-utils';

export interface SettingsSyncState {
  syncing: boolean;
  lastSync: number | null;
  error: string | null;
}

export const useSettingsSync = () => {
  const [state, setState] = useState<SettingsSyncState>({
    syncing: false,
    lastSync: null,
    error: null,
  });
  const { showNotification } = useNotification();

  /**
   * Sincroniza la configuración local con Firebase
   */
  const syncToFirebase = useCallback(async (localSettings: Partial<UserSettings['value']>) => {
    setState(prev => ({ ...prev, syncing: true, error: null }));

    try {
      const result = await UserSettingsService.saveUserSettings(localSettings);

      if (result.success) {
        setState(prev => ({
          ...prev,
          syncing: false,
          lastSync: Date.now(),
          error: null,
        }));
        return true;
      } else {
        throw new Error(result.error || 'Error sincronizando con Firebase');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        syncing: false,
        error: errorMessage,
      }));
      logger.error('Error sincronizando configuración:', error as Error);
      showNotification('Error sincronizando configuración', 'error');
      return false;
    }
  }, [showNotification]);

  /**
   * Carga la configuración desde Firebase y la sincroniza con IndexedDB
   */
  const loadFromFirebase = useCallback(async () => {
    setState(prev => ({ ...prev, syncing: true, error: null }));

    try {
      const firebaseResult = await UserSettingsService.getUserSettings();

      if (firebaseResult.success && firebaseResult.data) {
        // Guardar en IndexedDB como respaldo
        const currentResult = await getItem<UserSettings>('metadata', 'userSettings');
        const currentSettings = currentResult.success ? currentResult.data : null;

        const newSettings: UserSettings = {
          key: 'userSettings',
          value: {
            ...currentSettings?.value,
            ...firebaseResult.data,
          },
          updatedAt: Date.now(),
        };

        await updateItem<UserSettings>('metadata', newSettings);

        setState(prev => ({
          ...prev,
          syncing: false,
          lastSync: Date.now(),
          error: null,
        }));
        return firebaseResult.data;
      } else {
        setState(prev => ({
          ...prev,
          syncing: false,
          error: null,
        }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        syncing: false,
        error: errorMessage,
      }));
      logger.error('Error cargando configuración desde Firebase:', error as Error);
      showNotification('Error cargando configuración desde Firebase', 'error');
      return null;
    }
  }, [showNotification]);

  /**
   * Sincroniza bidireccionalmente entre Firebase e IndexedDB
   */
  const syncBidirectional = useCallback(async () => {
    setState(prev => ({ ...prev, syncing: true, error: null }));

    try {
      // Obtener configuración de IndexedDB
      const indexedDbResult = await getItem<UserSettings>('metadata', 'userSettings');
      const localSettings = indexedDbResult.success ? indexedDbResult.data?.value : {};

      // Obtener configuración de Firebase
      const firebaseResult = await UserSettingsService.getUserSettings();

      if (firebaseResult.success && firebaseResult.data) {
        // Combinar configuraciones (Firebase tiene prioridad)
        const mergedSettings = {
          ...localSettings,
          ...firebaseResult.data,
          updatedAt: Date.now(),
        };

        // Guardar en ambos lugares
        await UserSettingsService.saveUserSettings(mergedSettings);

        const newSettings: UserSettings = {
          key: 'userSettings',
          value: mergedSettings,
          updatedAt: Date.now(),
        };
        await updateItem<UserSettings>('metadata', newSettings);

        setState(prev => ({
          ...prev,
          syncing: false,
          lastSync: Date.now(),
          error: null,
        }));
        return mergedSettings;
      } else {
        // Solo guardar configuración local en Firebase
        const result = await UserSettingsService.saveUserSettings(localSettings as Partial<UserSettingsData>);

        if (result.success) {
          setState(prev => ({
            ...prev,
            syncing: false,
            lastSync: Date.now(),
            error: null,
          }));
          return localSettings;
        } else {
          throw new Error(result.error || 'Error sincronizando con Firebase');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        syncing: false,
        error: errorMessage,
      }));
      logger.error('Error sincronizando bidireccionalmente:', error as Error);
      showNotification('Error sincronizando configuración', 'error');
      return null;
    }
  }, [showNotification]);

  return {
    state,
    syncToFirebase,
    loadFromFirebase,
    syncBidirectional,
  };
};
