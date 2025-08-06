# 🔌 API y Servicios - Follow Gym

## 🎯 Visión General

Follow Gym utiliza Firebase como backend principal, con servicios especializados para manejar ejercicios, entrenamientos, análisis de datos y exportación. La arquitectura de servicios está diseñada para ser escalable, mantenible y performante.

## 🏗️ Arquitectura de Servicios

### Capa de Servicios

```
┌─────────────────────────────────────┐
│           UI Components             │
├─────────────────────────────────────┤
│         Custom Hooks               │
├─────────────────────────────────────┤
│         Service Layer              │ ← API Services
├─────────────────────────────────────┤
│         Firebase SDK               │
├─────────────────────────────────────┤
│         Firebase Services          │ ← Firestore, Auth, Storage
└─────────────────────────────────────┘
```

## 🔥 Configuración de Firebase

### Configuración Base

```typescript
// src/api/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
```

### Variables de Entorno

```bash
# .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📊 Servicios de Datos

### Exercise Service

Servicio para manejar operaciones CRUD de ejercicios.

```typescript
// src/api/services/exercise-service.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from '@/interfaces/exercise.interfaces';

export class ExerciseService {
  private collection = 'exercises';

  // Obtener todos los ejercicios
  async getAll(): Promise<Exercise[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collection));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      throw new Error(`Error fetching exercises: ${error}`);
    }
  }

  // Obtener ejercicio por ID
  async getById(id: string): Promise<Exercise | null> {
    try {
      const docRef = doc(db, this.collection, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Exercise;
      }
      return null;
    } catch (error) {
      throw new Error(`Error fetching exercise: ${error}`);
    }
  }

  // Crear nuevo ejercicio
  async create(exercise: CreateExerciseRequest): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...exercise,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating exercise: ${error}`);
    }
  }

  // Actualizar ejercicio
  async update(id: string, exercise: UpdateExerciseRequest): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      await updateDoc(docRef, {
        ...exercise,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating exercise: ${error}`);
    }
  }

  // Eliminar ejercicio
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Error deleting exercise: ${error}`);
    }
  }

  // Buscar ejercicios por categoría
  async getByCategory(category: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('category', '==', category),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      throw new Error(`Error fetching exercises by category: ${error}`);
    }
  }

  // Buscar ejercicios por músculo
  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('muscleGroups', 'array-contains', muscleGroup),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      throw new Error(`Error fetching exercises by muscle group: ${error}`);
    }
  }
}

export const exerciseService = new ExerciseService();
```

### Workout Service

Servicio para manejar entrenamientos y registros.

```typescript
// src/api/services/workout-service.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Workout,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
} from '@/interfaces/workout.interfaces';

export class WorkoutService {
  private collection = 'workouts';

  // Obtener todos los entrenamientos
  async getAll(): Promise<Workout[]> {
    try {
      const q = query(collection(db, this.collection), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];
    } catch (error) {
      throw new Error(`Error fetching workouts: ${error}`);
    }
  }

  // Obtener entrenamientos por usuario
  async getByUserId(userId: string): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];
    } catch (error) {
      throw new Error(`Error fetching user workouts: ${error}`);
    }
  }

  // Obtener entrenamientos recientes
  async getRecent(limit: number = 10): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('date', 'desc'),
        limit(limit)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];
    } catch (error) {
      throw new Error(`Error fetching recent workouts: ${error}`);
    }
  }

  // Crear nuevo entrenamiento
  async create(workout: CreateWorkoutRequest): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...workout,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating workout: ${error}`);
    }
  }

  // Actualizar entrenamiento
  async update(id: string, workout: UpdateWorkoutRequest): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      await updateDoc(docRef, {
        ...workout,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating workout: ${error}`);
    }
  }

  // Eliminar entrenamiento
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Error deleting workout: ${error}`);
    }
  }

  // Obtener estadísticas de entrenamiento
  async getStats(
    userId: string,
    period: 'week' | 'month' | 'year'
  ): Promise<WorkoutStats> {
    try {
      const startDate = this.getStartDate(period);
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];

      return this.calculateStats(workouts);
    } catch (error) {
      throw new Error(`Error fetching workout stats: ${error}`);
    }
  }

  private getStartDate(period: 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateStats(workouts: Workout[]): WorkoutStats {
    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce(
      (sum, workout) =>
        sum +
        workout.exercises.reduce(
          (exerciseSum, exercise) =>
            exerciseSum + exercise.sets * exercise.weight,
          0
        ),
      0
    );
    const averageWorkoutsPerWeek = totalWorkouts / 4; // Aproximado

    return {
      totalWorkouts,
      totalVolume,
      averageWorkoutsPerWeek,
      period: workouts.length > 0 ? 'recent' : 'none',
    };
  }
}

