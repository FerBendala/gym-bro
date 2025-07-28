import { db } from '@/api/firebase';
import { handleFirebaseError } from '@/api/services/error-handler';
import type { Exercise } from '@/interfaces';
import { addDoc, collection, deleteDoc, deleteField, doc, FieldValue, getDocs, updateDoc } from 'firebase/firestore';

/**
 * Tipo para objetos que pueden tener campos undefined/null/empty
 */
type PartialObject = Record<string, unknown>;

/**
 * Filtra campos undefined/null/empty de un objeto para Firebase (para creación)
 */
function filterUndefinedFields<T extends PartialObject>(obj: T): Partial<T> {
  const filtered: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      filtered[key as keyof T] = value as T[keyof T];
    }
  }
  return filtered;
}

/**
 * Servicio para operaciones CRUD de ejercicios
 */
export class ExerciseService {
  private static readonly COLLECTION = 'exercises';

  /**
   * Crea un nuevo ejercicio
   * @param exercise Ejercicio a crear sin campo "id"
   * @returns El ID del ejercicio creado
   */
  static async create(exercise: Omit<Exercise, 'id'>): Promise<string> {
    try {
      // Filtrar campos undefined para creación (no usar deleteField)
      const filteredExercise = filterUndefinedFields(exercise);
      const docRef = await addDoc(collection(db, ExerciseService.COLLECTION), filteredExercise);
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'crear ejercicio');
      throw error; // Re-lanzar el error después de manejarlo
    }
  }

  /**
   * Obtiene todos los ejercicios almacenados en la colección de Firebase
   * @returns Una promesa que resuelve a un arreglo de ejercicios
   */
  static async getAll(): Promise<Exercise[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ExerciseService.COLLECTION));
      const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
      return exercises;
    } catch (error) {
      console.error('🔥 ExerciseService.getAll - Error:', error);
      handleFirebaseError(error, 'obtener ejercicios');
      return []; // Fallback para evitar crashes
    }
  }

  /**
   * Actualiza un ejercicio existente
   * @param exerciseId ID del ejercicio a actualizar
   * @param updates Actualizaciones parciales del ejercicio
   * @throws Error si hay un problema al actualizar el ejercicio
   */
  static async update(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
    try {
      // Preparar actualizaciones para Firebase (incluyendo eliminación de campos)
      const preparedUpdates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === '') {
          // Usar deleteField para eliminar campos vacíos
          preparedUpdates[key] = deleteField();
        } else {
          preparedUpdates[key] = value;
        }
      }
      await updateDoc(doc(db, ExerciseService.COLLECTION, exerciseId), preparedUpdates as Record<string, FieldValue>);
    } catch (error) {
      handleFirebaseError(error, 'actualizar ejercicio');
      throw error; // Re-lanzar el error después de manejarlo
    }
  }

  /**
   * Elimina un ejercicio de la colección de Firebase
   * @param exerciseId ID del ejercicio a eliminar
   * @throws Error si hay un problema al eliminar el ejercicio
   */
  static async delete(exerciseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ExerciseService.COLLECTION, exerciseId));
    } catch (error) {
      handleFirebaseError(error, 'eliminar ejercicio');
      throw error; // Re-lanzar el error después de manejarlo
    }
  }
}

// Exportar funciones individuales para compatibilidad con código existente
export const createExercise = ExerciseService.create;
export const getExercises = ExerciseService.getAll;
export const updateExercise = ExerciseService.update;
export const deleteExercise = ExerciseService.delete; 