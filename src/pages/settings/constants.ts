import { Bell, Download, Info, User } from 'lucide-react';

import { SettingsItem } from './types';

export const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'volume',
    label: 'Configuración de Volumen',
    icon: User, // Cambiado de Sliders a User para mantener consistencia
    description: 'Personalizar distribución ideal de volumen por grupo muscular',
  },
  {
    id: 'export',
    label: 'Exportar Datos',
    icon: Download,
    description: 'Descargar todos tus datos en JSON, CSV o Excel',
  },
  {
    id: 'profile',
    label: 'Perfil de Usuario',
    icon: User,
    description: 'Configurar información personal',
    disabled: true,
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: Bell,
    description: 'Configurar alertas y recordatorios',
    disabled: true,
  },
  {
    id: 'about',
    label: 'Acerca de',
    icon: Info,
    description: 'Información de la aplicación',
    disabled: true,
  },
];
