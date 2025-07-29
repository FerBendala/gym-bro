export type SettingsSection = 'main' | 'admin' | 'export' | 'profile' | 'notifications' | 'about' | 'volume';

export interface SettingsItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  disabled?: boolean;
}
