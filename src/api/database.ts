import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import type { DayOfWeek, Exercise, ExerciseAssignment, WorkoutRecord } from '../interfaces';
import { db } from './firebase';

// Función helper para manejar errores de Firebase
const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);

  // Errores específicos de Firebase
  if (error.code) {
    switch (error.code) {
      case 'unavailable':
        throw new Error('Base de datos no disponible. Verifica tu conexión a internet.');
      case 'permission-denied':
        throw new Error('No tienes permisos para realizar esta operación.');
      case 'not-found':
        throw new Error('El documento solicitado no existe.');
      case 'already-exists':
        throw new Error('El documento ya existe.');
      case 'resource-exhausted':
        throw new Error('Se ha excedido el límite de operaciones. Intenta más tarde.');
      case 'deadline-exceeded':
        throw new Error('La operación tardó demasiado tiempo. Intenta nuevamente.');
      case 'cancelled':
        throw new Error('La operación fue cancelada.');
      case 'internal':
        throw new Error('Error interno del servidor. Intenta más tarde.');
      case 'unauthenticated':
        throw new Error('No estás autenticado. Inicia sesión nuevamente.');
      default:
        throw new Error(`Error de Firebase: ${error.message || 'Error desconocido'}`);
    }
  }

  // Errores de red
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
  }

  // Error genérico
  throw new Error(`Error en ${operation}: ${error.message || 'Error desconocido'}`);
};

// Exercises
export const createExercise = async (exercise: Omit<Exercise, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'exercises'), exercise);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'crear ejercicio');
  }
};

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'exercises'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
  } catch (error) {
    handleFirebaseError(error, 'obtener ejercicios');
    return []; // Fallback para evitar crashes
  }
};

export const updateExercise = async (exerciseId: string, updates: Partial<Exercise>) => {
  try {
    await updateDoc(doc(db, 'exercises', exerciseId), updates);
  } catch (error) {
    handleFirebaseError(error, 'actualizar ejercicio');
  }
};

export const deleteExercise = async (exerciseId: string) => {
  try {
    await deleteDoc(doc(db, 'exercises', exerciseId));
  } catch (error) {
    handleFirebaseError(error, 'eliminar ejercicio');
  }
};

// Exercise Assignments
export const createExerciseAssignment = async (assignment: Omit<ExerciseAssignment, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'exerciseAssignments'), assignment);

    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'crear asignación de ejercicio');
  }
};

export const getAssignmentsByDay = async (dayOfWeek: DayOfWeek): Promise<ExerciseAssignment[]> => {
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
};

export const updateExerciseAssignment = async (assignmentId: string, updates: Partial<ExerciseAssignment>) => {
  try {
    await updateDoc(doc(db, 'exerciseAssignments', assignmentId), updates);
  } catch (error) {
    handleFirebaseError(error, 'actualizar asignación de ejercicio');
  }
};

export const deleteExerciseAssignment = async (assignmentId: string) => {
  try {
    await deleteDoc(doc(db, 'exerciseAssignments', assignmentId));
  } catch (error) {
    handleFirebaseError(error, 'eliminar asignación de ejercicio');
  }
};

export const updateAssignmentsOrder = async (assignments: ExerciseAssignment[]) => {
  try {
    const batch = writeBatch(db);

    assignments.forEach((assignment) => {
      const assignmentRef = doc(db, 'exerciseAssignments', assignment.id);
      batch.update(assignmentRef, { order: assignment.order });
    });

    await batch.commit();
  } catch (error) {
    handleFirebaseError(error, 'actualizar orden de ejercicios');
  }
};

// Workout Records
export const createWorkoutRecord = async (record: Omit<WorkoutRecord, 'id' | 'date'>, customDate?: Date) => {
  try {
    const recordWithDate = {
      ...record,
      date: customDate ? Timestamp.fromDate(customDate) : Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'workoutRecords'), recordWithDate);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'registrar entrenamiento');
  }
};

export const getWorkoutRecords = async (): Promise<WorkoutRecord[]> => {
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
};

export const getWorkoutRecordsByExercise = async (exerciseId: string): Promise<WorkoutRecord[]> => {
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
};

export const updateWorkoutRecord = async (recordId: string, updates: Partial<WorkoutRecord>) => {
  try {
    await updateDoc(doc(db, 'workoutRecords', recordId), updates);
  } catch (error) {
    handleFirebaseError(error, 'actualizar registro de entrenamiento');
  }
};

export const deleteWorkoutRecord = async (recordId: string) => {
  try {
    await deleteDoc(doc(db, 'workoutRecords', recordId));
  } catch (error) {
    handleFirebaseError(error, 'eliminar registro de entrenamiento');
  }
};

// Función de migración para actualizar ejercicios con category a categories
export const migrateExercisesToMultipleCategories = async () => {
  try {
    const exercises = await getExercises();
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
    }

    return migratedCount;
  } catch (error) {
    handleFirebaseError(error, 'migrar ejercicios a categorías múltiples');
    return 0;
  }
};