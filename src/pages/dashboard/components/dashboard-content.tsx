import React from 'react';

import { AdvancedTab, ExercisesTab, HistoryTab, PredictionsTab } from '../content';
import type { DashboardTab } from '../types';

import { BalanceTab } from './balance-tab';
import { DashboardEmptyState } from './dashboard-empty-state';

import type { WorkoutRecord } from '@/interfaces';

interface DashboardContentProps {
  records: WorkoutRecord[];
  activeTab: DashboardTab;
  isOnline: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  records,
  activeTab,
  isOnline,
}) => {
  if (records.length === 0) {
    return <DashboardEmptyState isOnline={isOnline} />;
  }

  switch (activeTab) {
    case 'balance':
      return <BalanceTab records={records} />;
    case 'history':
      return <HistoryTab records={records} />;
    case 'exercises':
      return <ExercisesTab records={records} />;
    case 'advanced':
      return <AdvancedTab records={records} />;
    case 'predictions':
      return <PredictionsTab records={records} />;
    default:
      return <BalanceTab records={records} />;
  }
};
