import { db } from '@/api/firebase';
import { handleFirebaseError } from '@/api/services/error-handler';
import type { WorkoutRecord } from '@/interfaces';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';

/**
 * Servicio para operaciones CRUD de registros de entrenamiento
 */
export class WorkoutRecordService {
  private static readonly COLLECTION = 'workoutRecords';

  /**
   * Crea un nuevo registro de entrenamiento
   */
  static async create(record: Omit<WorkoutRecord, 'id' | 'date'>, customDate?: Date): Promise<string> {
    try {
      const recordWithDate = {
        ...record,
        date: customDate ? Timestamp.fromDate(customDate) : Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'workoutRecords'), recordWithDate);
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error, 'registrar entrenamiento');
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de entrenamiento ordenados por fecha descendente
   */
  static async getAll(): Promise<WorkoutRecord[]> {
    try {
      const q = query(
        collection(db, 'workoutRecords'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate()
        } as WorkoutRecord;
      });
    } catch (error) {
      handleFirebaseError(error, 'obtener registros de entrenamiento');
      return []; // Fallback para evitar crashes
    }
  }

  /**
   * Obtiene registros de entrenamiento por ejercicio específico
   */
  static async getByExercise(exerciseId: string): Promise<WorkoutRecord[]> {
    try {
      const q = query(
        collection(db, 'workoutRecords'),
        where('exerciseId', '==', exerciseId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate()
        } as WorkoutRecord;
      });
    } catch (error) {
      handleFirebaseError(error, 'obtener historial de ejercicio');
      return []; // Fallback para evitar crashes
    }
  }

  /**
   * Actualiza un registro de entrenamiento existente
   */
  static async update(recordId: string, updates: Partial<WorkoutRecord>): Promise<void> {
    try {
      await updateDoc(doc(db, 'workoutRecords', recordId), updates);
    } catch (error) {
      handleFirebaseError(error, 'actualizar registro de entrenamiento');
      throw error;
    }
  }

  /**
   * Elimina un registro de entrenamiento
   */
  static async delete(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'workoutRecords', recordId));
    } catch (error) {
      handleFirebaseError(error, 'eliminar registro de entrenamiento');
      throw error;
    }
  }
}

// Exportar funciones individuales para compatibilidad con código existente
export const createWorkoutRecord = WorkoutRecordService.create;
export const getWorkoutRecords = WorkoutRecordService.getAll;
export const getWorkoutRecordsByExercise = WorkoutRecordService.getByExercise;
export const updateWorkoutRecord = WorkoutRecordService.update;
export const deleteWorkoutRecord = WorkoutRecordService.delete; 