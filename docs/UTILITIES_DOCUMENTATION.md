# Documentación de Utilidades Centralizadas

## 📋 **ÍNDICE**

1. [Utilidades Matemáticas](#utilidades-matemáticas)
2. [Utilidades de Filtrado de Fecha](#utilidades-de-filtrado-de-fecha)
3. [Utilidades de Formateo](#utilidades-de-formateo)
4. [Utilidades de Confianza](#utilidades-de-confianza)
5. [Hooks Centralizados](#hooks-centralizados)
6. [Interfaces Props Comunes](#interfaces-props-comunes)

---

## 🔢 **UTILIDADES MATEMÁTICAS**

### `roundToDecimals(value, decimals?)`

Redondea un número a un número específico de decimales.

**Parámetros:**

- `value: number` - Valor a redondear
- `decimals: number` (opcional) - Número de decimales (por defecto: 2)

**Retorna:** `number`

**Ejemplo:**

```typescript
import { roundToDecimals } from '@/utils/functions/math-utils';

roundToDecimals(3.14159, 2); // 3.14
roundToDecimals(3.14159); // 3.14
```

### `clamp(value, min, max)`

Limita un valor entre un mínimo y máximo.

**Parámetros:**

- `value: number` - Valor a limitar
- `min: number` - Valor mínimo
- `max: number` - Valor máximo

**Retorna:** `number`

**Ejemplo:**

```typescript
import { clamp } from '@/utils/functions/math-utils';

clamp(15, 0, 10); // 10
clamp(-5, 0, 10); // 0
clamp(5, 0, 10); // 5
```

### `roundToDecimalsBatch(values, decimals?)`

Procesa múltiples valores en batch para redondeo.

**Parámetros:**

- `values: Record<string, number>` - Objeto con valores a redondear
- `decimals: Record<string, number>` (opcional) - Decimales específicos por clave

**Retorna:** `Record<string, number>`

**Ejemplo:**

```typescript
import { roundToDecimalsBatch } from '@/utils/functions/math-utils';

const values = { weight: 3.14159, volume: 1234.567 };
const decimals = { weight: 2, volume: 0 };

roundToDecimalsBatch(values, decimals);
// { weight: 3.14, volume: 1235 }
```

### `validateAndRound(value, min, max, decimals?)`

Combina validación y redondeo en una operación.

**Parámetros:**

- `value: number` - Valor a validar y redondear
- `min: number` - Valor mínimo
- `max: number` - Valor máximo
- `decimals: number` (opcional) - Decimales (por defecto: 2)

**Retorna:** `number`

**Ejemplo:**

```typescript
import { validateAndRound } from '@/utils/functions/math-utils';

validateAndRound(15, 0, 10, 1); // 10.0
validateAndRound(3.14159, 0, 10, 2); // 3.14
```

---

## 📅 **UTILIDADES DE FILTRADO DE FECHA**

### `filterRecordsByDaysFromToday(records, days)`

Filtra registros por rango de días desde hoy.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros
- `days: number` - Número de días desde hoy

**Retorna:** `WorkoutRecord[]`

**Ejemplo:**

```typescript
import { filterRecordsByDaysFromToday } from '@/utils/functions/date-filter-utils';

const recentRecords = filterRecordsByDaysFromToday(records, 30);
```

### `filterRecordsByDayRange(records, minDays, maxDays)`

Filtra registros por rango de días específico.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros
- `minDays: number` - Días mínimos desde hoy
- `maxDays: number` - Días máximos desde hoy

**Retorna:** `WorkoutRecord[]`

**Ejemplo:**

```typescript
import { filterRecordsByDayRange } from '@/utils/functions/date-filter-utils';

const weekOldRecords = filterRecordsByDayRange(records, 7, 14);
```

### `filterRecordsByDateRange(records, startDate, endDate?)`

Filtra registros por período de tiempo específico.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros
- `startDate: Date` - Fecha de inicio
- `endDate: Date` (opcional) - Fecha de fin (por defecto: hoy)

**Retorna:** `WorkoutRecord[]`

**Ejemplo:**

```typescript
import { filterRecordsByDateRange } from '@/utils/functions/date-filter-utils';

const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
const januaryRecords = filterRecordsByDateRange(records, startDate, endDate);
```

### `splitRecordsByChronologicalMidpoint(records)`

Divide registros en dos períodos cronológicos.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros

**Retorna:** `{ firstHalf: WorkoutRecord[], secondHalf: WorkoutRecord[] }`

**Ejemplo:**

```typescript
import { splitRecordsByChronologicalMidpoint } from '@/utils/functions/date-filter-utils';

const { firstHalf, secondHalf } = splitRecordsByChronologicalMidpoint(records);
```

---

## 📝 **UTILIDADES DE FORMATEO**

### `formatMetricsBatch(metrics, decimals?)`

Formatea múltiples métricas en una sola operación.

**Parámetros:**

- `metrics: Record<string, number>` - Objeto con métricas a formatear
- `decimals: Record<string, number>` (opcional) - Decimales específicos por clave

**Retorna:** `Record<string, string>`

**Ejemplo:**

```typescript
import { formatMetricsBatch } from '@/utils/functions/format-utils';

const metrics = { weight: 3.14159, volume: 1234.567 };
const decimals = { weight: 2, volume: 0 };

formatMetricsBatch(metrics, decimals);
// { weight: "3.14", volume: "1235" }
```

### `formatProgressMetrics(metrics, decimals?)`

Formatea métricas de progreso con signos.

**Parámetros:**

- `metrics: Record<string, number>` - Objeto con métricas de progreso
- `decimals: Record<string, number>` (opcional) - Decimales específicos

**Retorna:** `Record<string, string>`

**Ejemplo:**

```typescript
import { formatProgressMetrics } from '@/utils/functions/format-utils';

const progress = { weight: 2.5, volume: -1.2 };
formatProgressMetrics(progress);
// { weight: "+2.5", volume: "-1.2" }
```

### `formatComparisonMetrics(before, after, decimals?)`

Formatea métricas de comparación (antes/después).

**Parámetros:**

- `before: Record<string, number>` - Valores antes
- `after: Record<string, number>` - Valores después
- `decimals: Record<string, number>` (opcional) - Decimales específicos

**Retorna:** `Record<string, string>`

**Ejemplo:**

```typescript
import { formatComparisonMetrics } from '@/utils/functions/format-utils';

const before = { weight: 100 };
const after = { weight: 105 };

formatComparisonMetrics(before, after);
// { weight: "100 → 105 (+5)" }
```

---

## 🎯 **UTILIDADES DE CONFIANZA**

### `getConfidenceExplanation(confidence)`

Obtiene explicación detallada del nivel de confianza.

**Parámetros:**

- `confidence: number` - Nivel de confianza (0-100)

**Retorna:** `ConfidenceExplanation`

**Ejemplo:**

```typescript
import { getConfidenceExplanation } from '@/utils/functions/confidence-utils';

const explanation = getConfidenceExplanation(85);
// {
//   level: 'Muy Alta',
//   description: 'Predicción muy confiable...',
//   color: 'text-green-400',
//   factors: ['Datos abundantes...', ...]
// }
```

### `getConfidenceBadgeColor(confidence)`

Obtiene el color del badge de confianza.

**Parámetros:**

- `confidence: number` - Nivel de confianza (0-100)

**Retorna:** `string`

**Ejemplo:**

```typescript
import { getConfidenceBadgeColor } from '@/utils/functions/confidence-utils';

const badgeColor = getConfidenceBadgeColor(85);
// "bg-green-500/20 text-green-400 border-green-500/30"
```

### `getConfidenceIcon(confidence)`

Obtiene el icono de confianza.

**Parámetros:**

- `confidence: number` - Nivel de confianza (0-100)

**Retorna:** `string`

**Ejemplo:**

```typescript
import { getConfidenceIcon } from '@/utils/functions/confidence-utils';

const icon = getConfidenceIcon(85);
// "🎯"
```

---

## 🪝 **HOOKS CENTRALIZADOS**

### `useAdvancedAnalysis(records)`

Hook centralizado para análisis avanzado.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros

**Retorna:** `AdvancedAnalysis`

**Ejemplo:**

```typescript
import { useAdvancedAnalysis } from '@/hooks/use-advanced-analysis';

const analysis = useAdvancedAnalysis(records);
```

### `useTrendsAnalysis(records)`

Hook centralizado para análisis de tendencias.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros

**Retorna:** `TrendsAnalysis`

**Ejemplo:**

```typescript
import { useTrendsAnalysis } from '@/hooks/use-advanced-analysis';

const trends = useTrendsAnalysis(records);
```

### `useExerciseAnalysis(records)`

Hook centralizado para análisis de ejercicios.

**Parámetros:**

- `records: WorkoutRecord[]` - Array de registros

**Retorna:** `ExerciseAnalysis[]`

**Ejemplo:**

```typescript
import { useExerciseAnalysis } from '@/hooks/use-advanced-analysis';

const exerciseAnalysis = useExerciseAnalysis(records);
```

---

## 🏗️ **INTERFACES PROPS COMUNES**

### `RecordsProps`

Props base para componentes con registros de entrenamiento.

```typescript
interface RecordsProps {
  records: WorkoutRecord[];
}
```

### `RecordsWithLimitProps`

Props base para componentes con registros y límite opcional.

```typescript
interface RecordsWithLimitProps extends RecordsProps {
  maxRecords?: number;
}
```

### `RecordsWithDeleteProps`

Props base para componentes con registros y callback de eliminación.

```typescript
interface RecordsWithDeleteProps extends RecordsProps {
  onDeleteRecord?: (recordId: string) => Promise<void>;
}
```

### `RecordsWithFiltersProps`

Props base para componentes con registros y filtros.

```typescript
interface RecordsWithFiltersProps extends RecordsProps {
  filters?: {
    category?: string;
    exercise?: string;
    dateRange?: { start: Date; end: Date };
    minWeight?: number;
    maxWeight?: number;
  };
}
```

### `RecordsWithDisplayProps`

Props base para componentes con registros y configuración de visualización.

```typescript
interface RecordsWithDisplayProps extends RecordsProps {
  displayOptions?: {
    showDetails?: boolean;
    showTooltips?: boolean;
    showProgress?: boolean;
    showTrends?: boolean;
    compact?: boolean;
  };
}
```

---

## 📊 **ESTADÍSTICAS DE USO**

### **Utilidades Matemáticas**

- `roundToDecimals`: +50 usos
- `clamp`: +15 usos
- `roundToDecimalsBatch`: Nuevo (optimización)
- `validateAndRound`: Nuevo (optimización)

### **Utilidades de Filtrado**

- `filterRecordsByDaysFromToday`: +6 usos
- `filterRecordsByDayRange`: +4 usos
- `filterRecordsByDateRange`: +3 usos
- `splitRecordsByChronologicalMidpoint`: +2 usos

### **Utilidades de Formateo**

- `formatMetricsBatch`: Nuevo (optimización)
- `formatProgressMetrics`: Nuevo (optimización)
- `formatComparisonMetrics`: Nuevo (optimización)

### **Utilidades de Confianza**

- `getConfidenceExplanation`: +3 usos
- `getConfidenceBadgeColor`: Nuevo
- `getConfidenceIcon`: Nuevo

### **Hooks Centralizados**

- `useAdvancedAnalysis`: +4 usos
- `useTrendsAnalysis`: +2 usos
- `useExerciseAnalysis`: +2 usos

### **Interfaces Props**

- `RecordsProps`: +10 componentes
- `RecordsWithLimitProps`: +5 componentes
- `RecordsWithDeleteProps`: +3 componentes
- `RecordsWithFiltersProps`: +3 componentes

---

## 🚀 **BENEFICIOS DE LA CENTRALIZACIÓN**

### **Rendimiento**

- Eliminación de cálculos redundantes
- Optimización de procesamiento por lotes
- Reducción de re-renders innecesarios

### **Mantenibilidad**

- Una sola fuente de verdad
- Fácil actualización de lógica común
- Consistencia en toda la aplicación

### **Escalabilidad**

- Fácil agregar nuevas utilidades
- Patrones reutilizables
- Arquitectura modular

### **Legibilidad**

- Código más limpio y organizado
- Nombres descriptivos y consistentes
- Documentación completa

---

## 📝 **GUÍAS DE USO**

### **Cuándo usar batch processing**

- Cuando se procesan múltiples valores similares
- Para optimizar rendimiento en operaciones repetitivas
- Cuando se necesitan diferentes decimales por tipo de valor

### **Cuándo usar hooks centralizados**

- Cuando múltiples componentes necesitan el mismo análisis
- Para evitar duplicación de cálculos costosos
- Para mantener consistencia en el estado de análisis

### **Cuándo usar interfaces Props comunes**

- Cuando múltiples componentes comparten props similares
- Para estandarizar la API de componentes
- Para facilitar la reutilización de componentes

---

## 🔧 **MIGRACIÓN DE CÓDIGO EXISTENTE**

### **Antes (código duplicado)**

```typescript
// Múltiples archivos con lógica similar
const sortedRecords = [...records].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);

const roundedValue = Math.round(value * 100) / 100;
```

### **Después (código centralizado)**

```typescript
// Usar utilidades centralizadas
import { sortRecordsByDateAscending, roundToDecimals } from '@/utils/functions';

const sortedRecords = sortRecordsByDateAscending(records);
const roundedValue = roundToDecimals(value);
```

---

## 📚 **REFERENCIAS**

- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Patrones de diseño](https://refactoring.guru/design-patterns)
