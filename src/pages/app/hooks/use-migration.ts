import { migrateExercisesToMultipleCategories } from '@/api/services';
import { useNotification } from '@/stores/notification-store';
import { useEffect } from 'react';

export const useMigration = () => {
  const { showNotification } = useNotification();

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
}; 