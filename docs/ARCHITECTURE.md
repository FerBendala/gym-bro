# 🏗️ Arquitectura del Proyecto Follow Gym

## 🎯 Visión General

Follow Gym sigue una arquitectura modular basada en componentes con separación clara de responsabilidades. La aplicación está diseñada para ser escalable, mantenible y performante.

## 🏛️ Patrón Arquitectónico

### Arquitectura por Capas

```
┌─────────────────────────────────────┐
│           Presentation Layer        │ ← Componentes React
├─────────────────────────────────────┤
│            Business Logic           │ ← Hooks y Utilidades
├─────────────────────────────────────┤
│           State Management          │ ← Zustand Stores
├─────────────────────────────────────┤
│           Data Access Layer         │ ← API Services
├─────────────────────────────────────┤
│           External Services         │ ← Firebase, IndexedDB
└─────────────────────────────────────┘
```

## 📁 Estructura de Capas

### 1. **Presentation Layer** (`src/components/`, `src/pages/`)

**Responsabilidades:**

- Renderizado de UI
- Interacción con usuarios
- Composición de componentes
- Manejo de eventos

**Patrones utilizados:**

- Component Composition
- Render Props
- Higher-Order Components (HOC)
- Custom Hooks

**Ejemplo:**

```tsx
// Componente compuesto
<ExerciseCard>
  <ExerciseHeader />
  <ExerciseStats />
  <ExerciseActions />
</ExerciseCard>
```

### 2. **Business Logic Layer** (`src/hooks/`, `src/utils/`)

**Responsabilidades:**

- Lógica de negocio
- Transformación de datos
- Validaciones
- Cálculos complejos

**Patrones utilizados:**

- Custom Hooks
- Utility Functions
- Service Objects
- Strategy Pattern

**Ejemplo:**

```tsx
// Hook de análisis avanzado
const analysis = useAdvancedAnalysis(records);
const trends = useTrendsAnalysis(records);
```

### 3. **State Management Layer** (`src/stores/`)

**Responsabilidades:**

- Estado global de la aplicación
- Sincronización entre componentes
- Persistencia de datos
- Cache management

**Patrones utilizados:**

- Zustand Stores
- Immutable Updates
- Selector Pattern
- Middleware Pattern

**Ejemplo:**

```tsx
// Store centralizado
const { exercises, addExercise, updateExercise } = useAppStore();
```

### 4. **Data Access Layer** (`src/api/`)

**Responsabilidades:**

- Comunicación con APIs externas
- Transformación de datos
- Manejo de errores
- Cache strategies

**Patrones utilizados:**

- Repository Pattern
- Adapter Pattern
- Error Boundary
- Retry Pattern

**Ejemplo:**

```tsx
// Servicio de ejercicios
const exerciseService = new ExerciseService();
const exercises = await exerciseService.getAll();
```

### 5. **External Services Layer**

**Responsabilidades:**

- Firebase Authentication
- Firestore Database
- IndexedDB Storage
- External APIs

## 🔄 Flujo de Datos

### Flujo Unidireccional

```
User Action → Component → Hook → Store → Service → External API
     ↑                                                      ↓
     └─────────────── UI Update ← State ← Data ←───────────┘
```

### Ejemplo de Flujo Completo

1. **Usuario hace clic en "Agregar Ejercicio"**
2. **Componente** captura el evento
3. **Hook** valida los datos
4. **Store** actualiza el estado
5. **Service** envía datos a Firebase
6. **Firebase** confirma la operación
7. **Store** actualiza el estado final
8. **UI** se re-renderiza

## 🎨 Patrones de Diseño Implementados

### 1. **Component Composition**

```tsx
// Composición flexible de componentes
<Card>
  <CardHeader>
    <CardTitle>Ejercicio</CardTitle>
    <CardActions>
      <EditButton />
      <DeleteButton />
    </CardActions>
  </CardHeader>
  <CardContent>
    <ExerciseStats />
  </CardContent>
</Card>
```

### 2. **Custom Hooks Pattern**

```tsx
// Hooks especializados
const useExerciseData = (exerciseId: string) => {
  // Lógica específica para ejercicios
};

const useWorkoutAnalysis = (workoutId: string) => {
  // Lógica de análisis de entrenamientos
};
```

### 3. **Store Pattern (Zustand)**

```tsx
// Store centralizado con selectores
const useAppStore = create<AppState>((set, get) => ({
  exercises: [],
  addExercise: (exercise) =>
    set((state) => ({
      exercises: [...state.exercises, exercise],
    })),
  // ... más acciones
}));
```

