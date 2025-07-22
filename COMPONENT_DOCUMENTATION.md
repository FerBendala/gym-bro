# 🧩 GymBro - Component Documentation

## Table of Contents

1. [Core Components](#core-components)
2. [UI Components](#ui-components)
3. [Layout Components](#layout-components)
4. [Data Components](#data-components)
5. [Chart Components](#chart-components)
6. [Component Props Reference](#component-props-reference)

---

## Core Components

### 🏋️ ExerciseCard

**Location:** `src/components/exercise-card/`

Primary component for displaying and interacting with individual exercises.

```typescript
interface ExerciseCardProps {
  exercise: Exercise;
  recentRecord?: WorkoutRecord;
  onWorkoutAdded: (record: WorkoutRecord) => void;
  onExerciseUpdated?: (exercise: Exercise) => void;
  showAdvancedMode?: boolean;
  isTrainedToday?: boolean;
  className?: string;
}

<ExerciseCard
  exercise={exercise}
  recentRecord={lastWorkout}
  onWorkoutAdded={handleWorkoutAdded}
  onExerciseUpdated={handleExerciseUpdate}
  showAdvancedMode={true}
  isTrainedToday={isTrainedToday}
/>
```

**Features:**
- Dual input modes (simple/advanced)
- Individual set tracking
- Recent workout display
- Progress indicators
- URL preview for exercise references

### 🏃‍♂️ ExerciseList

**Location:** `src/components/exercise-list/`

Drag-and-drop enabled list of exercises with assignment management.

```typescript
interface ExerciseListProps {
  exercises: Exercise[];
  assignments: ExerciseAssignment[];
  activeDay: DayOfWeek;
  onWorkoutAdded: (record: WorkoutRecord) => void;
  onAssignmentUpdated: (assignments: ExerciseAssignment[]) => void;
  onReorder: (reorderedAssignments: ExerciseAssignment[]) => void;
  showAdvancedMode?: boolean;
  className?: string;
}

<ExerciseList
  exercises={exercises}
  assignments={assignments}
  activeDay={currentDay}
  onWorkoutAdded={handleWorkoutAdded}
  onAssignmentUpdated={handleAssignmentUpdate}
  onReorder={handleReorder}
  showAdvancedMode={advancedMode}
/>
```

**Features:**
- Drag-and-drop reordering
- Day-specific exercise assignments
- Category filtering
- Bulk operations
- Visual training indicators

### 📊 Dashboard

**Location:** `src/components/dashboard/`

Comprehensive analytics dashboard with multiple analysis tabs.

```typescript
interface DashboardProps {
  exercises: Exercise[];
  workoutRecords: WorkoutRecord[];
  selectedExerciseId?: string;
  timeframe?: '1week' | '1month' | '3months' | '6months' | '1year';
  onExerciseSelect?: (exerciseId: string) => void;
  className?: string;
}

<Dashboard
  exercises={exercises}
  workoutRecords={workoutRecords}
  selectedExerciseId={selectedExercise}
  timeframe="3months"
  onExerciseSelect={handleExerciseSelect}
/>
```

**Available Tabs:**
- **Exercises**: Performance overview per exercise
- **Trends**: Progress trends and pattern analysis
- **Advanced**: Statistical analysis and predictions
- **Balance**: Muscle group balance assessment
- **Predictions**: AI-powered forecasting
- **History**: Historical workout timeline

---

## UI Components

### 🎨 Card System

**Location:** `src/components/card/`

Flexible card component with theming support.

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: UIVariant;
  size?: UISize;
  className?: string;
  header?: React.ReactNode;
}

// Basic usage
<Card variant="primary" size="lg">
  <p>Card content</p>
</Card>

// With header
<Card 
  variant="default" 
  header={<h3>Exercise Details</h3>}
>
  <ExerciseStats records={records} />
</Card>

// Manual header/content control
<Card>
  <CardHeader>
    <h3>Custom Header</h3>
  </CardHeader>
  <CardContent>
    <p>Custom content layout</p>
  </CardContent>
</Card>
```

### 🔘 Modern Button System

**Location:** `src/components/modern-ui/modern-button.tsx`

Enhanced button components with multiple variants.

```typescript
// Primary button
<ModernButton 
  variant="primary" 
  size="lg"
  onClick={handleSubmit}
>
  Save Workout
</ModernButton>

// Icon button
<ModernIconButton
  icon={PlusIcon}
  variant="success"
  size="sm"
  onClick={handleAdd}
  aria-label="Add exercise"
/>

// Floating action button
<ModernFloatingButton
  icon={PlayIcon}
  onClick={handleStartWorkout}
  className="fixed bottom-4 right-4"
/>
```

### 📊 StatCard

**Location:** `src/components/stat-card/`

Reusable statistical display component.

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: UIVariant;
  size?: UISize;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

<StatCard
  title="Total Volume"
  value="12,450 kg"
  subtitle="This month"
  trend="up"
  trendValue="+8.5%"
  variant="success"
  icon={TrendingUpIcon}
  onClick={handleViewDetails}
/>
```

### 🔄 LoadingSpinner

**Location:** `src/components/loading-spinner/`

Configurable loading indicators.

```typescript
interface LoadingSpinnerProps {
  size?: UISize;
  variant?: UIVariant;
  className?: string;
  text?: string;
}

// Simple spinner
<LoadingSpinner size="lg" />

// Spinner with text
<LoadingSpinner 
  size="md" 
  text="Loading workouts..." 
  variant="primary"
/>
```

---

## Layout Components

### 🏗️ ModernLayout

**Location:** `src/components/modern-layout/`

Main application layout with navigation and responsive design.

```typescript
interface ModernLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  navigationType?: NavigationType;
  className?: string;
}

<ModernLayout
  activeTab={activeTab}
  onTabChange={handleTabChange}
  title="My Workouts"
  subtitle="Today's training session"
  showBackButton={canGoBack}
  onBackClick={handleGoBack}
  navigationType="compact"
>
  <WorkoutContent />
</ModernLayout>
```

### 📱 ModernPage

**Location:** `src/components/modern-layout/modern-page.tsx`

Page wrapper with consistent spacing and responsive behavior.

```typescript
interface ModernPageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

<ModernPage 
  title="Exercise Analytics"
  subtitle="Performance insights and trends"
  actions={
    <ModernButton variant="primary">
      Export Data
    </ModernButton>
  }
>
  <AnalyticsContent />
</ModernPage>
```

---

## Data Components

### 📈 ExerciseProgressChart

**Location:** `src/components/exercise-progress-chart/`

Interactive chart for visualizing exercise progress over time.

```typescript
interface ExerciseProgressChartProps {
  exerciseId: string;
  records: WorkoutRecord[];
  timeframe?: string;
  metric?: 'volume' | 'weight' | 'reps' | '1rm';
  showPredictions?: boolean;
  showTrendLine?: boolean;
  height?: number;
  onDataPointClick?: (record: WorkoutRecord) => void;
  className?: string;
}

<ExerciseProgressChart
  exerciseId="bench-press-123"
  records={workoutRecords}
  timeframe="6months"
  metric="weight"
  showPredictions={true}
  showTrendLine={true}
  height={400}
  onDataPointClick={handlePointClick}
/>
```

### 📊 ExerciseStats

**Location:** `src/components/exercise-stats/`

Statistical summary component for exercise performance.

```typescript
interface ExerciseStatsProps {
  records: WorkoutRecord[];
  timeframe?: string;
  showTrends?: boolean;
  compactMode?: boolean;
  showComparison?: boolean;
  className?: string;
}

<ExerciseStats
  records={exerciseRecords}
  timeframe="3months"
  showTrends={true}
  compactMode={false}
  showComparison={true}
/>
```

### 📅 WorkoutCalendar

**Location:** `src/components/workout-calendar/`

Monthly calendar view with workout intensity visualization.

```typescript
interface WorkoutCalendarProps {
  workouts: WorkoutRecord[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onWorkoutClick?: (workouts: WorkoutRecord[], date: Date) => void;
  showIntensity?: boolean;
  highlightToday?: boolean;
  className?: string;
}

<WorkoutCalendar
  workouts={allWorkouts}
  selectedDate={selectedDate}
  onDateSelect={handleDateSelect}
  onWorkoutClick={handleWorkoutClick}
  showIntensity={true}
  highlightToday={true}
/>
```

### 🔍 RecentWorkouts

**Location:** `src/components/recent-workouts/`

Display component for recent workout history with management options.

```typescript
interface RecentWorkoutsProps {
  workouts: WorkoutRecord[];
  exercises: Exercise[];
  limit?: number;
  onWorkoutDelete?: (workoutId: string) => void;
  onWorkoutEdit?: (workout: WorkoutRecord) => void;
  onExerciseClick?: (exerciseId: string) => void;
  showActions?: boolean;
  className?: string;
}

<RecentWorkouts
  workouts={recentWorkouts}
  exercises={exercises}
  limit={10}
  onWorkoutDelete={handleDelete}
  onWorkoutEdit={handleEdit}
  onExerciseClick={handleExerciseView}
  showActions={true}
/>
```

---

## Chart Components

### 📊 Chart Utilities Integration

All chart components use the centralized chart utilities and theme system.

```typescript
import { formatChartData, generateChartOptions } from './utils/functions/chart-utils';
import { THEME_CHART } from './constants/theme';

// Example chart component implementation
function CustomChart({ data, options }: ChartProps) {
  const formattedData = formatChartData(data, {
    groupBy: 'week',
    metric: 'volume'
  });

  const chartOptions = generateChartOptions({
    ...options,
    theme: 'dark',
    colors: THEME_CHART.colors,
    responsive: true
  });

  return (
    <Chart
      options={chartOptions}
      series={formattedData}
      type="line"
      height={350}
    />
  );
}
```

### 📈 Available Chart Types

1. **Line Charts**: Progress trends over time
2. **Bar Charts**: Comparative analysis
3. **Area Charts**: Volume and intensity visualization
4. **Pie Charts**: Category distribution
5. **Radar Charts**: Muscle balance assessment
6. **Heatmaps**: Calendar intensity visualization

---

## Component Props Reference

### 🎯 Common Prop Types

```typescript
// UI Variants
type UIVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
type UISize = 'sm' | 'md' | 'lg';

// Base props for most components
interface BaseUIProps {
  className?: string;
  variant?: UIVariant;
  size?: UISize;
}

// Event handler types
type WorkoutEventHandler = (record: WorkoutRecord) => void;
type ExerciseEventHandler = (exercise: Exercise) => void;
type DateEventHandler = (date: Date) => void;

// Data props
interface ExerciseDataProps {
  exercises: Exercise[];
  workoutRecords: WorkoutRecord[];
  assignments?: ExerciseAssignment[];
}

// Filter and sort options
interface FilterOptions {
  dateRange?: { start: Date; end: Date };
  categories?: string[];
  exerciseIds?: string[];
}

interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

### 🔧 Advanced Component Patterns

#### Render Props Pattern

```typescript
interface ExerciseListRenderProps {
  exercises: Exercise[];
  loading: boolean;
  error?: string;
  refetch: () => void;
}

<ExerciseListProvider>
  {({ exercises, loading, error, refetch }: ExerciseListRenderProps) => (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {exercises.map(exercise => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  )}
</ExerciseListProvider>
```

#### Compound Components

```typescript
<Card>
  <Card.Header>
    <h3>Workout Summary</h3>
    <Card.Actions>
      <ModernButton variant="ghost">Edit</ModernButton>
    </Card.Actions>
  </Card.Header>
  
  <Card.Content>
    <StatCard title="Volume" value="2,450 kg" />
  </Card.Content>
  
  <Card.Footer>
    <p>Completed 2 hours ago</p>
  </Card.Footer>
</Card>
```

#### Hook Integration

```typescript
function MyExerciseComponent() {
  const { exercises, addExercise, loading } = useOfflineData();
  const isOnline = useOnlineStatus();
  
  return (
    <ExerciseList
      exercises={exercises}
      onAddExercise={addExercise}
      isLoading={loading}
      showOfflineIndicator={!isOnline}
    />
  );
}
```

---

## Component Testing

### 🧪 Testing Patterns

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseCard } from './ExerciseCard';

describe('ExerciseCard', () => {
  const mockExercise = {
    id: '1',
    name: 'Push-ups',
    categories: ['Chest'],
    description: 'Basic exercise'
  };

  it('renders exercise information', () => {
    render(
      <ExerciseCard 
        exercise={mockExercise}
        onWorkoutAdded={jest.fn()}
      />
    );

    expect(screen.getByText('Push-ups')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
  });

  it('calls onWorkoutAdded when workout is recorded', () => {
    const mockOnWorkoutAdded = jest.fn();
    
    render(
      <ExerciseCard 
        exercise={mockExercise}
        onWorkoutAdded={mockOnWorkoutAdded}
      />
    );

    fireEvent.click(screen.getByText('Record Workout'));
    // ... test workout recording flow
    
    expect(mockOnWorkoutAdded).toHaveBeenCalled();
  });
});
```

### 🎨 Storybook Integration

```typescript
// Component story example
export default {
  title: 'Components/ExerciseCard',
  component: ExerciseCard,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary']
    }
  }
};

export const Default = {
  args: {
    exercise: {
      id: '1',
      name: 'Bench Press',
      categories: ['Chest', 'Triceps'],
      description: 'Classic chest exercise'
    },
    showAdvancedMode: false
  }
};

export const WithRecentRecord = {
  args: {
    ...Default.args,
    recentRecord: {
      id: '1',
      weight: 80,
      reps: 10,
      sets: 3,
      date: new Date()
    }
  }
};
```

For more detailed implementation examples, see the main [API Documentation](./API_DOCUMENTATION.md).
