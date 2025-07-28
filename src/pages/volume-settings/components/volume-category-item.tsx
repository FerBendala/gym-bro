import { Card } from '@/components/card';
import { cn } from '@/utils';
import React from 'react';
import { VOLUME_SETTINGS_CONSTANTS } from '../constants';
import type { VolumeCategoryProps } from '../types';

export const VolumeCategoryItem: React.FC<VolumeCategoryProps> = ({
  category,
  percentage,
  defaultValue,
  onVolumeChange,
}) => {
  const isModified = Math.abs(percentage - defaultValue) > VOLUME_SETTINGS_CONSTANTS.TOLERANCE;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{category}</h3>
          <p className="text-sm text-gray-400">
            Por defecto: {defaultValue}%
            {isModified && (
              <span className="ml-2 text-blue-400">• Modificado</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{percentage.toFixed(1)}%</div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="range"
          min={VOLUME_SETTINGS_CONSTANTS.SLIDER.MIN}
          max={VOLUME_SETTINGS_CONSTANTS.SLIDER.MAX}
          step={VOLUME_SETTINGS_CONSTANTS.SLIDER.STEP}
          value={percentage}
          onChange={(e) => onVolumeChange(category, parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <input
          type="number"
          min={VOLUME_SETTINGS_CONSTANTS.INPUT.MIN}
          max={VOLUME_SETTINGS_CONSTANTS.INPUT.MAX}
          step={VOLUME_SETTINGS_CONSTANTS.INPUT.STEP}
          value={percentage}
          onChange={(e) => onVolumeChange(category, parseFloat(e.target.value) || 0)}
          className={cn(
            'w-20 px-3 py-1 rounded-lg text-center text-white bg-gray-800 border border-gray-600',
            'focus:border-blue-500 focus:outline-none'
          )}
        />
      </div>
    </Card>
  );
}; 