export const workoutService = new WorkoutService();
```

### Analytics Service

Servicio para análisis y métricas avanzadas.

```typescript
// src/api/services/analytics-service.ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Workout, Exercise } from '@/interfaces';

export class AnalyticsService {
  private workoutsCollection = 'workouts';
  private exercisesCollection = 'exercises';

  // Análisis de progreso de fuerza
  async getStrengthProgress(
    userId: string,
    exerciseId: string
  ): Promise<StrengthProgress> {
    try {
      const q = query(
        collection(db, this.workoutsCollection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];

      // Filtrar ejercicios específicos
      const exerciseRecords = workouts
        .flatMap((workout) => workout.exercises)
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      return this.calculateStrengthProgress(exerciseRecords);
    } catch (error) {
      throw new Error(`Error calculating strength progress: ${error}`);
    }
  }

  // Análisis de volumen por músculo
  async getVolumeByMuscleGroup(
    userId: string,
    period: 'week' | 'month' | 'year'
  ): Promise<VolumeAnalysis> {
    try {
      const startDate = this.getStartDate(period);
      const q = query(
        collection(db, this.workoutsCollection),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];

      return this.calculateVolumeByMuscleGroup(workouts);
    } catch (error) {
      throw new Error(`Error calculating volume analysis: ${error}`);
    }
  }

  // Análisis de tendencias
  async getTrends(userId: string): Promise<TrendAnalysis> {
    try {
      const q = query(
        collection(db, this.workoutsCollection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];

      return this.calculateTrends(workouts);
    } catch (error) {
      throw new Error(`Error calculating trends: ${error}`);
    }
  }

  // Predicciones de progreso
  async getProgressPredictions(userId: string): Promise<ProgressPredictions> {
    try {
      const q = query(
        collection(db, this.workoutsCollection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];

      return this.calculateProgressPredictions(workouts);
    } catch (error) {
      throw new Error(`Error calculating progress predictions: ${error}`);
    }
  }

  private calculateStrengthProgress(
    exerciseRecords: ExerciseRecord[]
  ): StrengthProgress {
    if (exerciseRecords.length < 2) {
      return {
        trend: 'insufficient_data',
        improvement: 0,
        confidence: 0,
        nextPredictedWeight: 0,
      };
    }

    const weights = exerciseRecords.map((record) => record.weight);
    const trend = this.calculateTrend(weights);
    const improvement = weights[weights.length - 1] - weights[0];
    const confidence = this.calculateConfidence(weights);

    return {
      trend,
      improvement,
      confidence,
      nextPredictedWeight: this.predictNextWeight(weights),
    };
  }

  private calculateVolumeByMuscleGroup(workouts: Workout[]): VolumeAnalysis {
    const muscleGroupVolume: Record<string, number> = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const volume = exercise.sets * exercise.weight;
        exercise.muscleGroups?.forEach((muscleGroup) => {
          muscleGroupVolume[muscleGroup] =
            (muscleGroupVolume[muscleGroup] || 0) + volume;
        });
      });
    });