### 4. **Service Layer Pattern**

```tsx
// Servicios especializados
class ExerciseService {
  async getAll(): Promise<Exercise[]> {
    /* ... */
  }
  async create(exercise: Exercise): Promise<void> {
    /* ... */
  }
  async update(id: string, exercise: Exercise): Promise<void> {
    /* ... */
  }
  async delete(id: string): Promise<void> {
    /* ... */
  }
}
```

### 5. **Utility Functions Pattern**

```tsx
// Funciones utilitarias centralizadas
export const roundToDecimals = (value: number, decimals = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const filterRecordsByDays = (
  records: WorkoutRecord[],
  days: number
): WorkoutRecord[] => {
  // Lógica de filtrado
};
```

## 🔧 Principios de Diseño

### 1. **Single Responsibility Principle (SRP)**

Cada componente, hook y función tiene una responsabilidad única y bien definida.

```tsx
// ✅ Correcto: Responsabilidad única
const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
  return <div>{/* Solo renderizado del ejercicio */}</div>;
};

// ❌ Incorrecto: Múltiples responsabilidades
const ExerciseCard = ({ exercise }) => {
  // Renderizado + lógica de negocio + manejo de estado
};
```

### 2. **Open/Closed Principle (OCP)**

Los componentes están abiertos para extensión pero cerrados para modificación.

```tsx
// ✅ Extensible sin modificar
const Card = ({ children, variant = 'default' }: CardProps) => {
  return <div className={getCardStyles(variant)}>{children}</div>;
};
```

### 3. **Dependency Inversion Principle (DIP)**

Los componentes dependen de abstracciones, no de implementaciones concretas.

```tsx
// ✅ Dependencia de abstracción
const useExerciseData = (exerciseService: ExerciseService) => {
  // Lógica que usa el servicio
};

// ❌ Dependencia de implementación concreta
const useExerciseData = () => {
  // Lógica acoplada a Firebase
};
```

## 🚀 Optimizaciones de Rendimiento

### 1. **React.memo para Componentes**

```tsx
const ExerciseCard = React.memo(({ exercise }: ExerciseCardProps) => {
  return <div>{/* Renderizado */}</div>;
});
```

### 2. **useMemo para Cálculos Costosos**

```tsx
const expensiveCalculation = useMemo(() => {
  return calculateComplexMetrics(records);
}, [records]);
```

### 3. **useCallback para Funciones**

```tsx
const handleDelete = useCallback(
  (id: string) => {
    deleteExercise(id);
  },
  [deleteExercise]
);
```

### 4. **Lazy Loading de Componentes**

```tsx
const AdminPanel = lazy(() => import('./AdminPanel'));
const Analytics = lazy(() => import('./Analytics'));
```

## 🔒 Seguridad y Validación

### 1. **TypeScript para Type Safety**

```tsx
interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
}

// Validación en tiempo de compilación
const createExercise = (exercise: Exercise): void => {
  // TypeScript garantiza que exercise tiene la estructura correcta
};
```

### 2. **Validación de Datos**

```tsx
const validateExercise = (exercise: unknown): exercise is Exercise => {
  return (
    typeof exercise === 'object' &&
    exercise !== null &&
    'id' in exercise &&
    'name' in exercise
  );
};
```

### 3. **Sanitización de Inputs**

```tsx
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

## 📊 Métricas de Arquitectura

### Complejidad Ciclomática

- **Promedio**: 5.2
- **Máximo**: 10 (límite configurado)
- **Componentes críticos**: < 8

### Acoplamiento

- **Bajo acoplamiento**: Componentes independientes
- **Alta cohesión**: Funcionalidades relacionadas juntas
- **Dependencias claras**: Inyección de dependencias

### Mantenibilidad

- **Índice de mantenibilidad**: Alto
- **Documentación**: 100% de componentes documentados
- **Tests**: Cobertura planificada del 80%

## 🔮 Evolución de la Arquitectura

### Fase Actual (v1.0)

- ✅ Arquitectura modular establecida
- ✅ Separación de responsabilidades
- ✅ Patrones de diseño implementados
- ✅ Optimizaciones de rendimiento

### Fase Futura (v2.0)

- 🚧 Micro-frontends
- 🚧 Server-side rendering (SSR)
- 🚧 GraphQL para APIs
- 🚧 WebAssembly para cálculos complejos

## 📚 Referencias

- [React Architecture Patterns](https://react.dev/learn)
- [TypeScript Design Patterns](https://www.typescriptlang.org/docs/)
- [Zustand Best Practices](https://github.com/pmndrs/zustand)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
