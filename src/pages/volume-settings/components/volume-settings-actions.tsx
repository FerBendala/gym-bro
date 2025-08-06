import { RotateCcw, Save } from 'lucide-react';
import React from 'react';

import { VOLUME_SETTINGS_MESSAGES } from '../constants';
import { isTotalValid } from '../utils';

import { Button } from '@/components/button';

interface VolumeSettingsActionsProps {
  saving: boolean;
  totalPercentage: number;
  onReset: () => void;
  onSave: () => void;
}

export const VolumeSettingsActions: React.FC<VolumeSettingsActionsProps> = ({
  saving,
  totalPercentage,
  onReset,
  onSave,
}) => {
  return (
    <div className="flex items-center justify-between space-x-4 pt-4">
      <Button
        variant="secondary"
        onClick={onReset}
        className="flex items-center space-x-2 text-gray-400 border-gray-600 hover:bg-gray-800"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Restablecer</span>
      </Button>

      <Button
        onClick={onSave}
        disabled={saving || !isTotalValid(totalPercentage)}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{saving ? VOLUME_SETTINGS_MESSAGES.SAVING : VOLUME_SETTINGS_MESSAGES.SAVE_CONFIG}</span>
      </Button>
    </div>
  );
};
