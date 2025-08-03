import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { db } from '@/api/firebase';
import { logger } from '@/utils';
import { handleFirebaseError } from './error-handler';

export interface UserSettingsData {
  theme?: 'light' | 'dark';
  language?: string;
  autoSync?: boolean;
  syncInterval?: number; // minutos
  maxCacheSize?: number; // MB
  customVolumeDistribution?: Record<string, number>;
  updatedAt: number;
}

export interface UserSettingsResponse {
  success: boolean;
  data?: UserSettingsData;
  error?: string;
}

/**
 * Servicio para manejar la configuración de usuario en Firebase
 */
export class UserSettingsService {
  private static getUserId(): string {
    // TODO: Implementar obtención del ID del usuario autenticado
    // Por ahora usamos un ID temporal
    // En el futuro, esto debería obtener el ID del usuario autenticado
    return 'default-user';
  }

  private static getUserSettingsDoc() {
    const userId = this.getUserId();
    return doc(db, 'users', userId, 'settings', 'userSettings');
  }

  /**
   * Obtiene la configuración de usuario desde Firebase
   */
  static async getUserSettings(): Promise<UserSettingsResponse> {
    try {
      const docRef = this.getUserSettingsDoc();
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserSettingsData;
        return { success: true, data };
      } else {
        return { success: true, data: undefined };
      }
    } catch (error) {
      handleFirebaseError(error as Error, 'getUserSettings');
      logger.error('Error obteniendo configuración de usuario:', error as Error);
      return { success: false, error: 'Error obteniendo configuración de usuario' };
    }
  }

  /**
   * Guarda la configuración de usuario en Firebase
   */
  static async saveUserSettings(settings: Partial<UserSettingsData>): Promise<UserSettingsResponse> {
    try {
      const docRef = this.getUserSettingsDoc();
      const settingsData: UserSettingsData = {
        ...settings,
        updatedAt: Date.now(),
      };

      await setDoc(docRef, settingsData, { merge: true });

      return { success: true, data: settingsData };
    } catch (error) {
      handleFirebaseError(error as Error, 'saveUserSettings');
      logger.error('Error guardando configuración de usuario:', error as Error);
      return { success: false, error: 'Error guardando configuración de usuario' };
    }
  }

  /**
   * Actualiza solo la configuración de volumen
   */
  static async updateVolumeDistribution(volumeDistribution: Record<string, number>): Promise<UserSettingsResponse> {
    try {
      const docRef = this.getUserSettingsDoc();

      await updateDoc(docRef, {
        customVolumeDistribution: volumeDistribution,
        updatedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      handleFirebaseError(error as Error, 'updateVolumeDistribution');
      logger.error('Error actualizando configuración de volumen:', error as Error);
      return { success: false, error: 'Error actualizando configuración de volumen' };
    }
  }

  /**
   * Sincroniza la configuración local con Firebase
   */
  static async syncWithFirebase(localSettings: Partial<UserSettingsData>): Promise<UserSettingsResponse> {
    try {
      // Primero intentamos obtener la configuración de Firebase
      const firebaseResult = await this.getUserSettings();

      if (!firebaseResult.success) {
        // Si hay error, guardamos la configuración local
        return await this.saveUserSettings(localSettings);
      }

      // Si existe configuración en Firebase, la combinamos con la local
      const mergedSettings = {
        ...firebaseResult.data,
        ...localSettings,
        updatedAt: Date.now(),
      };

      return await this.saveUserSettings(mergedSettings);
    } catch (error) {
      handleFirebaseError(error as Error, 'syncWithFirebase');
      logger.error('Error sincronizando configuración:', error as Error);
      return { success: false, error: 'Error sincronizando configuración' };
    }
  }
} 