import { db } from '@/api/firebase';
import type { DayOfWeek, ExerciseAssignment } from '@/interfaces';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { handleFirebaseError } from './error-handler';


/**
 * Servicio para operaciones CRUD de asignaciones de ejercicios
 */
export class ExerciseAssignmentService {
  private static readonly COLLECTION = 'exerciseAssignments';

  /**
   * Crea una nueva asignación de ejercicio
   * @param assignment Asignación de ejercicio sin campo "id"
   * @returns El ID de la asignación creada
   */
  static async create(assignment: Omit<ExerciseAssignment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, ExerciseAssignmentService.COLLECTION), assignment);
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'crear asignación de ejercicio');
      throw error;
    }
  }

  /**
   * Obtiene las asignaciones de ejercicios para un día específico de la semana
   * @param dayOfWeek Día de la semana para el cual obtener las asignaciones
   * @returns Una promesa que resuelve a un arreglo de asignaciones de ejercicios
   * @throws Error si hay un problema al obtener las asignaciones
   */
  static async getByDay(dayOfWeek: DayOfWeek): Promise<ExerciseAssignment[]> {
    try {
      const q = query(
        collection(db, ExerciseAssignmentService.COLLECTION),
        where('dayOfWeek', '==', dayOfWeek)
      );
      const querySnapshot = await getDocs(q);
      const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExerciseAssignment));

      return assignments;
    } catch (error) {
      console.error('❌ Error obteniendo asignaciones:', error);
      handleFirebaseError(error, 'obtener asignaciones de ejercicios');
      return []; // Fallback para evitar crashes
    }
  }

  /**
   * Obtiene todas las asignaciones de ejercicios almacenadas en la colección de Firebase
   * @returns Una promesa que resuelve a un arreglo de asignaciones de ejercicios
   * @throws Error si hay un problema al obtener las asignaciones
   */
  static async getAll(): Promise<ExerciseAssignment[]> {
    try {
      const q = query(collection(db, ExerciseAssignmentService.COLLECTION));
      const querySnapshot = await getDocs(q);
      const assignments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExerciseAssignment));

      return assignments;
    } catch (error) {
      console.error('❌ Error obteniendo todas las asignaciones:', error);
      handleFirebaseError(error, 'obtener todas las asignaciones de ejercicios');
      return []; // Fallback para evitar crashes
    }
  }

  /**
   * Actualiza una asignación de ejercicio existente
   * @param assignmentId ID de la asignación a actualizar
   * @param updates Actualizaciones parciales de la asignación
   * @throws Error si hay un problema al actualizar la asignación
   */
  static async update(assignmentId: string, updates: Partial<ExerciseAssignment>): Promise<void> {
    try {
      await updateDoc(doc(db, ExerciseAssignmentService.COLLECTION, assignmentId), updates);
    } catch (error) {
      handleFirebaseError(error, 'actualizar asignación de ejercicio');
      throw error;
    }
  }

  /**
   * Elimina una asignación de ejercicio existente
   * @param assignmentId ID de la asignación a eliminar
   * @throws Error si hay un problema al eliminar la asignación
   */
  static async delete(assignmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ExerciseAssignmentService.COLLECTION, assignmentId));
    } catch (error) {
      handleFirebaseError(error, 'eliminar asignación de ejercicio');
      throw error;
    }
  }

  /**
   * Actualiza el orden de una lista de asignaciones de ejercicios en batch
   * @param assignments Arreglo de asignaciones de ejercicios con el nuevo orden
   * @throws Error si hay un problema al actualizar el orden de las asignaciones
   */
  static async updateOrder(assignments: ExerciseAssignment[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      assignments.forEach((assignment) => {
        const assignmentRef = doc(db, ExerciseAssignmentService.COLLECTION, assignment.id);
        batch.update(assignmentRef, { order: assignment.order });
      });

      await batch.commit();
    } catch (error) {
      handleFirebaseError(error, 'actualizar orden de ejercicios');
      throw error;
    }
  }
}

// Exportar funciones individuales para compatibilidad con código existente
export const createExerciseAssignment = ExerciseAssignmentService.create;
export const getAssignmentsByDay = ExerciseAssignmentService.getByDay;
export const getAllAssignments = ExerciseAssignmentService.getAll;
export const updateExerciseAssignment = ExerciseAssignmentService.update;
export const deleteExerciseAssignment = ExerciseAssignmentService.delete;
export const updateAssignmentsOrder = ExerciseAssignmentService.updateOrder; 