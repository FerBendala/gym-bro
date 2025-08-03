import { Info, Shield, Upload } from 'lucide-react';
import React from 'react';

export const VolumeSettingsFirebaseInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-1">
            Configuración Sincronizada con Firebase
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Tu configuración de volumen se guarda automáticamente en la nube y se sincroniza
            entre todos tus dispositivos.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Upload className="w-4 h-4" />
              <span>Guardado automático en la nube</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Info className="w-4 h-4" />
              <span>Acceso desde cualquier dispositivo</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Shield className="w-4 h-4" />
              <span>Datos seguros y respaldados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 