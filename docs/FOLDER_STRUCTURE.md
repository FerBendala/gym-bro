# 📁 Estructura de Carpetas de Follow Gym

## 🎯 Visión General

La estructura del proyecto sigue principios de organización modular, separación de responsabilidades y escalabilidad. Cada carpeta tiene un propósito específico y bien definido.

## 📂 Estructura Raíz

```
follow-gym/
├── 📁 src/                    # Código fuente principal
├── 📁 docs/                   # Documentación del proyecto
├── 📁 chat/                   # Documentación de componentes
├── 📁 dist/                   # Build de producción
├── 📁 node_modules/           # Dependencias (gitignored)
├── 📄 package.json            # Configuración del proyecto
├── 📄 pnpm-lock.yaml         # Lock file de dependencias
├── 📄 vite.config.ts          # Configuración de Vite
├── 📄 tailwind.config.js      # Configuración de Tailwind
├── 📄 eslint.config.js        # Configuración de ESLint
├── 📄 tsconfig.json           # Configuración de TypeScript
└── 📄 README.md               # Documentación principal
```

## 🗂️ Estructura de `src/`

### 📁 `src/components/` - Biblioteca de Componentes

```
components/
├── 📁 accessibility/           # Componentes de accesibilidad
├── 📁 admin-panel/            # Panel de administración
│   ├── 📁 components/         # Subcomponentes del admin
│   ├── 📁 hooks/              # Hooks específicos del admin
│   └── 📁 utils/              # Utilidades del admin
├── 📁 analytics/              # Componentes de análisis
│   ├── 📁 components/         # Subcomponentes de analytics
│   ├── 📁 hooks/              # Hooks de analytics
│   └── 📁 utils/              # Utilidades de analytics
├── 📁 button/                 # Componente Button
├── 📁 card/                   # Componente Card
├── 📁 chart-legend/           # Leyendas de gráficos
├── 📁 connection-indicator/   # Indicador de conexión
├── 📁 data-export/            # Exportación de datos
├── 📁 date-picker/            # Selector de fechas
├── 📁 enhanced-charts/        # Gráficos mejorados
├── 📁 enhanced-tooltips/      # Tooltips mejorados
├── 📁 error-boundary/         # Manejo de errores
├── 📁 exercise-card/          # Tarjeta de ejercicio
├── 📁 exercise-list/          # Lista de ejercicios
├── 📁 exercise-progress-chart/ # Gráfico de progreso
├── 📁 exercise-stats/         # Estadísticas de ejercicios
├── 📁 export-system/          # Sistema de exportación
├── 📁 input/                  # Componente Input
├── 📁 layout/                 # Componentes de layout
├── 📁 loading-spinner/        # Spinner de carga
├── 📁 loading-states/         # Estados de carga
├── 📁 multi-select/           # Selector múltiple
├── 📁 notification/           # Sistema de notificaciones
├── 📁 offline-warning/        # Advertencia offline
├── 📁 progress-enhancements/  # Mejoras de progreso
├── 📁 recent-workouts/        # Entrenamientos recientes
├── 📁 responsive-enhancements/ # Mejoras responsive
├── 📁 select/                 # Componente Select
├── 📁 stat-card/              # Tarjeta de estadísticas
├── 📁 strength-progress/      # Progreso de fuerza
├── 📁 tab-navigation/         # Navegación por pestañas
├── 📁 tooltip/                # Componente Tooltip
├── 📁 url-preview/            # Vista previa de URLs
└── 📁 workout-calendar/       # Calendario de entrenamientos
```

### 📁 `src/pages/` - Páginas de la Aplicación

```
pages/
├── 📁 admin-panel/            # Página del panel admin
│   ├── 📁 components/         # Componentes específicos
│   ├── 📁 hooks/              # Hooks de la página
│   └── 📁 types.ts            # Tipos específicos
├── 📁 app/                    # Página principal de la app
│   ├── 📁 components/         # Componentes de la app
│   ├── 📁 hooks/              # Hooks de la app
│   └── 📁 constants.ts        # Constantes de la app
├── 📁 calendar/               # Página del calendario
├── 📁 dashboard/              # Página del dashboard
├── 📁 home/                   # Página de inicio
├── 📁 settings/               # Página de configuración
├── 📁 volume-settings/        # Configuración de volumen
└── 📁 workout-history/        # Historial de entrenamientos
```

### 📁 `src/stores/` - Gestión de Estado (Zustand)

```
stores/
├── 📁 admin/                  # Stores del admin panel
├── 📁 connection/             # Estado de conexión
├── 📁 data/                   # Stores de datos
├── 📁 modern-layout/          # Estado del layout
├── 📁 notification/           # Estado de notificaciones
├── 📄 index.ts                # Exportaciones de stores
└── 📄 types.ts                # Tipos de estado
```

### 📁 `src/utils/` - Utilidades y Funciones

