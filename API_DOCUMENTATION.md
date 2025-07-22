# 🏋️ GymBro - API Documentation

## Table of Contents

1. [Core Data APIs](#core-data-apis)
2. [Hooks](#hooks)
3. [Components](#components)
4. [Utility Functions](#utility-functions)
5. [Types & Interfaces](#types--interfaces)
6. [Constants & Configuration](#constants--configuration)

---

## Core Data APIs

### 📦 OfflineData Hook

The main data management hook providing offline-first functionality with automatic synchronization.

```typescript
import { useOfflineData } from './hooks/use-offline-data';

const {
  // State
  isInitialized,
  syncStatus,
  isOnline,
  
  // Exercise operations
  addExercise,
  updateExercise,
  deleteExercise,
  getExercises,
  getExercisesByCategory,
  
  // Workout Record operations
  addWorkoutRecord,
  updateWorkoutRecord,
  deleteWorkoutRecord,
  getWorkoutRecords,
  getWorkoutRecordsByExercise,
  getWorkoutRecordsByDate
} = useOfflineData();
```

#### State Properties

- **`isInitialized: boolean`** - Whether IndexedDB is ready
- **`syncStatus: SyncStatus`** - Current synchronization state
- **`isOnline: boolean`** - Network connectivity status

#### Exercise Operations

##### `addExercise(exercise: Omit<Exercise, 'id'>): Promise<DatabaseResult<IndexedDBExercise>>`

Creates a new exercise with immediate local storage and background sync.

```typescript
const result = await addExercise({
  name: "Push-ups",
  categories: ["Chest", "Triceps"],
  description: "Basic bodyweight exercise",
  url: "https://example.com/pushup-guide"
});

if (result.success) {
  console.log('Exercise created:', result.data);
}
```

##### `updateExercise(exercise: IndexedDBExercise): Promise<DatabaseResult<IndexedDBExercise>>`

Updates an existing exercise.

```typescript
const updatedExercise = {
  ...existingExercise,
  name: "Modified Push-ups",
  categories: ["Chest", "Triceps", "Core"]
};

await updateExercise(updatedExercise);
```

##### `deleteExercise(exerciseId: string): Promise<DatabaseResult<boolean>>`

Removes an exercise and queues deletion for sync.

```typescript
await deleteExercise("exercise-id-123");
```

##### `getExercises(options?: QueryOptions): Promise<DatabaseResult<IndexedDBExercise[]>>`

Retrieves all exercises with optional filtering and sorting.

```typescript
const result = await getExercises({
  sortBy: 'name',
  sortOrder: 'asc',
  limit: 50
});
```

##### `getExercisesByCategory(category: string): Promise<DatabaseResult<IndexedDBExercise[]>>`

Gets exercises filtered by category.

```typescript
const chestExercises = await getExercisesByCategory("Chest");
```

#### Workout Record Operations

##### `addWorkoutRecord(record: Omit<WorkoutRecord, 'id'>): Promise<DatabaseResult<IndexedDBWorkoutRecord>>`

Records a new workout with immediate local storage.

```typescript
const workout = await addWorkoutRecord({
  exerciseId: "exercise-123",
  weight: 80,
  reps: 10,
  sets: 3,
  date: new Date(),
  dayOfWeek: "lunes",
  individualSets: [
    { weight: 80, reps: 10 },
    { weight: 82.5, reps: 8 },
    { weight: 85, reps: 6 }
  ]
});
```

---

## Hooks

### 🔄 useOfflineData

**Location:** `src/hooks/use-offline-data.ts`

Primary hook for data management with offline-first capabilities.

**Returns:**
- Complete CRUD operations for exercises and workout records
- Real-time sync status
- Network connectivity state
- Automatic background synchronization

### 🌐 useOnlineStatus

**Location:** `src/hooks/use-online-status.ts`

Monitors network connectivity status.

```typescript
import { useOnlineStatus } from './hooks/use-online-status';

const isOnline = useOnlineStatus(); // boolean
```

---

## Components

### 🎨 UI Components

#### Card System

**Location:** `src/components/card/`

Generic card component with flexible theming.

```typescript
import { Card, CardHeader, CardContent } from './components/card';

<Card variant="primary" size="lg" header={<h3>Title</h3>}>
  <p>Content goes here</p>
</Card>
```

**Props:**
- `variant?: UIVariant` - Color theme ('default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost')
- `size?: UISize` - Size preset ('sm' | 'md' | 'lg')
- `className?: string` - Additional CSS classes
- `header?: React.ReactNode` - Optional header content

#### Modern UI Components

**Location:** `src/components/modern-ui/`

Enhanced UI components with modern design patterns.

```typescript
import { 
  ModernButton, 
  ModernCard, 
  ModernLayout 
} from './components/modern-ui';

// Modern button with variants
<ModernButton variant="primary" size="lg" onClick={handleClick}>
  Save Workout
</ModernButton>

// Modern card with enhanced styling
<ModernCard>
  <ModernCardHeader>Exercise Details</ModernCardHeader>
  <ModernCardContent>Workout information</ModernCardContent>
</ModernCard>
```

#### Loading Components

**Location:** `src/components/loading-spinner/`

Configurable loading states.

```typescript
import { LoadingSpinner } from './components/loading-spinner';

<LoadingSpinner size="lg" />
<LoadingSpinner size="sm" className="text-blue-500" />
```

### 📊 Dashboard Components

**Location:** `src/components/dashboard/`

Complete dashboard system with multiple analysis tabs.

```typescript
import { 
  DashboardHeader,
  DashboardTabNavigation,
  ExercisesTab,
  TrendsTab,
  AdvancedTab,
  BalanceTab,
  PredictionsTab,
  HistoryTab
} from './components/dashboard';
```

**Available Tabs:**
- **ExercisesTab** - Exercise performance overview
- **TrendsTab** - Progress trends and analytics
- **AdvancedTab** - Advanced statistical analysis  
- **BalanceTab** - Muscle group balance analysis
- **PredictionsTab** - AI-powered predictions
- **HistoryTab** - Historical workout data

### 🏃‍♂️ Exercise Components

#### Exercise Card

**Location:** `src/components/exercise-card/`

Individual exercise display with workout recording.

```typescript
import { ExerciseCard } from './components/exercise-card';

<ExerciseCard
  exercise={exercise}
  onWorkoutAdded={handleWorkoutAdded}
  recentRecord={lastWorkout}
  showAdvancedMode={true}
/>
```

#### Exercise List

**Location:** `src/components/exercise-list/`

Drag-and-drop exercise list with filtering.

```typescript
import { ExerciseList } from './components/exercise-list';

<ExerciseList
  exercises={exercises}
  assignments={assignments}
  activeDay={currentDay}
  onWorkoutAdded={handleWorkoutAdded}
  onReorder={handleReorder}
/>
```

### 📅 Calendar Components

**Location:** `src/components/workout-calendar/`

Monthly calendar view with workout intensity visualization.

```typescript
import { WorkoutCalendar } from './components/workout-calendar';

<WorkoutCalendar
  workouts={workoutRecords}
  onDateSelect={handleDateSelect}
  selectedDate={selectedDate}
/>
```

### 📈 Analytics Components

#### Exercise Progress Chart

**Location:** `src/components/exercise-progress-chart/`

Interactive progress visualization.

```typescript
import { ExerciseProgressChart } from './components/exercise-progress-chart';

<ExerciseProgressChart
  exerciseId="exercise-123"
  records={workoutRecords}
  timeframe="3months"
  showPredictions={true}
/>
```

#### Exercise Stats

**Location:** `src/components/exercise-stats/`

Statistical summary components.

```typescript
import { ExerciseStats } from './components/exercise-stats';

<ExerciseStats
  records={exerciseRecords}
  showTrends={true}
  compactMode={false}
/>
```

### 🎛️ Admin Components

**Location:** `src/components/admin-panel/`

Administrative interface for exercise and assignment management.

```typescript
import { ModernAdminPanel } from './pages/modern-app/pages/admin-panel';

<ModernAdminPanel
  isModal={true}
  onClose={handleClose}
/>
```

---

## Utility Functions

### 📊 Statistics Utilities

**Location:** `src/utils/functions/stats-utils.ts`

Comprehensive statistical analysis functions.

#### Basic Statistics

```typescript
import { 
  calculateAverage,
  calculateMax,
  calculateMin,
  formatNumber,
  calculateBasicStats
} from './utils/functions/stats-utils';

// Basic calculations
const avg = calculateAverage([10, 20, 30]); // 20
const max = calculateMax([10, 20, 30]); // 30
const formatted = formatNumber(123.456, 2); // "123.46"

// Complex statistics
const stats = calculateBasicStats([1, 2, 3, 4, 5]);
// Returns: { average, min, max, median, standardDeviation }
```

#### Workout-Specific Calculations

```typescript
import {
  calculateWorkoutVolume,
  calculateTotalVolume,
  calculateEstimated1RM,
  calculateStrengthIndex,
  calculateStrengthProgress
} from './utils/functions/stats-utils';

// Volume calculations
const volume = calculateWorkoutVolume(workoutRecord); // weight × reps × sets
const totalVolume = calculateTotalVolume(workoutRecords);

// Strength calculations
const oneRM = calculateEstimated1RM(100, 8); // Estimated 1RM
const strengthIndex = calculateStrengthIndex(workoutRecord);

// Progress analysis
const progress = calculateStrengthProgress(firstRecord, lastRecord);
// Returns: { percentageIncrease, strengthGain, timeframe }
```

#### Advanced Analytics

```typescript
import {
  calculateAdvancedStrengthAnalysis,
  calculateEnhanced1RMPrediction,
  calculateExerciseProgress,
  calculateWeightProgress
} from './utils/functions/stats-utils';

// Comprehensive strength analysis
const analysis = calculateAdvancedStrengthAnalysis(records);
// Returns detailed metrics including velocity, power, fatigue analysis

// Enhanced 1RM prediction with confidence intervals
const prediction = calculateEnhanced1RMPrediction(records);
// Returns prediction with confidence levels and reliability scores

// Exercise-specific progress tracking
const progress = calculateExerciseProgress(exerciseRecords);
// Returns trend analysis, milestones, and projections
```

### 📈 Trend Analysis

**Location:** `src/utils/functions/trends-analysis.ts`

Advanced trend analysis and forecasting.

```typescript
import {
  calculateTemporalTrends,
  identifyPerformancePatterns,
  calculateSeasonalEffects,
  forecastProgress
} from './utils/functions/trends-analysis';

// Temporal trend analysis
const trends = calculateTemporalTrends(records, {
  timeframe: '6months',
  smoothing: true,
  detectOutliers: true
});

// Pattern identification
const patterns = identifyPerformancePatterns(records);
// Returns weekly patterns, seasonal effects, plateau detection

// Forecasting
const forecast = forecastProgress(records, {
  horizon: 30, // days
  confidence: 0.95
});
```

### 🎯 Category Analysis

**Location:** `src/utils/functions/category-analysis.ts`

Muscle group and exercise category analysis.

```typescript
import {
  calculateCategoryMetrics,
  analyzeMuscleBalance,
  identifyWeakPoints,
  generateBalanceRecommendations
} from './utils/functions/category-analysis';

// Category performance metrics
const metrics = calculateCategoryMetrics(records, exercises);
// Returns volume, frequency, progression per category

// Muscle balance analysis
const balance = analyzeMuscleBalance(records, exercises);
// Returns balance scores, imbalances, risk assessment

// Weak point identification
const weakPoints = identifyWeakPoints(balance);
// Returns underdeveloped areas and recommendations
```

### 📤 Export Utilities

**Location:** `src/utils/functions/export-utils.ts`

Data export and analysis functions.

```typescript
import {
  exportToExcel,
  exportToJSON,
  exportToCSV,
  generateProgressReport,
  createBackupData
} from './utils/functions/export-utils';

// Excel export with multiple sheets
await exportToExcel(exercises, workoutRecords, {
  includeCharts: true,
  includeAnalysis: true,
  filename: 'workout-data.xlsx'
});

// Comprehensive progress report
const report = await generateProgressReport(data, {
  timeframe: '1year',
  includeForecasts: true,
  detailLevel: 'comprehensive'
});

// Create backup with metadata
const backup = createBackupData(allData);
```

### 🕒 Time Utilities

**Location:** `src/utils/functions/time-utils.ts`

Time and date manipulation functions.

```typescript
import {
  formatRelativeTime,
  isToday,
  isThisWeek,
  getDaysDifference,
  formatCompactDate
} from './utils/functions/time-utils';

const relativeTime = formatRelativeTime(workoutDate); // "2 hours ago"
const isRecent = isToday(workoutDate); // boolean
const daysAgo = getDaysDifference(new Date(), workoutDate); // number
```

### 🎨 Style Utilities

**Location:** `src/utils/functions/style-utils.ts`

CSS class management and theming utilities.

```typescript
import { cn, getVariantClasses } from './utils/functions/style-utils';

// Class name combination utility
const classes = cn(
  'base-class',
  condition && 'conditional-class',
  { 'object-class': isActive }
);

// Theme variant classes
const variantClasses = getVariantClasses('primary', 'large');
```

### 📊 Chart Utilities

**Location:** `src/utils/functions/chart-utils.ts`

Chart configuration and data formatting.

```typescript
import {
  formatChartData,
  generateChartOptions,
  createProgressSeries,
  formatAxisLabels
} from './utils/functions/chart-utils';

// Format data for ApexCharts
const chartData = formatChartData(workoutRecords, {
  groupBy: 'week',
  metric: 'volume'
});

// Generate chart configuration
const options = generateChartOptions({
  theme: 'dark',
  responsive: true,
  showLegend: true
});
```

### 🔍 Filter Utilities

**Location:** `src/utils/functions/filter-utils.ts`

Data filtering and search functions.

```typescript
import {
  filterByDateRange,
  filterByExercise,
  filterByCategory,
  searchExercises,
  applyMultipleFilters
} from './utils/functions/filter-utils';

// Date range filtering
const recentWorkouts = filterByDateRange(records, {
  start: lastWeek,
  end: today
});

// Exercise search
const matches = searchExercises(exercises, "push");

// Multiple filter application
const filtered = applyMultipleFilters(records, {
  dateRange: { start: lastMonth, end: today },
  categories: ['Chest', 'Shoulders'],
  minWeight: 50
});
```

---

## Types & Interfaces

### 🎯 Core Data Types

**Location:** `src/interfaces/index.ts`

#### Exercise

```typescript
interface Exercise {
  id: string;
  name: string;
  categories: string[];
  description?: string;
  url?: string;
}
```

#### WorkoutRecord

```typescript
interface WorkoutRecord {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  sets: number;
  date: Date;
  dayOfWeek: DayOfWeek;
  exercise?: Exercise;
  individualSets?: WorkoutSet[];
}

interface WorkoutSet {
  weight: number;
  reps: number;
}
```

#### ExerciseAssignment

```typescript
interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  exercise?: Exercise;
  order?: number;
}
```

#### DayOfWeek

```typescript
type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';
```

### 🎨 UI Types

**Location:** `src/interfaces/ui.ts`

```typescript
type UIVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
type UISize = 'sm' | 'md' | 'lg';

interface BaseUIProps {
  className?: string;
  variant?: UIVariant;
  size?: UISize;
}
```

### 💾 Database Types

**Location:** `src/utils/data/indexeddb-types.ts`

#### IndexedDB Enhanced Types

```typescript
interface IndexedDBExercise extends Exercise {
  createdAt: number;
  updatedAt: number;
  _localId?: string;
  _isLocalOnly?: boolean;
  _needsSync?: boolean;
  _lastSyncAt?: number;
  _conflictData?: any;
}

interface IndexedDBWorkoutRecord extends WorkoutRecord {
  createdAt: number;
  updatedAt: number;
  _localId?: string;
  _isLocalOnly?: boolean;
  _needsSync?: boolean;
  _lastSyncAt?: number;
  _conflictData?: any;
}
```

#### Database Operations

```typescript
interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
  timestamp: number;
}

interface QueryOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  filters?: QueryFilter[];
}
```

#### Sync System

```typescript
interface SyncQueueItem {
  id: string;
  entityType: 'exercise' | 'workoutRecord' | 'assignment';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: number;
  retryCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  error?: string;
}
```

---

## Constants & Configuration

### 🎨 Theme System

**Location:** `src/constants/theme.ts`

Comprehensive design system with 13 sub-systems.

#### Core Theme Colors

```typescript
const THEME_COLORS = {
  variants: {
    default: 'bg-gray-600 text-white hover:bg-gray-700',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800'
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-6 py-3 text-base'
  }
};
```

#### Container Styles

```typescript
const THEME_CONTAINERS = {
  card: {
    base: 'rounded-lg border shadow-lg',
    variants: {
      default: 'bg-gray-800 border-gray-700',
      primary: 'bg-gray-800 border-gray-700',
      // ... more variants
    }
  },
  modal: {
    overlay: 'fixed inset-0 bg-black/50 flex items-center justify-center',
    container: 'bg-gray-900 rounded-lg max-w-4xl overflow-hidden',
    // ... more modal styles
  }
};
```

#### Chart Theme

```typescript
const THEME_CHART = {
  colors: [
    'rgb(59, 130, 246)',   // blue
    'rgb(16, 185, 129)',   // green  
    'rgb(245, 158, 11)',   // yellow
    'rgb(239, 68, 68)',    // red
    // ... more colors
  ],
  grid: {
    color: 'rgb(55, 65, 81)',
    opacity: '0.3'
  }
};
```

### 🏃‍♂️ Exercise Categories

**Location:** `src/constants/exercise-categories.ts`

Predefined exercise categories for organization.

```typescript
const EXERCISE_CATEGORIES = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 
  'Core', 'Cardio', 'Functional', 'Olympic'
];
```

### 💾 Database Configuration

**Location:** `src/utils/data/indexeddb-config.ts`

IndexedDB schema and configuration.

```typescript
const DB_CONFIG = {
  name: 'GymTrackerDB',
  version: 1,
  stores: {
    EXERCISES: 'exercises',
    WORKOUT_RECORDS: 'workoutRecords',
    ASSIGNMENTS: 'assignments',
    SYNC_QUEUE: 'syncQueue'
  }
};
```

---

## Usage Examples

### 🚀 Quick Start

```typescript
import { useOfflineData } from './hooks/use-offline-data';
import { Card } from './components/card';
import { ModernButton } from './components/modern-ui';
import { LoadingSpinner } from './components/loading-spinner';

function MyWorkoutApp() {
  const { 
    getExercises,
    addExercise, 
    addWorkoutRecord,
    isInitialized 
  } = useOfflineData();

  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const loadExercises = async () => {
      const result = await getExercises();
      if (result.success) {
        setExercises(result.data || []);
      }
    };
    
    if (isInitialized) {
      loadExercises();
    }
  }, [isInitialized, getExercises]);

  const handleAddExercise = async () => {
    await addExercise({
      name: "Bench Press",
      categories: ["Chest", "Triceps"],
      description: "Classic chest exercise"
    });
  };

  const handleRecordWorkout = async (exerciseId: string) => {
    await addWorkoutRecord({
      exerciseId,
      weight: 80,
      reps: 10,
      sets: 3,
      date: new Date(),
      dayOfWeek: 'lunes',
      individualSets: [
        { weight: 80, reps: 10 },
        { weight: 80, reps: 9 },
        { weight: 80, reps: 8 }
      ]
    });
  };

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <Card variant="primary">
        <h2>My Exercises</h2>
        {exercises.map(exercise => (
          <div key={exercise.id} className="flex justify-between items-center">
            <span>{exercise.name}</span>
            <ModernButton 
              onClick={() => handleRecordWorkout(exercise.id)}
              variant="success"
            >
              Record Workout
            </ModernButton>
          </div>
        ))}
      </Card>
      
      <ModernButton onClick={handleAddExercise} variant="primary">
        Add Exercise
      </ModernButton>
    </div>
  );
}
```

### 📊 Advanced Analytics Example

```typescript
import {
  calculateAdvancedStrengthAnalysis,
  calculateCategoryMetrics,
  generateProgressReport
} from './utils/functions';
import { Card } from './components/card';

function AdvancedAnalytics({ records, exercises }: Props) {
  const strengthAnalysis = calculateAdvancedStrengthAnalysis(records);
  const categoryMetrics = calculateCategoryMetrics(records, exercises);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card variant="default">
        <h3 className="text-lg font-semibold mb-4">Strength Analysis</h3>
        <div className="space-y-2">
          <p>Power Index: <span className="font-mono">{strengthAnalysis.powerIndex.toFixed(2)}</span></p>
          <p>Velocity Trend: <span className="font-mono">{strengthAnalysis.velocityTrend}</span></p>
          <p>Fatigue Score: <span className="font-mono">{strengthAnalysis.fatigueScore.toFixed(1)}</span></p>
          <p>Recovery Rate: <span className="font-mono">{strengthAnalysis.recoveryRate}%</span></p>
        </div>
      </Card>
      
      <Card variant="default">
        <h3 className="text-lg font-semibold mb-4">Category Balance</h3>
        <div className="space-y-2">
          {categoryMetrics.map(metric => (
            <div key={metric.category} className="flex justify-between">
              <span>{metric.category}:</span>
              <span className="font-mono">{metric.volumePercentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

### 🔄 Sync Status Monitoring

```typescript
import { useOfflineData } from './hooks/use-offline-data';
import { ConnectionIndicator } from './components/connection-indicator';

function SyncStatusExample() {
  const { syncStatus, isOnline } = useOfflineData();
  
  return (
    <div className="flex items-center space-x-2">
      <ConnectionIndicator isOnline={isOnline} />
      
      {syncStatus.isSyncing && (
        <span className="text-yellow-500">Syncing...</span>
      )}
      
      {syncStatus.pendingOperations > 0 && (
        <span className="text-orange-500">
          {syncStatus.pendingOperations} pending
        </span>
      )}
      
      {syncStatus.lastSync && (
        <span className="text-gray-400 text-sm">
          Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
        </span>
      )}
      
      {syncStatus.error && (
        <span className="text-red-500">Sync error: {syncStatus.error}</span>
      )}
    </div>
  );
}
```

### 📈 Chart Integration Example

```typescript
import { ExerciseProgressChart } from './components/exercise-progress-chart';
import { formatChartData } from './utils/functions/chart-utils';

function ProgressChartExample({ exerciseId, records }: Props) {
  const chartData = formatChartData(records, {
    groupBy: 'week',
    metric: 'volume'
  });

  return (
    <Card>
      <h3>Exercise Progress</h3>
      <ExerciseProgressChart
        exerciseId={exerciseId}
        records={records}
        timeframe="3months"
        showPredictions={true}
        chartOptions={{
          theme: 'dark',
          responsive: true,
          showLegend: true
        }}
      />
    </Card>
  );
}
```

### 🚀 Export Data Example

```typescript
import { exportToExcel, generateProgressReport } from './utils/functions/export-utils';
import { ModernButton } from './components/modern-ui';

function DataExportExample({ exercises, workoutRecords }: Props) {
  const handleExportExcel = async () => {
    try {
      await exportToExcel(exercises, workoutRecords, {
        includeCharts: true,
        includeAnalysis: true,
        filename: 'my-workout-data.xlsx'
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateProgressReport({ exercises, workoutRecords }, {
        timeframe: '1year',
        includeForecasts: true,
        detailLevel: 'comprehensive'
      });
      
      // Process or display the report
      console.log('Generated report:', report);
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  return (
    <div className="flex space-x-4">
      <ModernButton onClick={handleExportExcel} variant="secondary">
        Export to Excel
      </ModernButton>
      <ModernButton onClick={handleGenerateReport} variant="primary">
        Generate Report
      </ModernButton>
    </div>
  );
}
```

---

## IndexedDB Utilities

### 🗄️ Direct Database Access

**Location:** `src/utils/data/indexeddb-utils.ts`

Low-level database operations for advanced use cases.

```typescript
import {
  initializeDB,
  addItem,
  updateItem,
  deleteItem,
  getAllItems,
  getItemsByIndex,
  executeTransaction
} from './utils/data/indexeddb-utils';

// Initialize database
await initializeDB();

// Direct item operations
const result = await addItem('exercises', newExercise);
await updateItem('exercises', updatedExercise);
await deleteItem('exercises', exerciseId);

// Bulk operations with transactions
await executeTransaction(['exercises', 'workoutRecords'], 'readwrite', async (transaction) => {
  const exerciseStore = transaction.objectStore('exercises');
  const recordStore = transaction.objectStore('workoutRecords');
  
  // Perform multiple operations atomically
  await exerciseStore.add(newExercise);
  await recordStore.add(newWorkoutRecord);
});
```

### 🔄 Sync Management

**Location:** `src/utils/data/sync-manager.ts`

Manual sync control for advanced scenarios.

```typescript
import {
  startSync,
  stopSync,
  forceSync,
  queueSyncOperation,
  addSyncEventListener
} from './utils/data/sync-manager';

// Manual sync control
startSync(5); // Start auto-sync every 5 minutes
forceSync(); // Force immediate sync
stopSync(); // Stop auto-sync

// Queue custom operations
await queueSyncOperation('exercise', exerciseId, 'CREATE', exerciseData, 'HIGH');

// Listen to sync events
const handleSyncEvent = (event) => {
  console.log('Sync event:', event.type, event.data);
};

addSyncEventListener(handleSyncEvent);
```

---

## Performance Notes

- **Response Time**: < 5ms for local operations via IndexedDB
- **Offline Support**: 100% functionality without internet connection
- **Sync Strategy**: Automatic background sync every 5 minutes with exponential backoff
- **Conflict Resolution**: Timestamp-based with manual resolution options
- **Storage**: IndexedDB for local data, Firebase Firestore for cloud sync
- **Memory Usage**: Optimized with lazy loading and pagination
- **Bundle Size**: Tree-shakeable utilities, ~150KB compressed

## Browser Support

- **Chrome**: 60+ (IndexedDB v2 support)
- **Firefox**: 55+ (Full offline functionality)
- **Safari**: 13+ (iOS and macOS)
- **Edge**: 79+ (Chromium-based)

**Note**: Graceful degradation for older browsers with localStorage fallback.

## Version Compatibility

This documentation is for **GymBro v1.0.0**. 

### Breaking Changes
- v1.0.0: Initial release with offline-first architecture
- Future versions will maintain backward compatibility for data migration

### Dependencies
- React 18.3.1+
- TypeScript 5.5.3+
- Firebase 10.7.1+
- Vite 5.4.2+

Check `package.json` for current version and complete dependency list.

---

## Contributing

### API Design Principles

1. **Offline-First**: All operations work without network
2. **Type Safety**: Full TypeScript coverage
3. **Performance**: < 5ms response times for local operations
4. **Consistency**: Predictable API patterns across all functions
5. **Extensibility**: Easy to add new features without breaking changes

### Testing Guidelines

```typescript
// Example test for utility function
import { calculateWorkoutVolume } from './utils/functions/stats-utils';

describe('calculateWorkoutVolume', () => {
  it('should calculate volume correctly', () => {
    const record = { weight: 100, reps: 10, sets: 3 };
    expect(calculateWorkoutVolume(record)).toBe(3000);
  });
});
```

For more information, see the main [README.md](./README.md) file.
