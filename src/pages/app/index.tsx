import { useEffect, useState } from 'react';
import { migrateExercisesToMultipleCategories } from '../../api/database';
import { AdminPanel } from '../../components/admin-panel';
import { Dashboard } from '../../components/dashboard';
import { ExerciseList } from '../../components/exercise-list';
import { Notification } from '../../components/notification';
import { TabNavigation } from '../../components/tab-navigation';
import { THEME_RESPONSIVE } from '../../constants/theme';
import { NotificationProvider, useNotification } from '../../context/notification-context';
import type { DayOfWeek } from '../../interfaces';
import { Header } from '../../layout/header';
import { cn } from '../../utils/functions/style-utils';

const AppContent = () => {
  const [activeDay, setActiveDay] = useState<DayOfWeek>('lunes');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { showNotification } = useNotification();

  // Ejecutar migración al cargar la aplicación
  useEffect(() => {
    const runMigration = async () => {
      try {
        const migratedCount = await migrateExercisesToMultipleCategories();
        if (migratedCount > 0) {
          showNotification(
            `${migratedCount} ejercicio${migratedCount > 1 ? 's' : ''} actualizado${migratedCount > 1 ? 's' : ''} al nuevo sistema de categorías múltiples`,
            'info'
          );
        }
      } catch (error) {
        console.error('Error en migración:', error);
      }
    };

    runMigration();
  }, [showNotification]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenDashboard={() => setShowDashboard(true)}
      />
      <TabNavigation activeDay={activeDay} onDayChange={setActiveDay} />
      <main className={cn(
        THEME_RESPONSIVE.container.base,
        THEME_RESPONSIVE.container.maxWidths.xl,
        THEME_RESPONSIVE.spacing.section.mobile,
        THEME_RESPONSIVE.spacing.section.tablet,
        THEME_RESPONSIVE.spacing.section.desktop
      )}>
        <ExerciseList
          dayOfWeek={activeDay}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      </main>

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {showDashboard && (
        <Dashboard onClose={() => setShowDashboard(false)} />
      )}

      <Notification />
    </div>
  );
};

const App = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;