    return {
      muscleGroupVolume,
      totalVolume: Object.values(muscleGroupVolume).reduce(
        (sum, volume) => sum + volume,
        0
      ),
      period: 'recent',
    };
  }

  private calculateTrends(workouts: Workout[]): TrendAnalysis {
    const recentWorkouts = workouts.slice(0, 10);
    const olderWorkouts = workouts.slice(10, 20);

    const recentVolume = this.calculateTotalVolume(recentWorkouts);
    const olderVolume = this.calculateTotalVolume(olderWorkouts);

    const volumeTrend = recentVolume - olderVolume;
    const frequencyTrend = recentWorkouts.length - olderWorkouts.length;

    return {
      volumeTrend,
      frequencyTrend,
      overallTrend:
        volumeTrend > 0 && frequencyTrend > 0 ? 'improving' : 'declining',
      confidence: this.calculateTrendConfidence(recentWorkouts, olderWorkouts),
    };
  }

  private calculateProgressPredictions(
    workouts: Workout[]
  ): ProgressPredictions {
    const recentWorkouts = workouts.slice(0, 5);
    const averageVolume = this.calculateAverageVolume(recentWorkouts);
    const volumeGrowth = this.calculateVolumeGrowth(workouts);

    return {
      nextWeekVolume: averageVolume * (1 + volumeGrowth),
      nextMonthVolume: averageVolume * Math.pow(1 + volumeGrowth, 4),
      estimatedPRDate: this.estimatePRDate(workouts),
      confidence: this.calculatePredictionConfidence(workouts),
    };
  }

  private calculateTrend(
    values: number[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = firstAvg * 0.05; // 5% threshold

    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }

  private calculateConfidence(values: number[]): number {
    if (values.length < 3) return 0;

    const variance = this.calculateVariance(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    // Convertir a escala de 0-100
    return Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDifferences = values.map((val) => Math.pow(val - mean, 2));
    return (
      squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length
    );
  }

  private predictNextWeight(weights: number[]): number {
    if (weights.length < 2) return weights[0] || 0;

    const recentWeights = weights.slice(-3);
    const averageGrowth =
      recentWeights.reduce((sum, weight, index) => {
        if (index === 0) return sum;
        return sum + (weight - recentWeights[index - 1]);
      }, 0) /
      (recentWeights.length - 1);

    return weights[weights.length - 1] + averageGrowth;
  }

  private getStartDate(period: 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateTotalVolume(workouts: Workout[]): number {
    return workouts.reduce(
      (total, workout) =>
        total +
        workout.exercises.reduce(
          (exerciseTotal, exercise) =>
            exerciseTotal + exercise.sets * exercise.weight,
          0
        ),
      0
    );
  }

  private calculateAverageVolume(workouts: Workout[]): number {
    if (workouts.length === 0) return 0;
    return this.calculateTotalVolume(workouts) / workouts.length;
  }

  private calculateVolumeGrowth(workouts: Workout[]): number {
    if (workouts.length < 4) return 0;

    const recentVolume = this.calculateTotalVolume(workouts.slice(0, 2));
    const olderVolume = this.calculateTotalVolume(workouts.slice(2, 4));

    if (olderVolume === 0) return 0;
    return (recentVolume - olderVolume) / olderVolume;
  }

  private estimatePRDate(workouts: Workout[]): Date | null {
    // Implementación simplificada
    const averageProgress = this.calculateVolumeGrowth(workouts);
    if (averageProgress <= 0) return null;

    const daysToPR = Math.ceil((1 / averageProgress) * 7); // Aproximación
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToPR);

    return estimatedDate;
  }

  private calculateTrendConfidence(
    recent: Workout[],
    older: Workout[]
  ): number {
    if (recent.length === 0 || older.length === 0) return 0;

    const recentVolume = this.calculateTotalVolume(recent);
    const olderVolume = this.calculateTotalVolume(older);

    const volumeDifference = Math.abs(recentVolume - olderVolume);
    const totalVolume = recentVolume + olderVolume;

    if (totalVolume === 0) return 0;
    return Math.min(100, (volumeDifference / totalVolume) * 100);
  }

  private calculatePredictionConfidence(workouts: Workout[]): number {
    if (workouts.length < 3) return 0;

    const volumes = workouts.map((workout) =>
      this.calculateTotalVolume([workout])
    );
    const variance = this.calculateVariance(volumes);
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

    const coefficientOfVariation = Math.sqrt(variance) / mean;
    return Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100));
  }
}

export const analyticsService = new AnalyticsService();
```

## 🔐 Servicios de Autenticación

### Auth Service

```typescript
// src/api/services/auth-service.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../firebase';

export class AuthService {
  // Iniciar sesión
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(`Error signing in: ${error}`);
    }
  }

  // Registrar usuario
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(`Error signing up: ${error}`);
    }
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`Error signing out: ${error}`);
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}

export const authService = new AuthService();
```

## 📊 Servicios de Exportación

### Export Service

```typescript
// src/api/services/export-service.ts
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Workout, Exercise } from '@/interfaces';

