import React from 'react';

import { VOLUME_SETTINGS_TIPS } from '../constants';

import { Card } from '@/components/card';

export const VolumeSettingsTips: React.FC = () => {
  return (
    <Card className="p-4 bg-gray-800/50">
      <h3 className="font-semibold text-white mb-2">💡 Consejos</h3>
      <ul className="text-sm text-gray-400 space-y-1">
        {VOLUME_SETTINGS_TIPS.map((tip, index) => (
          <li key={index}>• {tip}</li>
        ))}
      </ul>
    </Card>
  );
};
