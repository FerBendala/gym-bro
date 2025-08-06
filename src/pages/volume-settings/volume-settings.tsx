import React from 'react';

import {
  TotalPercentageCard,
  VolumeCategoriesList,
  VolumeSettingsActions,
  VolumeSettingsHeader,
  VolumeSettingsTips,
} from './components';
import { VOLUME_SETTINGS_MESSAGES } from './constants';
import { useVolumeSettings } from './hooks';
import type { VolumeSettingsProps } from './types';

export const VolumeSettings: React.FC<VolumeSettingsProps> = ({ onBack }) => {
  const {
    state,
    totalPercentage,
    handleVolumeChange,
    handleSave,
    handleReset,
    handleNormalize,
  } = useVolumeSettings();

  if (state.loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400">{VOLUME_SETTINGS_MESSAGES.LOADING}</div>
      </div>
    );
  }

  const handleSaveAndBack = async () => {
    const success = await handleSave();
    if (success) {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <VolumeSettingsHeader onBack={onBack} />

      <TotalPercentageCard
        totalPercentage={totalPercentage}
        onNormalize={handleNormalize}
      />

      <VolumeCategoriesList
        volumeDistribution={state.volumeDistribution}
        onVolumeChange={handleVolumeChange}
      />

      <VolumeSettingsActions
        saving={state.saving}
        totalPercentage={totalPercentage}
        onReset={handleReset}
        onSave={handleSaveAndBack}
      />

      <VolumeSettingsTips />
    </div>
  );
};
