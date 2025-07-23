# Database Services

This folder contains the modularized services for Follow Gym database operations.

## Structure

```plainText
services/
├── error-handler.ts                # Centralized error handling
├── exercise-service.ts             # CRUD operations for exercises
├── exercise-assignment-service.ts  # Operations for assignments
├── workout-record-service.ts       # Operations for workout records
├── migration-service.ts            # Data migration functions
├── index.ts                        # Centralized exports
└── readme.md                     # This documentation
```

## Available Services

### ErrorHandler

- `handleFirebaseError(error, operation)` - Handles Firebase errors with user-friendly messages

### ExerciseService

Static class with methods to manage exercises:

- `create(exercise)` - Create new exercise
- `getAll()` - Get all exercises
- `update(id, updates)` - Update exercise
- `delete(id)` - Delete exercise

### ExerciseAssignmentService

Static class to manage exercise assignments:

- `create(assignment)` - Create new assignment
- `getByDay(dayOfWeek)` - Get assignments by day
- `getAll()` - Get all assignments
- `update(id, updates)` - Update assignment
- `delete(id)` - Delete assignment
- `updateOrder(assignments)` - Update order in batch

### WorkoutRecordService

Static class to manage workout records:

- `create(record, customDate?)` - Create new record
- `getAll()` - Get all records
- `getByExercise(exerciseId)` - Get records by exercise
- `update(id, updates)` - Update record
- `delete(id)` - Delete record

### MigrationService

Static class for migration operations:

- `migrateExercisesToMultipleCategories()` - Migrate exercises to multiple categories

## Usage

### Import complete services

```typescript
import { ExerciseService } from '@/api/services/exercise-service';
import { WorkoutRecordService } from '@/api/services/workout-record-service';

// Use static methods
const exercises = await ExerciseService.getAll();
const record = await WorkoutRecordService.create(workoutData);
```

### Import individual functions

```typescript
import { createExercise, getExercises } from '@/api/services/exercise-service';
import { createWorkoutRecord } from '@/api/services/workout-record-service';

// Use functions directly
const exerciseId = await createExercise(exerciseData);
const exercises = await getExercises();
```

### Import from index

```typescript
import {
  ExerciseService,
  WorkoutRecordService,
  createExercise,
  getWorkoutRecords,
} from '@/api/services';

// Use any of the options
const exercises = await ExerciseService.getAll();
const records = await getWorkoutRecords();
```
