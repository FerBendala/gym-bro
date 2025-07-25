import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants/exercise.constants';
import React from 'react';
import type { VolumeDistribution } from '../types';
import { VolumeCategoryItem } from './volume-category-item';

interface VolumeCategoriesListProps {
  volumeDistribution: VolumeDistribution;
  onVolumeChange: (category: string, value: number) => void;
}

export const VolumeCategoriesList: React.FC<VolumeCategoriesListProps> = ({
  volumeDistribution,
  onVolumeChange,
}) => {
  return (
    <div className="space-y-4">
      {Object.entries(volumeDistribution).map(([category, percentage]) => {
        const defaultValue = IDEAL_VOLUME_DISTRIBUTION[category] || 0;

        return (
          <VolumeCategoryItem
            key={category}
            category={category}
            percentage={percentage}
            defaultValue={defaultValue}
            onVolumeChange={onVolumeChange}
          />
        );
      })}
    </div>
  );
}; 