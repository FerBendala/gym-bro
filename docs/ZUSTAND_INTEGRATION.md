# Integración de Zustand en Follow Gym

## ¿Por qué Zustand?

Zustand es una librería de gestión de estado ligera y moderna que ofrece:

- **Simplicidad**: API más simple que Redux
- **TypeScript**: Soporte nativo excelente
- **Bundle size**: Muy ligero (~1KB)
- **React 18**: Compatible con concurrent features
- **DevTools**: Integración con Redux DevTools
- **Sin providers**: No necesitas envolver tu app en providers

## Estructura de Stores

### 1. App Store (`src/stores/app-store.ts`)

Store principal de la aplicación que maneja:

- Estado de conexión
- Estado del admin panel
- Datos de ejercicios y asignaciones
- Notificaciones globales

### 2. Admin Store (`src/stores/admin-store.ts`)

Store específico para el admin panel que maneja:

- Estado de UI del admin
- Operaciones CRUD de ejercicios y asignaciones
- Filtros y búsqueda
- Estados de carga y errores

## Uso Básico

### En un componente:

```tsx
import { useAppStore } from '@/stores/app-store';

const MyComponent = () => {
  const { isOnline, exercises } = useAppStore();

  return (
    <div>
      <p>Estado: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Ejercicios: {exercises.items.length}</p>
    </div>
  );
};
```

### Con selectores optimizados:

```tsx
import { useExercises, useOnlineStatus } from '@/stores/app-store';

const MyComponent = () => {
  const exercises = useExercises();
  const isOnline = useOnlineStatus();

  return (
    <div>
      <p>Estado: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Ejercicios: {exercises.items.length}</p>
    </div>
  );
};
```

## Hook Personalizado

### `useAdminStoreWithServices`

Integra Zustand con los servicios existentes:

```tsx
import { useAdminStoreWithServices } from '@/hooks/use-admin-store';

const AdminPanel = () => {
  const {
    exercises,
    assignments,
    loading,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    // ... más acciones
  } = useAdminStoreWithServices();

  return <div>{/* Tu UI aquí */}</div>;
};
```

## Características

### 1. Persistencia

Los datos se persisten automáticamente en localStorage:

```tsx
persist(
  (set, get) => ({
    // ... tu store
  }),
  {
    name: 'gymbro-store',
    partialize: (state) => ({
      // Solo persistir datos específicos
      exercises: { items: state.exercises.items },
      assignments: { items: state.assignments.items },
    }),
  }
);
```

### 2. DevTools

Integración con Redux DevTools para debugging:

```tsx
devtools(
  persist(
    (set, get) => ({
      // ... tu store
    }),
    { name: 'gymbro-store' }
  ),
  {
    name: 'gymbro-store',
  }
);
```

### 3. Selectores Optimizados

Evita re-renders innecesarios:

```tsx
// En lugar de usar todo el store
const { exercises, assignments, loading } = useAppStore();

// Usa selectores específicos
const exercises = useExercises();
const assignments = useAssignments();
const loading = useLoading();
```

## Migración Gradual

### Fase 1: ✅ Completada

- [x] Instalación de Zustand
- [x] Creación de stores básicos
- [x] Hook personalizado para integración
- [x] Provider para estado global

### Fase 2: En progreso

- [ ] Migrar componentes del admin panel
- [ ] Integrar con servicios existentes
- [ ] Testing de la integración

### Fase 3: Futuro

- [ ] Migrar otros componentes
- [ ] Optimizar performance
- [ ] Documentación completa

## Beneficios de la Migración

1. **Estado Centralizado**: Un solo lugar para todo el estado
2. **Mejor Performance**: Re-renders optimizados
3. **Debugging Mejorado**: DevTools integrados
4. **TypeScript**: Mejor tipado y autocompletado
5. **Mantenibilidad**: Código más limpio y organizado
6. **Escalabilidad**: Fácil agregar nuevas features

## Ejemplos de Uso

### Actualizar estado:

```tsx
const { setExercises, addExercise } = useAppStore();

// Actualizar toda la lista
setExercises(newExercises);

// Agregar un elemento
addExercise(newExercise);
```

### Acciones asíncronas:

```tsx
const { handleCreateExercise } = useAdminStoreWithServices();

const handleSubmit = async (data) => {
  const success = await handleCreateExercise(data);
  if (success) {
    // Mostrar notificación de éxito
  }
};
```

### Filtros y búsqueda:

```tsx
const { getFilteredExercises, setExerciseCategory } = useAdminStore();

// Cambiar filtro
setExerciseCategory('Pecho');

// Obtener ejercicios filtrados
const filteredExercises = getFilteredExercises();
```

## Consideraciones

1. **Compatibilidad**: Mantiene compatibilidad con código existente
2. **Migración Gradual**: Puedes migrar componente por componente
3. **Testing**: Fácil de testear con mocks
4. **Performance**: Optimizado para React 18
5. **Bundle Size**: Impacto mínimo en el tamaño del bundle
