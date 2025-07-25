import { DataExport } from '@/components/data-export';
import { AdminPanel } from '@/pages/admin-panel';
import { VolumeSettings } from '@/pages/volume-settings';
import { Bell, Info, User } from 'lucide-react';
import React from 'react';
import { SettingsSection } from '../types';
import { ComingSoonCard } from './coming-soon-card';
import { SectionHeader } from './section-header';

interface SettingsContentProps {
  activeSection: SettingsSection;
  onBack: () => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({ activeSection, onBack }) => {
  switch (activeSection) {
    case 'admin':
      return (
        <div>
          <SectionHeader title="Administración de Ejercicios" onBack={onBack} />
          <AdminPanel isModal={false} onClose={onBack} />
        </div>
      );

    case 'volume':
      return <VolumeSettings onBack={onBack} />;

    case 'export':
      return (
        <div>
          <SectionHeader title="Exportar Datos" onBack={onBack} />
          <DataExport />
        </div>
      );

    case 'profile':
      return (
        <div>
          <SectionHeader title="Perfil de Usuario" onBack={onBack} />
          <ComingSoonCard
            icon={User}
            title="Perfil de Usuario"
            message="Configuración de perfil próximamente"
          />
        </div>
      );

    case 'notifications':
      return (
        <div>
          <SectionHeader title="Notificaciones" onBack={onBack} />
          <ComingSoonCard
            icon={Bell}
            title="Notificaciones"
            message="Configuración de notificaciones próximamente"
          />
        </div>
      );

    case 'about':
      return (
        <div>
          <SectionHeader title="Acerca de" onBack={onBack} />
          <ComingSoonCard
            icon={Info}
            title="GymBro"
            message="Versión 1.0.0 - Tu compañero de entrenamiento personal"
          />
        </div>
      );

    default:
      return null;
  }
}; 