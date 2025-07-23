import { db } from '@/api/firebase';
import { handleFirebaseError } from '@/api/services/error-handler';
import type { Exercise } from '@/interfaces';
import { addDoc, collection, deleteDoc, deleteField, doc, getDocs, updateDoc } from 'firebase/firestore';

/**
 * Filtra campos undefined de un objeto para Firebase (para creación)
 */
function filterUndefinedFields(obj: any): any {
  const filtered: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value;
    }
  }
  return filtered;
}

/**
 * Filtra campos undefined de un objeto para Firebase y maneja eliminación de campos (para actualización)
 */
function prepareUpdatesForFirebase(obj: any): any {
  const prepared: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') {
      // Usar deleteField para eliminar campos vacíos
      prepared[key] = deleteField();
    } else {
      prepared[key] = value;
    }
  }
  return prepared;
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
      console.log('🔥 ExerciseService.getAll - Iniciando consulta a Firebase');
      const querySnapshot = await getDocs(collection(db, ExerciseService.COLLECTION));
      const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
      console.log('🔥 ExerciseService.getAll - Ejercicios obtenidos:', exercises);
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
      const preparedUpdates = prepareUpdatesForFirebase(updates);
      await updateDoc(doc(db, ExerciseService.COLLECTION, exerciseId), preparedUpdates);
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