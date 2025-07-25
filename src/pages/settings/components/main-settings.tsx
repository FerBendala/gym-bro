import { MODERN_THEME } from '@/constants/theme/index.constants';
import { cn } from '@/utils/functions';
import { Shield } from 'lucide-react';
import React from 'react';
import { SettingsSection } from '../types';
import { SettingsHeader } from './settings-header';
import { SettingsList } from './settings-list';

interface MainSettingsProps {
  onItemClick: (section: SettingsSection) => void;
}

export const MainSettings: React.FC<MainSettingsProps> = ({ onItemClick }) => (
  <div className="space-y-4">
    <SettingsHeader title="Configuración" />

    <SettingsList onItemClick={onItemClick} />

    {/* Información adicional */}
    <div className={cn(
      'mt-8 p-4 rounded-xl',
      MODERN_THEME.components.card.base
    )}>
      <div className="flex items-center space-x-3 mb-3">
        <Shield className="w-5 h-5 text-green-500" />
        <h3 className="font-semibold text-white">Datos Seguros</h3>
      </div>
      <p className="text-sm text-gray-400">
        Todos tus datos se almacenan de forma segura y se sincronizan automáticamente
        cuando tienes conexión a internet.
      </p>
    </div>
  </div>
); 