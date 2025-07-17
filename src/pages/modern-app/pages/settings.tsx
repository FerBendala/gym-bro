import { Bell, Database, Download, Info, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { AdminPanelPage } from '../../../components/admin-panel/admin-panel-page';
import { DataExport } from '../../../components/data-export';
import { MODERN_THEME } from '../../../constants/modern-theme';
import { cn } from '../../../utils/functions';

type SettingsSection = 'main' | 'admin' | 'export' | 'profile' | 'notifications' | 'about';

interface SettingsItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  disabled?: boolean;
}

/**
 * Página de configuración con administración de ejercicios y exportación de datos
 * Incluye navegación a diferentes secciones de configuración
 */
export const ModernSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');

  const settingsItems: SettingsItem[] = [
    {
      id: 'admin',
      label: 'Administración de Ejercicios',
      icon: Database,
      description: 'Gestionar ejercicios y asignaciones por día'
    },
    {
      id: 'export',
      label: 'Exportar Datos',
      icon: Download,
      description: 'Descargar todos tus datos en JSON, CSV o Excel'
    },
    {
      id: 'profile',
      label: 'Perfil de Usuario',
      icon: User,
      description: 'Configurar información personal',
      disabled: true
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      description: 'Configurar alertas y recordatorios',
      disabled: true
    },
    {
      id: 'about',
      label: 'Acerca de',
      icon: Info,
      description: 'Información de la aplicación',
      disabled: true
    }
  ];

  const renderMainSettings = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Configuración</h2>
        <p className="text-gray-400">Personaliza tu experiencia en GymBro</p>
      </div>

      {/* Lista de opciones de configuración */}
      <div className="space-y-3">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setActiveSection(item.id)}
            disabled={item.disabled}
            className={cn(
              'w-full p-4 rounded-xl text-left transition-all duration-200',
              MODERN_THEME.components.card.base,
              MODERN_THEME.touch.tap,
              MODERN_THEME.accessibility.focusRing,
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-800/50 active:scale-[0.98]'
            )}
          >
            <div className="flex items-center space-x-4">
              <div className={cn(
                'p-3 rounded-lg',
                item.disabled
                  ? 'bg-gray-800/50'
                  : 'bg-blue-600/20 text-blue-400'
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  'font-semibold',
                  item.disabled ? 'text-gray-500' : 'text-white'
                )}>
                  {item.label}
                </h3>
                <p className={cn(
                  'text-sm',
                  item.disabled ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {item.description}
                </p>
              </div>
              {!item.disabled && (
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

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

  const renderSectionHeader = (title: string, onBack: () => void) => (
    <div className="flex items-center space-x-4 mb-6">
      <button
        onClick={onBack}
        className={cn(
          'p-2 rounded-lg',
          MODERN_THEME.components.button.base,
          MODERN_THEME.touch.tap,
          MODERN_THEME.accessibility.focusRing
        )}
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'main':
        return renderMainSettings();

      case 'admin':
        return (
          <div>
            {renderSectionHeader('Administración de Ejercicios', () => setActiveSection('main'))}
            <AdminPanelPage />
          </div>
        );

      case 'export':
        return (
          <div>
            {renderSectionHeader('Exportar Datos', () => setActiveSection('main'))}
            <DataExport />
          </div>
        );

      case 'profile':
        return (
          <div>
            {renderSectionHeader('Perfil de Usuario', () => setActiveSection('main'))}
            <div className={cn(
              'p-6 rounded-xl text-center',
              MODERN_THEME.components.card.base
            )}>
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Configuración de perfil próximamente</p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            {renderSectionHeader('Notificaciones', () => setActiveSection('main'))}
            <div className={cn(
              'p-6 rounded-xl text-center',
              MODERN_THEME.components.card.base
            )}>
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Configuración de notificaciones próximamente</p>
            </div>
          </div>
        );

      case 'about':
        return (
          <div>
            {renderSectionHeader('Acerca de', () => setActiveSection('main'))}
            <div className={cn(
              'p-6 rounded-xl text-center',
              MODERN_THEME.components.card.base
            )}>
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="font-semibold text-white">GymBro</h3>
                <p className="text-gray-400">Versión 1.0.0</p>
                <p className="text-sm text-gray-500">Tu compañero de entrenamiento personal</p>
              </div>
            </div>
          </div>
        );

      default:
        return renderMainSettings();
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}; 