/**
 * Índice de servicios de base de datos
 * Exporta todos los servicios y funciones individuales para compatibilidad
 */

// Error handling
export { handleFirebaseError } from './error-handler';

// Exercise services
export {
  createExercise, deleteExercise, ExerciseService, getExercises,
  updateExercise
} from './exercise-service';

// Exercise assignment services
export { createExerciseAssignment, deleteExerciseAssignment, ExerciseAssignmentService, getAllAssignments, getAssignmentsByDay, updateAssignmentsOrder, updateExerciseAssignment } from './exercise-assignment-service';

// Workout record services
export {
  createWorkoutRecord, deleteWorkoutRecord, getWorkoutRecords,
  getWorkoutRecordsByExercise,
  updateWorkoutRecord, WorkoutRecordService
} from './workout-record-service';

// Migration services
export { migrateExercisesToMultipleCategories, MigrationService } from './migration-service';
