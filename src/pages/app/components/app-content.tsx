import { useCallback, useState } from 'react';

import { useHistoryFilter, usePageInfo } from '../hooks';
import { getCurrentDayInfo } from '../utils';

import { AdminModal } from './admin-modal';

import { Layout, useModernNavigation } from '@/components/layout';
import { Notification } from '@/components/notification';
import type { DayOfWeek } from '@/interfaces';
import { ModernCalendar } from '@/pages/calendar';
import { ChatPage } from '@/pages/chat';
import { DashboardPage } from '@/pages/dashboard';
import { ModernHome } from '@/pages/home';
import { ModernSettings } from '@/pages/settings';
import { WorkoutHistory } from '@/pages/workout-history';

export const AppContent = () => {
  const { activeTab, navigateTo, goBack, canGoBack, clearNavigationParams } = useModernNavigation();
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeDay, setActiveDay] = useState<DayOfWeek>(() => getCurrentDayInfo());

  // Estado del chat
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(true);

  const { historyFilter, handleGoToHistory } = useHistoryFilter(activeTab);
  const pageInfo = usePageInfo(activeTab, activeDay);

  const handleTabChange = (tab: string) => {
    // Solo limpiar parámetros si se navega a una página diferente (no al dashboard)
    if (tab !== activeTab && tab !== 'progress') {
      clearNavigationParams();
    }
    navigateTo(tab as any);
  };

  const handleChatMessage = useCallback((message: string) => {
    console.log('Mensaje del chat recibido:', message);
    // Aquí podrías manejar el envío del mensaje
    setIsChatLoading(true);
    // Simular envío de mensaje
    setTimeout(() => {
      setIsChatLoading(false);
    }, 2000);
  }, []);

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
      case 'chat':
        return <ChatPage />;
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
      onTabChange={handleTabChange}
      title={activeTab === 'chat' ? 'GymBro - Entrenador Personal' : pageInfo.title}
      subtitle={pageInfo.subtitle}
      showBackButton={canGoBack}
      onBackClick={goBack}
      onChatMessage={activeTab === 'chat' ? handleChatMessage : undefined}
      isChatLoading={activeTab === 'chat' ? isChatLoading : false}
      isChatConnected={activeTab === 'chat' ? isChatConnected : true}
    >
      {renderContent()}

      <AdminModal show={showAdmin} onClose={() => setShowAdmin(false)} />

      <Notification />
    </Layout>
  );
};
