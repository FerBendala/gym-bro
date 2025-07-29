import { useState } from 'react';

import { useHistoryFilter, usePageInfo } from '../hooks';
import { getCurrentDayInfo } from '../utils';

import { AdminModal } from './admin-modal';

import { Layout, useModernNavigation } from '@/components/layout';
import { Notification } from '@/components/notification';
import type { DayOfWeek } from '@/interfaces';
import { ModernCalendar } from '@/pages/calendar';
import { DashboardPage } from '@/pages/dashboard';
import { ModernHome } from '@/pages/home';
import { ModernSettings } from '@/pages/settings';
import { WorkoutHistory } from '@/pages/workout-history';

export const AppContent = () => {
  const { activeTab, navigateTo, goBack, canGoBack } = useModernNavigation();
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeDay, setActiveDay] = useState<DayOfWeek>(() => getCurrentDayInfo());

  const { historyFilter, handleGoToHistory } = useHistoryFilter(activeTab);
  const pageInfo = usePageInfo(activeTab, activeDay);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ModernHome
            activeDay={activeDay}
            onDayChange={setActiveDay}
            onOpenAdmin={() => setShowAdmin(true)}
            onGoToHistory={handleGoToHistory}
          />
        );
      case 'progress':
        return <DashboardPage />;
      case 'calendar':
        return <ModernCalendar />;
      case 'settings':
        return <ModernSettings />;
      case 'history':
        return <WorkoutHistory initialFilter={historyFilter} />;
      default:
        return (
          <ModernHome
            activeDay={activeDay}
            onDayChange={setActiveDay}
            onOpenAdmin={() => setShowAdmin(true)}
            onGoToHistory={handleGoToHistory}
          />
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={navigateTo}
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      showBackButton={canGoBack}
      onBackClick={goBack}
    >
      {renderContent()}

      <AdminModal show={showAdmin} onClose={() => setShowAdmin(false)} />

      <Notification />
    </Layout>
  );
};
