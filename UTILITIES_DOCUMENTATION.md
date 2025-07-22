# 🔧 GymBro - Utilities Documentation

## Table of Contents

1. [Statistics Utilities](#statistics-utilities)
2. [Analysis Utilities](#analysis-utilities)
3. [Data Processing](#data-processing)
4. [UI Utilities](#ui-utilities)
5. [Time & Date Utilities](#time--date-utilities)
6. [Export & Import](#export--import)

---

## Statistics Utilities

### 📊 Basic Statistics

**Location:** `src/utils/functions/stats-utils.ts`

#### Core Statistical Functions

```typescript
// Basic mathematical operations
export const calculateAverage = (numbers: number[]): number
export const calculateMax = (numbers: number[]): number  
export const calculateMin = (numbers: number[]): number
export const formatNumber = (num: number, maxDecimals: number = 1): string

// Usage examples
const weights = [80, 85, 82.5, 87.5, 90];
const avgWeight = calculateAverage(weights); // 85
const maxWeight = calculateMax(weights); // 90
const formatted = formatNumber(85.666, 1); // "85.7"
```

#### Advanced Statistical Analysis

```typescript
export const calculateBasicStats = (values: number[]) => ({
  average: number;
  min: number;
  max: number;
  median: number;
  standardDeviation: number;
})

export const calculatePercentile = (values: number[], percentile: number): number
export const findMostCommon = <T>(values: T[]): T | null

// Usage
const stats = calculateBasicStats([70, 75, 80, 85, 90]);
// Returns: { average: 80, min: 70, max: 90, median: 80, standardDeviation: 7.07 }

const p90 = calculatePercentile([60, 70, 80, 90, 100], 90); // 96
const mostUsedWeight = findMostCommon([80, 80, 85, 80, 90]); // 80
```

### 🏋️ Workout-Specific Calculations

#### Volume and Intensity

```typescript
export const calculateWorkoutVolume = (record: WorkoutRecord): number
export const calculateTotalVolume = (records: WorkoutRecord[]): number
export const calculateTotalReps = (records: WorkoutRecord[]): number
export const calculateTotalSets = (records: WorkoutRecord[]): number

// Volume calculation: weight × reps × sets
const volume = calculateWorkoutVolume({
  weight: 100,
  reps: 8,
  sets: 3
}); // 2400

// Total volume across multiple workouts
const totalVolume = calculateTotalVolume(workoutRecords); // Sum of all volumes
```

#### Strength Calculations

```typescript
export const calculateEstimated1RM = (weight: number, reps: number): number
export const calculateStrengthIndex = (record: WorkoutRecord): number

// 1RM estimation using Epley formula: weight × (1 + reps/30)
const oneRM = calculateEstimated1RM(100, 8); // ~126.7 kg

// Strength index: composite score considering volume, intensity, and frequency
const strengthIndex = calculateStrengthIndex(workoutRecord); // 0-100 scale
```

#### Progress Analysis

```typescript
export const calculateStrengthProgress = (
  firstRecord: WorkoutRecord, 
  lastRecord: WorkoutRecord
): {
  percentageIncrease: number;
  strengthGain: number;
  timeframe: number;
  averageGainPerWeek: number;
}

export const calculateProgress = (oldValue: number, newValue: number): number

// Progress between two records
const progress = calculateStrengthProgress(firstRecord, lastRecord);
// Returns detailed progress metrics including timeline analysis
```

### 📈 Advanced Analytics

#### Comprehensive Strength Analysis

```typescript
export interface AdvancedStrengthAnalysis {
  powerIndex: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  fatigueScore: number;
  recoveryRate: number;
  consistencyScore: number;
  plateauRisk: number;
  optimalVolumeRange: { min: number; max: number };
  strengthBalance: Record<string, number>;
  recommendations: string[];
}

export const calculateAdvancedStrengthAnalysis = (
  records: WorkoutRecord[]
): AdvancedStrengthAnalysis

// Usage
const analysis = calculateAdvancedStrengthAnalysis(benchPressRecords);
console.log(`Power Index: ${analysis.powerIndex.toFixed(2)}`);
console.log(`Fatigue Score: ${analysis.fatigueScore.toFixed(1)}`);
console.log(`Recommendations: ${analysis.recommendations.join(', ')}`);
```

#### Enhanced 1RM Prediction

```typescript
export interface Enhanced1RMPrediction {
  prediction: number;
  confidenceInterval: { lower: number; upper: number };
  reliability: number;
  methodology: string;
  dataQuality: number;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
}

export const calculateEnhanced1RMPrediction = (
  records: WorkoutRecord[]
): Enhanced1RMPrediction

// Advanced 1RM prediction with confidence analysis
const prediction = calculateEnhanced1RMPrediction(records);
console.log(`Predicted 1RM: ${prediction.prediction} kg`);
console.log(`Confidence: ${prediction.reliability * 100}%`);
```

---

## Analysis Utilities

### 🎯 Category Analysis

**Location:** `src/utils/functions/category-analysis.ts`

#### Muscle Group Analysis

```typescript
export interface CategoryMetrics {
  category: string;
  totalVolume: number;
  averageVolume: number;
  frequency: number;
  progression: number;
  volumePercentage: number;
  lastWorkout: Date | null;
  exercises: Array<{
    exerciseId: string;
    name: string;
    volume: number;
    frequency: number;
  }>;
}

export const calculateCategoryMetrics = (
  records: WorkoutRecord[],
  exercises: Exercise[]
): CategoryMetrics[]

// Calculate metrics per muscle group
const categoryMetrics = calculateCategoryMetrics(records, exercises);
categoryMetrics.forEach(metric => {
  console.log(`${metric.category}: ${metric.volumePercentage.toFixed(1)}% of total volume`);
});
```

#### Muscle Balance Assessment

```typescript
export interface MuscleBalance {
  pushPullRatio: number;
  upperLowerRatio: number;
  bilateralBalance: number;
  anteriorPosteriorBalance: number;
  imbalances: Array<{
    type: string;
    severity: 'low' | 'moderate' | 'high';
    recommendation: string;
  }>;
  overallScore: number;
}

export const analyzeMuscleBalance = (
  records: WorkoutRecord[],
  exercises: Exercise[]
): MuscleBalance

// Comprehensive balance analysis
const balance = analyzeMuscleBalance(records, exercises);
console.log(`Push/Pull Ratio: ${balance.pushPullRatio.toFixed(2)}`);
console.log(`Balance Score: ${balance.overallScore}/100`);
```

### 📊 Trend Analysis

**Location:** `src/utils/functions/trends-analysis.ts`

#### Temporal Trends

```typescript
export const calculateTemporalTrends = (
  records: WorkoutRecord[],
  options: {
    timeframe?: string;
    smoothing?: boolean;
    detectOutliers?: boolean;
  }
) => ({
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  correlation: number;
  volatility: number;
  projections: Array<{
    date: Date;
    predictedValue: number;
    confidence: number;
  }>;
})

// Analyze progress trends over time
const trends = calculateTemporalTrends(records, {
  timeframe: '6months',
  smoothing: true,
  detectOutliers: true
});
```

#### Pattern Recognition

```typescript
export const identifyPerformancePatterns = (records: WorkoutRecord[]) => ({
  weeklyPatterns: Record<string, number>;
  seasonalEffects: Array<{
    period: string;
    impact: number;
    description: string;
  }>;
  plateauDetection: {
    inPlateau: boolean;
    plateauStart?: Date;
    duration?: number;
    breakoutProbability: number;
  };
})

// Identify training patterns and plateaus
const patterns = identifyPerformancePatterns(records);
if (patterns.plateauDetection.inPlateau) {
  console.log(`Plateau detected since ${patterns.plateauDetection.plateauStart}`);
}
```

---

## Data Processing

### 🔍 Filter Utilities

**Location:** `src/utils/functions/filter-utils.ts`

#### Date-based Filtering

```typescript
export const filterByDateRange = (
  records: WorkoutRecord[],
  dateRange: { start: Date; end: Date }
): WorkoutRecord[]

export const filterByTimeframe = (
  records: WorkoutRecord[],
  timeframe: '1week' | '1month' | '3months' | '6months' | '1year'
): WorkoutRecord[]

// Filter records by date range
const lastMonthRecords = filterByDateRange(records, {
  start: new Date(2024, 0, 1),
  end: new Date(2024, 0, 31)
});

// Filter by predefined timeframes
const last3Months = filterByTimeframe(records, '3months');
```

#### Exercise and Category Filtering

```typescript
export const filterByExercise = (
  records: WorkoutRecord[],
  exerciseIds: string[]
): WorkoutRecord[]

export const filterByCategory = (
  records: WorkoutRecord[],
  exercises: Exercise[],
  categories: string[]
): WorkoutRecord[]

export const searchExercises = (
  exercises: Exercise[],
  query: string
): Exercise[]

// Filter by specific exercises
const benchPressRecords = filterByExercise(records, ['bench-press-id']);

// Filter by muscle groups
const chestWorkouts = filterByCategory(records, exercises, ['Chest']);

// Search exercises by name
const pushExercises = searchExercises(exercises, 'push');
```

#### Advanced Filtering

```typescript
export const applyMultipleFilters = (
  records: WorkoutRecord[],
  filters: {
    dateRange?: { start: Date; end: Date };
    categories?: string[];
    exerciseIds?: string[];
    minWeight?: number;
    minVolume?: number;
    dayOfWeek?: DayOfWeek[];
  }
): WorkoutRecord[]

// Apply multiple filters simultaneously
const filtered = applyMultipleFilters(records, {
  dateRange: { start: lastMonth, end: today },
  categories: ['Chest', 'Shoulders'],
  minWeight: 50,
  dayOfWeek: ['lunes', 'miércoles', 'viernes']
});
```

### 📤 Export Utilities

**Location:** `src/utils/functions/export-utils.ts`

#### Excel Export

```typescript
export interface ExportOptions {
  includeCharts?: boolean;
  includeAnalysis?: boolean;
  filename?: string;
  format?: 'xlsx' | 'csv' | 'json';
}

export const exportToExcel = (
  exercises: Exercise[],
  workoutRecords: WorkoutRecord[],
  options: ExportOptions
): Promise<void>

// Export comprehensive workout data
await exportToExcel(exercises, workoutRecords, {
  includeCharts: true,
  includeAnalysis: true,
  filename: 'my-workout-data.xlsx'
});
```

#### Progress Reports

```typescript
export interface ProgressReportOptions {
  timeframe: string;
  includeForecasts?: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  categories?: string[];
}

export const generateProgressReport = (
  data: { exercises: Exercise[]; workoutRecords: WorkoutRecord[] },
  options: ProgressReportOptions
): Promise<ProgressReport>

// Generate detailed progress analysis
const report = await generateProgressReport(
  { exercises, workoutRecords },
  {
    timeframe: '1year',
    includeForecasts: true,
    detailLevel: 'comprehensive'
  }
);
```

---

## UI Utilities

### 🎨 Style Utilities

**Location:** `src/utils/functions/style-utils.ts`

#### Class Name Management

```typescript
export const cn = (...classes: Array<string | undefined | null | false>) => string

// Conditional class names with clsx-like functionality
const buttonClasses = cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50',
  size === 'large' && 'px-6 py-3'
);
```

#### Theme Integration

```typescript
export const getVariantClasses = (
  variant: UIVariant,
  size: UISize
): string

export const getThemeValue = (
  path: string,
  theme: any
): string

// Get themed classes
const classes = getVariantClasses('primary', 'lg');
// Returns: 'bg-blue-600 text-white hover:bg-blue-700 px-6 py-3'
```

### 🎨 Stat Card Utilities

**Location:** `src/utils/functions/stat-card-utils.ts`

#### Value Formatting

```typescript
export const formatStatValue = (
  value: number,
  options?: {
    unit?: string;
    precision?: number;
    compact?: boolean;
  }
): string

export const formatPercentage = (value: number, decimals = 1): string
export const formatWeight = (value: number, unit = 'kg'): string
export const formatReps = (value: number): string

// Format various stat values
const volume = formatStatValue(12450, { unit: 'kg', compact: true }); // "12.5k kg"
const percentage = formatPercentage(0.085); // "8.5%"
const weight = formatWeight(82.5); // "82.5 kg"
const reps = formatReps(156); // "156 reps"
```

#### Trend Analysis

```typescript
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number

export const isSignificantChange = (
  changePercent: number,
  threshold?: number
): boolean

// Calculate and assess changes
const change = calculatePercentageChange(100, 108); // 8
const isSignificant = isSignificantChange(change, 5); // true (change > 5%)
```

---

## Time & Date Utilities

### 🕒 Time Formatting

**Location:** `src/utils/functions/time-utils.ts`

#### Relative Time

```typescript
export const formatRelativeTime = (date: Date): string
export const getDaysDifference = (date1: Date, date2: Date): number
export const getHoursDifference = (date1: Date, date2: Date): number

// Human-readable time differences
const relativeTime = formatRelativeTime(workoutDate);
// Returns: "2 hours ago", "3 days ago", "1 week ago", etc.

const daysDiff = getDaysDifference(new Date(), lastWorkout.date); // 5
```

#### Date Checks

```typescript
export const isToday = (date: Date): boolean
export const isYesterday = (date: Date): boolean  
export const isThisWeek = (date: Date): boolean

// Quick date comparisons
const isRecentWorkout = isToday(workout.date);
const wasYesterday = isYesterday(workout.date);
const thisWeek = isThisWeek(workout.date);
```

#### Date Formatting

```typescript
export const formatCompactDate = (date: Date): string

// Compact date representation
const compactDate = formatCompactDate(new Date());
// Returns: "Jan 15", "Mar 3", etc.
```

### 📅 Calendar Utilities

**Location:** `src/utils/functions/calendar-utils.ts`

#### Calendar Generation

```typescript
export const generateCalendarDays = (month: number, year: number) => Array<{
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number;
}>

export const getWorkoutIntensity = (
  date: Date,
  workouts: WorkoutRecord[]
): 'none' | 'low' | 'medium' | 'high'

// Generate calendar with workout intensity
const calendarDays = generateCalendarDays(2, 2024); // February 2024
calendarDays.forEach(day => {
  const intensity = getWorkoutIntensity(day.date, workouts);
  console.log(`${day.date.getDate()}: ${intensity} intensity`);
});
```

---

## Export & Import

### 📤 Data Export

#### Backup Creation

```typescript
export const createBackupData = (data: {
  exercises: Exercise[];
  workoutRecords: WorkoutRecord[];
  assignments: ExerciseAssignment[];
}) => ({
  metadata: {
    version: string;
    exportDate: string;
    recordCount: number;
  };
  data: any;
})

// Create complete data backup
const backup = createBackupData({
  exercises,
  workoutRecords,
  assignments
});
```

#### Format-Specific Exports

```typescript
export const exportToJSON = (data: any): string
export const exportToCSV = (data: any[]): string

// Export to different formats
const jsonData = exportToJSON(workoutRecords);
const csvData = exportToCSV(workoutRecords);

// Download files
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Usage Patterns

### 🔄 Chaining Utilities

```typescript
import {
  filterByTimeframe,
  calculateCategoryMetrics,
  formatStatValue
} from './utils/functions';

// Chain multiple utilities for complex analysis
const recentRecords = filterByTimeframe(allRecords, '3months');
const categoryStats = calculateCategoryMetrics(recentRecords, exercises);

const formattedStats = categoryStats.map(stat => ({
  ...stat,
  formattedVolume: formatStatValue(stat.totalVolume, { unit: 'kg', compact: true }),
  formattedFrequency: `${stat.frequency}x/week`
}));
```

### ⚡ Performance Optimization

```typescript
// Memoize expensive calculations
import { useMemo } from 'react';

function StatsComponent({ records, exercises }) {
  const categoryMetrics = useMemo(() => 
    calculateCategoryMetrics(records, exercises),
    [records, exercises]
  );

  const strengthAnalysis = useMemo(() =>
    calculateAdvancedStrengthAnalysis(records),
    [records]
  );

  return (
    <div>
      {/* Render memoized calculations */}
    </div>
  );
}
```

### 🎯 Error Handling

```typescript
// Utility functions include built-in error handling
export const safeCalculateAverage = (numbers: number[]): number => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) {
    return 0;
  }
  
  return validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length;
};
```

For more implementation details, see the main [API Documentation](./API_DOCUMENTATION.md) and [Component Documentation](./COMPONENT_DOCUMENTATION.md).