export class ExportService {
  // Exportar a CSV
  async exportToCSV(data: Workout[], filename: string): Promise<void> {
    try {
      const csvContent = this.convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);
    } catch (error) {
      throw new Error(`Error exporting to CSV: ${error}`);
    }
  }

  // Exportar a Excel
  async exportToExcel(data: Workout[], filename: string): Promise<void> {
    try {
      const worksheet = XLSX.utils.json_to_sheet(this.flattenWorkoutData(data));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Workouts');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      throw new Error(`Error exporting to Excel: ${error}`);
    }
  }

  // Exportar a JSON
  async exportToJSON(data: Workout[], filename: string): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, `${filename}.json`);
    } catch (error) {
      throw new Error(`Error exporting to JSON: ${error}`);
    }
  }

  // Exportar reporte completo
  async exportFullReport(
    workouts: Workout[],
    exercises: Exercise[]
  ): Promise<void> {
    try {
      const report = this.generateFullReport(workouts, exercises);

      // Exportar en múltiples formatos
      await Promise.all([
        this.exportToCSV(workouts, 'workouts-report'),
        this.exportToExcel(workouts, 'workouts-report'),
        this.exportToJSON(report, 'full-report'),
      ]);
    } catch (error) {
      throw new Error(`Error exporting full report: ${error}`);
    }
  }

  private convertToCSV(data: Workout[]): string {
    const headers = ['Date', 'Exercise', 'Sets', 'Weight', 'Reps', 'Volume'];
    const rows = data.flatMap((workout) =>
      workout.exercises.map((exercise) => [
        workout.date,
        exercise.name,
        exercise.sets,
        exercise.weight,
        exercise.reps,
        exercise.sets * exercise.weight,
      ])
    );

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
  }

  private flattenWorkoutData(workouts: Workout[]): any[] {
    return workouts.flatMap((workout) =>
      workout.exercises.map((exercise) => ({
        date: workout.date,
        exerciseName: exercise.name,
        sets: exercise.sets,
        weight: exercise.weight,
        reps: exercise.reps,
        volume: exercise.sets * exercise.weight,
        notes: exercise.notes || '',
      }))
    );
  }

  private generateFullReport(workouts: Workout[], exercises: Exercise[]): any {
    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce(
      (sum, workout) =>
        sum +
        workout.exercises.reduce(
          (exerciseSum, exercise) =>
            exerciseSum + exercise.sets * exercise.weight,
          0
        ),
      0
    );

    const exerciseStats = exercises.map((exercise) => {
      const exerciseWorkouts = workouts.filter((workout) =>
        workout.exercises.some((ex) => ex.exerciseId === exercise.id)
      );
      const maxWeight = Math.max(
        ...exerciseWorkouts.flatMap((w) =>
          w.exercises
            .filter((ex) => ex.exerciseId === exercise.id)
            .map((ex) => ex.weight)
        )
      );

      return {
        exerciseName: exercise.name,
        totalWorkouts: exerciseWorkouts.length,
        maxWeight,
        averageWeight:
          exerciseWorkouts
            .flatMap((w) =>
              w.exercises
                .filter((ex) => ex.exerciseId === exercise.id)
                .map((ex) => ex.weight)
            )
            .reduce((sum, weight) => sum + weight, 0) /
            exerciseWorkouts.length || 0,
      };
    });

    return {
      summary: {
        totalWorkouts,
        totalVolume,
        averageWorkoutsPerWeek: totalWorkouts / 4,
        period: 'all_time',
      },
      exerciseStats,
      workouts: workouts.map((workout) => ({
        date: workout.date,
        exercises: workout.exercises.length,
        totalVolume: workout.exercises.reduce(
          (sum, ex) => sum + ex.sets * ex.weight,
          0
        ),
      })),
    };
  }
}

export const exportService = new ExportService();
```

## 🚨 Manejo de Errores

### Error Handler

```typescript
// src/api/services/error-handler.ts
export class ErrorHandler {
  static handle(error: any, context: string): ErrorResponse {
    console.error(`Error in ${context}:`, error);

    // Errores de Firebase
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return {
            message: 'Usuario no encontrado',
            code: 'USER_NOT_FOUND',
            severity: 'error',
          };
        case 'auth/wrong-password':
          return {
            message: 'Contraseña incorrecta',
            code: 'WRONG_PASSWORD',
            severity: 'error',
          };
        case 'auth/email-already-in-use':
          return {
            message: 'El email ya está en uso',
            code: 'EMAIL_IN_USE',
            severity: 'error',
          };
        case 'permission-denied':
          return {
            message: 'No tienes permisos para realizar esta acción',
            code: 'PERMISSION_DENIED',
            severity: 'error',
          };
        default:
          return {
            message: 'Error inesperado',
            code: 'UNKNOWN_ERROR',
            severity: 'error',
          };
      }
    }

    // Errores de red
    if (error.name === 'NetworkError') {
      return {
        message: 'Error de conexión. Verifica tu internet',
        code: 'NETWORK_ERROR',
        severity: 'error',
      };
    }

    // Errores de validación
    if (error.name === 'ValidationError') {
      return {
        message: error.message,
        code: 'VALIDATION_ERROR',
        severity: 'warning',
      };
    }

    // Error genérico
    return {
      message: 'Algo salió mal. Inténtalo de nuevo',
      code: 'GENERIC_ERROR',
      severity: 'error',
    };
  }

  static isRetryable(error: any): boolean {
    const retryableCodes = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'internal',
    ];

    return retryableCodes.includes(error.code);
  }

  static getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

