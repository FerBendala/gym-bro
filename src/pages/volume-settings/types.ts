export interface VolumeSettingsProps {
  onBack: () => void;
}

export interface VolumeDistribution {
  [category: string]: number;
}

export interface VolumeSettingsState {
  volumeDistribution: VolumeDistribution;
  loading: boolean;
  saving: boolean;
}

export interface VolumeCategoryProps {
  category: string;
  percentage: number;
  defaultValue: number;
  onVolumeChange: (category: string, value: number) => void;
} 