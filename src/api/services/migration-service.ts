import { db } from '@/api/firebase';
import { handleFirebaseError } from '@/api/services/error-handler';
import { ExerciseService } from '@/api/services/exercise-service';
import { doc, writeBatch } from 'firebase/firestore';

/**
 * Servicio para operaciones de migración de datos
 */
export class MigrationService {
  /**
   * Migra ejercicios con campo 'category' (string) a 'categories' (array)
   * Esta función actualiza la estructura de datos para soportar múltiples categorías
   */
  static async migrateExercisesToMultipleCategories(): Promise<number> {
    try {
      const exercises = await ExerciseService.getAll();
      const batch = writeBatch(db);
      let migratedCount = 0;

      exercises.forEach((exercise) => {
        // Solo migrar si tiene category (string) pero no categories (array)
        if ('category' in exercise && !exercise.categories) {
          const exerciseRef = doc(db, 'exercises', exercise.id);
          batch.update(exerciseRef, {
            categories: [(exercise as any).category], // Convertir a array
            category: null // Eliminar el campo antiguo
          });
          migratedCount++;
        }
      });

      if (migratedCount > 0) {
        await batch.commit();
        console.log(`✅ Migración completada: ${migratedCount} ejercicios actualizados`);
      } else {
        console.log('ℹ️ No se encontraron ejercicios que requieran migración');
      }

      return migratedCount;
    } catch (error) {
      handleFirebaseError(error, 'migrar ejercicios a categorías múltiples');
      return 0;
    }
  }
}

// Exportar función individual para compatibilidad con código existente
export const migrateExercisesToMultipleCategories = MigrationService.migrateExercisesToMultipleCategories; 