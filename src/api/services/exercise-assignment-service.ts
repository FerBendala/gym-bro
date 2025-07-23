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
   */
  static async create(assignment: Omit<ExerciseAssignment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'exerciseAssignments'), assignment);
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'crear asignación de ejercicio');
      throw error;
    }
  }

  /**
   * Obtiene asignaciones por día de la semana
   */
  static async getByDay(dayOfWeek: DayOfWeek): Promise<ExerciseAssignment[]> {
    try {
      const q = query(
        collection(db, 'exerciseAssignments'),
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
   * Obtiene todas las asignaciones de ejercicios para detectar días de entrenamiento
   */
  static async getAll(): Promise<ExerciseAssignment[]> {
    try {
      const q = query(collection(db, 'exerciseAssignments'));
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
   */
  static async update(assignmentId: string, updates: Partial<ExerciseAssignment>): Promise<void> {
    try {
      await updateDoc(doc(db, 'exerciseAssignments', assignmentId), updates);
    } catch (error) {
      handleFirebaseError(error, 'actualizar asignación de ejercicio');
      throw error;
    }
  }

  /**
   * Elimina una asignación de ejercicio
   */
  static async delete(assignmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'exerciseAssignments', assignmentId));
    } catch (error) {
      handleFirebaseError(error, 'eliminar asignación de ejercicio');
      throw error;
    }
  }

  /**
   * Actualiza el orden de múltiples asignaciones en lote
   */
  static async updateOrder(assignments: ExerciseAssignment[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      assignments.forEach((assignment) => {
        const assignmentRef = doc(db, 'exerciseAssignments', assignment.id);
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