import { TestTube } from 'lucide-react';
import React from 'react';

import { UserSettingsService } from '@/api/services';
import { useNotification } from '@/stores/notification';
import { logger } from '@/utils';

export const VolumeSettingsTestSync: React.FC = () => {
  const { showNotification } = useNotification();

  const testFirebaseConnection = async () => {
    try {
      // Probar lectura
      const readResult = await UserSettingsService.getUserSettings();

      // Probar escritura
      const testData = {
        customVolumeDistribution: {
          'Pecho': 25,
          'Espalda': 25,
          'Piernas': 25,
          'Hombros': 15,
          'Brazos': 10,
        },
        updatedAt: Date.now(),
      };

      const writeResult = await UserSettingsService.saveUserSettings(testData);

      if (readResult.success && writeResult.success) {
        showNotification('Conexión con Firebase exitosa', 'success');
      } else {
        showNotification('Error en la conexión con Firebase', 'error');
      }
    } catch (error) {
      logger.error('Error probando conexión con Firebase:', error as Error);
      showNotification('Error probando conexión con Firebase', 'error');
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <TestTube className="w-5 h-5 text-yellow-600" />
        <h3 className="font-medium text-yellow-900">Prueba de Sincronización</h3>
      </div>

      <p className="text-sm text-yellow-700 mb-3">
        Este componente permite probar la conexión con Firebase para verificar que la sincronización funciona correctamente.
      </p>

      <button
        onClick={testFirebaseConnection}
        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
      >
        Probar Conexión Firebase
      </button>
    </div>
  );
}; 