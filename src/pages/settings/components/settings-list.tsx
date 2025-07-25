import React from 'react';
import { SETTINGS_ITEMS } from '../constants';
import { SettingsSection } from '../types';
import { SettingsItemComponent } from './settings-item';

interface SettingsListProps {
  onItemClick: (section: SettingsSection) => void;
}

export const SettingsList: React.FC<SettingsListProps> = ({ onItemClick }) => (
  <div className="space-y-3">
    {SETTINGS_ITEMS.map((item) => (
      <SettingsItemComponent
        key={item.id}
        item={item}
        onClick={() => !item.disabled && onItemClick(item.id)}
      />
    ))}
  </div>
); 