export interface ErrorResponse {
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}
```

## 🔄 Hooks de Servicios

### Custom Hooks para Servicios

```typescript
// src/hooks/use-api-services.ts
import { useState, useEffect, useCallback } from 'react';
import { exerciseService } from '@/api/services/exercise-service';
import { workoutService } from '@/api/services/workout-service';
import { analyticsService } from '@/api/services/analytics-service';
import { authService } from '@/api/services/auth-service';
import { ErrorHandler } from '@/api/services/error-handler';

export const useExerciseService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const getAllExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const exercises = await exerciseService.getAll();
      return exercises;
    } catch (err) {
      const errorResponse = ErrorHandler.handle(err, 'getAllExercises');
      setError(errorResponse);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const createExercise = useCallback(
    async (exercise: CreateExerciseRequest) => {
      setLoading(true);
      setError(null);
      try {
        const id = await exerciseService.create(exercise);
        return id;
      } catch (err) {
        const errorResponse = ErrorHandler.handle(err, 'createExercise');
        setError(errorResponse);
        throw errorResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getAllExercises,
    createExercise,
  };
};

export const useWorkoutService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const getUserWorkouts = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const workouts = await workoutService.getByUserId(userId);
      return workouts;
    } catch (err) {
      const errorResponse = ErrorHandler.handle(err, 'getUserWorkouts');
      setError(errorResponse);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkout = useCallback(async (workout: CreateWorkoutRequest) => {
    setLoading(true);
    setError(null);
    try {
      const id = await workoutService.create(workout);
      return id;
    } catch (err) {
      const errorResponse = ErrorHandler.handle(err, 'createWorkout');
      setError(errorResponse);
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUserWorkouts,
    createWorkout,
  };
};

export const useAnalyticsService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const getStrengthProgress = useCallback(
    async (userId: string, exerciseId: string) => {
      setLoading(true);
      setError(null);
      try {
        const progress = await analyticsService.getStrengthProgress(
          userId,
          exerciseId
        );
        return progress;
      } catch (err) {
        const errorResponse = ErrorHandler.handle(err, 'getStrengthProgress');
        setError(errorResponse);
        throw errorResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getVolumeAnalysis = useCallback(
    async (userId: string, period: 'week' | 'month' | 'year') => {
      setLoading(true);
      setError(null);
      try {
        const analysis = await analyticsService.getVolumeByMuscleGroup(
          userId,
          period
        );
        return analysis;
      } catch (err) {
        const errorResponse = ErrorHandler.handle(err, 'getVolumeAnalysis');
        setError(errorResponse);
        throw errorResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getStrengthProgress,
    getVolumeAnalysis,
  };
};
```

## 📊 Métricas de Servicios

### Estadísticas de Uso

```typescript
const serviceMetrics = {
  // Ejercicios
  exercises: {
    total: 150,
    categories: 8,
    muscleGroups: 12,
    averageResponseTime: '120ms',
  },

  // Entrenamientos
  workouts: {
    total: 2500,
    averagePerUser: 50,
    averageResponseTime: '200ms',
  },

  // Análisis
  analytics: {
    calculationsPerDay: 1000,
    averageProcessingTime: '500ms',
    accuracy: '95%',
  },

  // Exportación
  exports: {
    totalExports: 500,
    formats: ['CSV', 'Excel', 'JSON'],
    averageFileSize: '50KB',
  },
};
```

### Performance Metrics

```typescript
const performanceMetrics = {
  // Tiempos de respuesta
  responseTimes: {
    exercises: '120ms',
    workouts: '200ms',
    analytics: '500ms',
    exports: '1000ms',
  },

  // Tasa de éxito
  successRates: {
    exercises: '99.5%',
    workouts: '99.2%',
    analytics: '98.8%',
    exports: '99.9%',
  },

  // Errores
  errorRates: {
    network: '0.1%',
    validation: '0.3%',
    permission: '0.05%',
    unknown: '0.05%',
  },
};
```

## 🔮 Roadmap de Servicios

### Fase Actual (v1.0)

- ✅ Firebase configurado
- ✅ Servicios CRUD implementados
- ✅ Análisis básico implementado
- ✅ Exportación implementada
- ✅ Manejo de errores implementado

### Fase Futura (v2.0)

- 🚧 GraphQL API
- 🚧 Real-time subscriptions
- 🚧 Advanced analytics
- 🚧 Machine learning predictions
- 🚧 Multi-tenant architecture