```
utils/
├── 📁 data/                   # Utilidades de datos
├── 📁 functions/              # Funciones utilitarias
│   ├── 📄 math-utils.ts       # Utilidades matemáticas
│   ├── 📄 date-filter-utils.ts # Filtrado de fechas
│   ├── 📄 format-utils.ts     # Formateo de datos
│   ├── 📄 confidence-utils.ts # Utilidades de confianza
│   └── 📄 ...                 # Más utilidades
├── 📄 index.ts                # Exportaciones centralizadas
└── 📄 logger.ts               # Sistema de logging
```

### 📁 `src/hooks/` - Custom Hooks

```
hooks/
├── 📄 index.ts                # Exportaciones de hooks
├── 📄 use-advanced-analysis.ts # Hook de análisis avanzado
├── 📄 use-app-initialization.ts # Hook de inicialización
└── 📄 ...                     # Más hooks personalizados
```

### 📁 `src/interfaces/` - Tipos TypeScript

```
interfaces/
├── 📄 balance-types.ts        # Tipos de balance
├── 📄 common-props.ts         # Props comunes
├── 📄 dashboard.interfaces.ts # Interfaces del dashboard
└── 📄 ...                     # Más interfaces
```

### 📁 `src/constants/` - Constantes de la Aplicación

```
constants/
├── 📁 theme/                  # Constantes de tema
│   ├── 📄 colors.constants.ts # Colores del tema
│   ├── 📄 components.constants.ts # Constantes de componentes
│   └── 📄 effects.constants.ts # Efectos visuales
├── 📄 api.constants.ts        # Constantes de API
├── 📄 dashboard.constants.ts  # Constantes del dashboard
└── 📄 days.constants.ts       # Constantes de días
```

### 📁 `src/api/` - Servicios y APIs

```
api/
├── 📁 services/               # Servicios de API
│   ├── 📄 error-handler.ts    # Manejo de errores
│   ├── 📄 exercise-assignment-service.ts # Servicio de asignaciones
│   ├── 📄 exercise-service.ts # Servicio de ejercicios
│   └── 📄 ...                 # Más servicios
└── 📄 firebase.ts             # Configuración de Firebase
```

## 🎨 Patrones de Organización

### 1. **Organización por Funcionalidad**

Cada componente complejo tiene su propia carpeta con:

- `components/` - Subcomponentes
- `hooks/` - Hooks específicos
- `utils/` - Utilidades específicas
- `types.ts` - Tipos específicos
- `constants.ts` - Constantes específicas

### 2. **Separación de Responsabilidades**

```
📁 Componente Complejo/
├── 📄 index.tsx              # Punto de entrada
├── 📁 components/             # Subcomponentes
├── 📁 hooks/                  # Lógica de negocio
├── 📁 utils/                  # Utilidades específicas
├── 📄 types.ts                # Tipos específicos
└── 📄 constants.ts            # Constantes específicas
```

### 3. **Exportaciones Centralizadas**

Cada carpeta tiene un `index.ts` que centraliza las exportaciones:

```typescript
// src/components/button/index.ts
export { Button } from './button';
export type { ButtonProps } from './button';
```

## 🔧 Convenciones de Nomenclatura

### Archivos

- **Componentes**: `PascalCase.tsx` (ej: `ExerciseCard.tsx`)
- **Hooks**: `camelCase.ts` con prefijo `use-` (ej: `use-advanced-analysis.ts`)
- **Utilidades**: `camelCase.ts` (ej: `math-utils.ts`)
- **Tipos**: `camelCase.ts` (ej: `common-props.ts`)
- **Constantes**: `camelCase.constants.ts` (ej: `api.constants.ts`)

### Carpetas

- **Componentes**: `kebab-case/` (ej: `exercise-card/`)
- **Páginas**: `kebab-case/` (ej: `admin-panel/`)
- **Utilidades**: `camelCase/` (ej: `data/`)

## 📊 Estadísticas de Estructura

### Distribución de Archivos

- **Componentes**: ~100 archivos
- **Páginas**: ~10 archivos
- **Hooks**: ~15 archivos
- **Utilidades**: ~70 archivos
- **Tipos**: ~20 archivos
- **Constantes**: ~15 archivos

### Profundidad de Carpetas

- **Máxima**: 4 niveles
- **Promedio**: 2.5 niveles
- **Componentes complejos**: 3-4 niveles

## 🚀 Beneficios de la Estructura

### 1. **Escalabilidad**

- Fácil agregar nuevos componentes
- Organización clara para equipos grandes
- Separación de responsabilidades

### 2. **Mantenibilidad**

- Código organizado y fácil de encontrar
- Dependencias claras
- Refactoring simplificado

### 3. **Reutilización**

- Componentes modulares
- Utilidades centralizadas
- Patrones consistentes

### 4. **Performance**

- Lazy loading por carpetas
- Bundle splitting natural
- Tree shaking optimizado

## 🔮 Evolución de la Estructura

### Fase Actual (v1.0)

- ✅ Estructura modular establecida
- ✅ Separación de responsabilidades
- ✅ Convenciones de nomenclatura
- ✅ Exportaciones centralizadas

### Fase Futura (v2.0)

- 🚧 Micro-frontends por dominio
- 🚧 Monorepo con workspaces
- 🚧 Component library independiente
- �� API layer separada
