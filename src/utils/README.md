# Utilidades del Proyecto

Esta carpeta contiene todas las funciones utilitarias del proyecto organizadas por dominio y siguiendo las mejores prácticas.

## Estructura

```
src/utils/
├── index.ts              # Exportaciones centralizadas
├── date.utils.ts         # Utilidades de fechas y calendario
├── string.utils.ts       # Utilidades de strings y formateo
├── api.utils.ts          # Utilidades de API y URLs
├── data/                 # Utilidades de base de datos
│   ├── indexeddb-config.ts
│   ├── indexeddb-types.ts
│   ├── indexeddb-utils.ts
│   └── sync-manager.ts
└── functions/            # Funciones específicas del dominio
    ├── advanced-analysis.ts
    ├── category-analysis.ts
    ├── exercise-utils.ts
    ├── export-utils.ts
    ├── stats-utils.ts
    ├── trends-analysis.ts
    └── workout-utils.ts
```

## Archivos Principales

### `index.ts`

Archivo principal que exporta todas las utilidades. Mantiene compatibilidad con el código existente mediante re-exportaciones específicas.

### `date.utils.ts`

- Filtrado de registros por tiempo
- Formateo de fechas y tiempo relativo
- Funciones de calendario
- Validaciones de fechas
- Operaciones con días de la semana

### `string.utils.ts`

- Combinación de clases CSS
- Formateo de números y porcentajes
- Validación de tamaños y variantes
- Utilidades de URLs
- Funciones de select y filtrado

### `api.utils.ts`

- Validación de URLs
- Análisis de URLs (YouTube, imágenes, videos)
- Funciones de notificaciones
- Manejo seguro de URLs

### `data/`

Contiene utilidades para IndexedDB y sincronización:

- Configuración de la base de datos
- Tipos de datos
- Operaciones CRUD
- Sistema de sincronización

### `functions/`

Contiene funciones específicas del dominio de fitness:

- Análisis avanzado de progreso
- Análisis por categorías musculares
- Utilidades de ejercicios
- Exportación de datos
- Estadísticas y métricas
- Análisis de tendencias
- Utilidades de entrenamientos

## Principios de Organización

1. **Una carpeta utils por dominio**: Solo existe una carpeta utils global
2. **Funciones puras**: Sin dependencias de UI ni lógica de negocio específica
3. **Nombres claros**: Archivos específicos como `date.utils.ts`, `string.utils.ts`
4. **Agrupación coherente**: Solo funciones relacionadas en un mismo archivo
5. **Importaciones absolutas**: Uso de `@` para rutas absolutas
6. **Tipado correcto**: Todas las funciones están tipadas

## Uso

```typescript
// Importar utilidades específicas
import { formatDate, filterRecordsByTime } from '@/utils/date.utils';
import { formatNumber, capitalize } from '@/utils/string.utils';
import { validateURL, analyzeURL } from '@/utils/api.utils';

// O importar desde el índice principal
import {
  formatDate,
  formatNumber,
  validateURL,
  calculateProgress,
} from '@/utils';
```

## Compatibilidad

El archivo `index.ts` mantiene compatibilidad con el código existente mediante re-exportaciones específicas de las funciones más utilizadas de los archivos en `functions/`.

## Mantenimiento

- ✅ No añadir carpetas dentro de utils
- ✅ No poner lógica de negocio ni dependencias de UI
- ✅ Eliminar helpers no usados o duplicados
- ✅ Mantener código claro, limpio y probado
- ✅ Seguir los principios de organización establecidos
