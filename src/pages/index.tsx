import { migrateExercisesToMultipleCategories } from '@/api/services';
import { ModernLayout, useModernNavigation } from '@/components/modern-ui';
import { Notification } from '@/components/notification';
import { NotificationProvider, useNotification } from '@/context/notification-context';
import type { DayOfWeek } from '@/interfaces';
import { useEffect, useState } from 'react';
import { ModernAdminPanel } from './admin-panel';
import { ModernCalendar } from './calendar';
import { ModernHome } from './home';
import { ModernProgress } from './progress';
import { ModernSettings } from './settings';
import { WorkoutHistory } from './workout-history';

const ModernAppContent = () => {
  const { activeTab, navigateTo, goBack, canGoBack } = useModernNavigation('home');
  const [activeDay, setActiveDay] = useState<DayOfWeek>('lunes');
  const [showAdmin, setShowAdmin] = useState(false);
  const { showNotification } = useNotification();

  // Estado para el filtro inicial del historial
  const [historyFilter, setHistoryFilter] = useState<{ exerciseId?: string, exerciseName?: string } | null>(null);

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

  // Función para navegar al historial con filtro
  const handleGoToHistory = (exerciseId: string, exerciseName: string) => {
    setHistoryFilter({ exerciseId, exerciseName });
    navigateTo('history');
  };

  // Limpiar filtro cuando cambie de tab (excepto si va a historial)
  useEffect(() => {
    if (activeTab !== 'history') {
      setHistoryFilter(null);
    }
  }, [activeTab]);

  // Obtener información del día actual
  const getCurrentDayInfo = () => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const dayMap: Record<string, DayOfWeek> = {
      'lunes': 'lunes',
      'martes': 'martes',
      'miércoles': 'miércoles',
      'jueves': 'jueves',
      'viernes': 'viernes',
      'sábado': 'sábado',
      'domingo': 'domingo'
    };
    return dayMap[today] || 'lunes';
  };

  // Auto-seleccionar el día actual al cargar
  useEffect(() => {
    const currentDay = getCurrentDayInfo();
    setActiveDay(currentDay);
  }, []);

  // Función para obtener el título y subtítulo según la pestaña activa
  const getPageInfo = (): { title: string; subtitle?: string } => {
    switch (activeTab) {
      case 'home':
        return {
          title: 'Entrenamientos',
          subtitle: `${activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} • ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
        };
      case 'progress':
        return {
          title: 'Mi Progreso',
          subtitle: 'Análisis de rendimiento y mejoras'
        };
      case 'calendar':
        return {
          title: 'Calendario',
          subtitle: 'Vista mensual de entrenamientos'
        };
      case 'settings':
        return {
          title: 'Configuración',
          subtitle: 'Ejercicios y preferencias'
        };
      case 'history':
        return {
          title: 'Historial de Entrenamientos',
          subtitle: 'Resumen de tus entrenamientos'
        };
      default:
        return { title: 'Gym Tracker' };
    }
  };

  const pageInfo = getPageInfo();

  // Renderizar contenido según la pestaña activa
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
        return <ModernProgress />;
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
    <ModernLayout
      activeTab={activeTab}
      onTabChange={navigateTo}
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      showBackButton={canGoBack}
      onBackClick={goBack}
      navigationType="compact"
    >
      {renderContent()}

      {/* Modal del panel de administración */}
      {showAdmin && (
        <ModernAdminPanel
          isModal={true}
          onClose={() => setShowAdmin(false)}
        />
      )}

      <Notification />
    </ModernLayout>
  );
};

const ModernApp = () => {
  return (
    <NotificationProvider>
      <ModernAppContent />
    </NotificationProvider>
  );
};

export default ModernApp; 