import { db } from '@/api/firebase';
import { handleFirebaseError } from '@/api/services/error-handler';
import type { Exercise } from '@/interfaces';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';

/**
 * Servicio para operaciones CRUD de ejercicios
 */
export class ExerciseService {
  private static readonly COLLECTION = 'exercises';

  /**
   * Crea un nuevo ejercicio
   */
  static async create(exercise: Omit<Exercise, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'exercises'), exercise);
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'crear ejercicio');
      throw error; // Re-lanzar el error después de manejarlo
    }
  }

  /**
   * Obtiene todos los ejercicios
   */
  static async getAll(): Promise<Exercise[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
    } catch (error) {
      handleFirebaseError(error, 'obtener ejercicios');
      return []; // Fallback para evitar crashes
    }
  }

  /**
   * Actualiza un ejercicio existente
   */
  static async update(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
    try {
      await updateDoc(doc(db, 'exercises', exerciseId), updates);
    } catch (error) {
      handleFirebaseError(error, 'actualizar ejercicio');
      throw error; // Re-lanzar el error después de manejarlo
    }
  }

  /**
   * Elimina un ejercicio
   */
  static async delete(exerciseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'exercises', exerciseId));
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