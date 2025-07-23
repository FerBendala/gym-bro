import React from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { AdvancedTab, ExercisesTab, HistoryTab, PredictionsTab } from '../content';
import type { DashboardTab } from '../types';
import { BalanceTab } from './balance-tab';
import { DashboardTabNavigation } from './dashboard-tab-navigation';

interface DashboardTabsProps {
  records: WorkoutRecord[];
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  records,
  activeTab,
  onTabChange
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'balance':
        return <BalanceTab records={records} />;
      case 'advanced':
        return <AdvancedTab records={records} />;
      case 'history':
        return <HistoryTab records={records} />;
      case 'exercises':
        return <ExercisesTab records={records} />;
      case 'predictions':
        return <PredictionsTab records={records} />;
      default:
        return <BalanceTab records={records} />;
    }
  };

  return (
    <>
      <DashboardTabNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        timeFilterLabel="Últimos 30 días"
      />

      <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-xl border border-gray-600/30 p-5 hover:border-gray-500/50 transition-colors duration-200">
        {renderTabContent()}
      </div>
    </>
  );
}; 