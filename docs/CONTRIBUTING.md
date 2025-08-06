# 🤝 Guía de Contribución - Follow Gym

## 🎯 Bienvenido

¡Gracias por tu interés en contribuir a Follow Gym! Este documento te guiará a través del proceso de contribución y te ayudará a entender cómo puedes participar en el desarrollo del proyecto.

## 📋 Índice

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)
- [Revisión de Código](#revisión-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

## 📜 Código de Conducta

### Nuestros Estándares

Como contribuidores y mantenedores de este proyecto, nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de:

- Edad
- Tamaño corporal
- Discapacidad
- Etnia
- Características sexuales
- Identidad y expresión de género
- Nivel de experiencia
- Educación
- Estatus socioeconómico
- Nacionalidad
- Apariencia personal
- Raza
- Religión
- Identidad y orientación sexual

### Nuestras Responsabilidades

Los mantenedores del proyecto son responsables de aclarar los estándares de comportamiento aceptable y se espera que tomen medidas correctivas apropiadas y justas en respuesta a cualquier caso de comportamiento inaceptable.

### Aplicación

Los casos de comportamiento abusivo, acosador o inaceptable pueden ser reportados contactando al equipo del proyecto. Todas las quejas serán revisadas e investigadas y resultarán en una respuesta que se considere necesaria y apropiada a las circunstancias.

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

Aceptamos varios tipos de contribuciones:

#### 🐛 **Reportar Bugs**

- Usar el template de issue para bugs
- Incluir pasos para reproducir
- Proporcionar información del entorno
- Adjuntar logs si es relevante

#### 💡 **Solicitar Features**

- Describir la funcionalidad deseada
- Explicar el caso de uso
- Proponer una implementación si es posible
- Discutir alternativas consideradas

#### 📝 **Mejorar Documentación**

- Corregir errores en la documentación
- Agregar ejemplos y casos de uso
- Mejorar la claridad y estructura
- Traducir a otros idiomas

#### 🔧 **Contribuir Código**

- Implementar nuevas funcionalidades
- Corregir bugs existentes
- Mejorar el rendimiento
- Refactorizar código legacy

#### 🧪 **Testing**

- Escribir tests unitarios
- Implementar tests de integración
- Mejorar la cobertura de tests
- Reportar bugs encontrados en testing

### Niveles de Contribución

#### 🌱 **Principiante**

- Reportar bugs
- Mejorar documentación
- Tests simples
- Correcciones menores

#### 🌿 **Intermedio**

- Implementar features pequeñas
- Refactorizar código
- Mejorar tests
- Optimizaciones menores

#### 🌳 **Avanzado**

- Features complejas
- Arquitectura del sistema
- Performance crítico
- Mentoring de otros contribuidores

## ⚙️ Configuración del Entorno

### Prerrequisitos

```bash
# Verificar versiones
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
git --version   # >= 2.30.0
```

### Configuración Inicial

```bash
# 1. Fork del repositorio
# Ve a GitHub y haz fork del repositorio

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/follow-gym.git
cd follow-gym

# 3. Agregar el repositorio original como upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/follow-gym.git

# 4. Instalar dependencias
pnpm install

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 6. Verificar que todo funciona
pnpm dev
```

### Configuración de Git

```bash
# Configurar tu información
git config user.name "Tu Nombre"
git config user.email "tu.email@ejemplo.com"

# Configurar hooks de pre-commit (opcional)
pnpm add -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "pnpm lint-staged"
```

## 🔄 Flujo de Trabajo

### 1. **Crear una Rama**

```bash
# Actualizar tu rama principal
git checkout main
git pull upstream main

# Crear una nueva rama para tu feature
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/nombre-del-bug
# o
git checkout -b docs/mejora-documentacion
```

### 2. **Desarrollar tu Cambio**

```bash
# Hacer tus cambios
# Asegúrate de seguir los estándares de código

# Verificar que todo funciona
pnpm dev
pnpm test
pnpm lint

# Hacer commit de tus cambios
git add .
git commit -m "feat: agregar nueva funcionalidad X

- Descripción detallada de los cambios
- Beneficios de la implementación
- Tests agregados
- Documentación actualizada"
```

### 3. **Mantener tu Rama Actualizada**

```bash
# Mientras trabajas, mantén tu rama actualizada
git fetch upstream
git rebase upstream/main
```

### 4. **Crear Pull Request**

```bash
# Push de tu rama
git push origin feature/nombre-de-tu-feature

# Ir a GitHub y crear Pull Request
# Usar el template de PR
```

### Template de Pull Request

```markdown
## 📝 Descripción

Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente no funcione como esperado)
- [ ] Documentación (cambios en documentación)

## 🔗 Issue Relacionado

Closes #123

## ✅ Checklist

- [ ] Mi código sigue las guías de estilo del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado mi código, especialmente en áreas difíciles de entender
- [ ] He hecho los cambios correspondientes en la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban que mi fix funciona o que mi feature funciona
- [ ] Los tests unitarios y de integración pasan localmente con mis cambios
- [ ] He verificado que mi feature funciona en diferentes navegadores
- [ ] He verificado que mi feature funciona en dispositivos móviles

## 📸 Screenshots (si aplica)

Agregar screenshots si los cambios afectan la UI.

## 🧪 Tests

- [ ] Tests unitarios agregados
- [ ] Tests de integración agregados
- [ ] Tests E2E agregados (si aplica)

## 📚 Documentación

- [ ] README actualizado
- [ ] Documentación de componentes actualizada
- [ ] Changelog actualizado
```

## 📏 Estándares de Código

### Convenciones de Nomenclatura

```typescript
// Archivos
components / ExerciseCard.tsx; // PascalCase para componentes
utils / math - utils.ts; // kebab-case para utilidades
hooks / use - exercise - data.ts; // kebab-case para hooks
constants / api.constants.ts; // camelCase.constants.ts

// Variables y funciones
const exerciseData = {}; // camelCase
const calculateVolume = () => {}; // camelCase
const EXERCISE_TYPES = []; // UPPER_SNAKE_CASE para constantes

// Interfaces y tipos
interface ExerciseCardProps {} // PascalCase + Props
type ExerciseCategory = 'strength' | 'cardio';
```

### Estructura de Componentes

```typescript
// 1. Imports
import React from 'react';
import { Button } from '@/components/button';
import { useExerciseData } from '@/hooks/use-exercise-data';

// 2. Interfaces
interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: () => void;
  onDelete?: () => void;
}

// 3. Componente principal
export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
}) => {
  // 4. Hooks
  const { loading, error } = useExerciseData(exercise.id);

  // 5. Handlers
  const handleEdit = useCallback(() => {
    onEdit?.();
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  // 6. Render
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ExerciseStats exercise={exercise} />
      </CardContent>
      <CardActions>
        <Button onClick={handleEdit}>Edit</Button>
        <Button variant='danger' onClick={handleDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};
```

### Estándares de TypeScript

```typescript
// ✅ Correcto
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const getUser = async (id: string): Promise<User | null> => {
  // Implementation
};

// ❌ Incorrecto
const getUser = async (id: any): Promise<any> => {
  // Implementation
};

// ✅ Correcto - Tipos específicos
type ExerciseCategory = 'strength' | 'cardio' | 'flexibility';
type MuscleGroup = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders';

// ❌ Incorrecto - Tipos genéricos
type ExerciseCategory = string;
```

### Estándares de CSS/Tailwind

```typescript
// ✅ Correcto - Clases organizadas
const buttonClasses = clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  'bg-blue-500 hover:bg-blue-600 text-white',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  variant === 'danger' && 'bg-red-500 hover:bg-red-600'
);

// ❌ Incorrecto - Clases desordenadas
const buttonClasses =
  'px-4 py-2 rounded-md font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed';
```

## 🧪 Testing

### Estructura de Tests

```typescript
// src/components/__tests__/ExerciseCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseCard } from '../ExerciseCard';

describe('ExerciseCard', () => {
  const mockExercise = {
    id: '1',
    name: 'Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'triceps'],
  };

  const mockProps = {
    exercise: mockExercise,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render exercise information correctly', () => {
    render(<ExerciseCard {...mockProps} />);

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('strength')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ExerciseCard {...mockProps} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ExerciseCard {...mockProps} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when loading is true', () => {
    render(<ExerciseCard {...mockProps} loading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state when error is present', () => {
    const error = new Error('Failed to load exercise');
    render(<ExerciseCard {...mockProps} error={error} />);

    expect(screen.getByText('Failed to load exercise')).toBeInTheDocument();
  });
});
```

### Tests de Integración

```typescript
// src/hooks/__tests__/use-exercise-data.test.ts
import { renderHook, act } from '@testing-library/react';
import { useExerciseData } from '../use-exercise-data';
import { exerciseService } from '@/api/services/exercise-service';

jest.mock('@/api/services/exercise-service');

describe('useExerciseData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch exercise data successfully', async () => {
    const mockExercise = { id: '1', name: 'Bench Press' };
    (exerciseService.getById as jest.Mock).mockResolvedValue(mockExercise);

    const { result } = renderHook(() => useExerciseData('1'));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await result.current.fetchExercise();
    });

    expect(result.current.exercise).toEqual(mockExercise);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors correctly', async () => {
    const mockError = new Error('Failed to fetch');
    (exerciseService.getById as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useExerciseData('1'));

    await act(async () => {
      await result.current.fetchExercise();
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.loading).toBe(false);
  });
});
```

### Tests E2E

```typescript
// cypress/e2e/exercise-management.cy.ts
describe('Exercise Management', () => {
  beforeEach(() => {
    cy.visit('/exercises');
  });

  it('should create a new exercise', () => {
    cy.get('[data-testid="add-exercise-button"]').click();

    cy.get('[data-testid="exercise-name-input"]').type('Squats');
    cy.get('[data-testid="exercise-category-select"]').select('strength');
    cy.get('[data-testid="muscle-groups-multi-select"]').select([
      'legs',
      'glutes',
    ]);

    cy.get('[data-testid="save-exercise-button"]').click();

    cy.get('[data-testid="exercise-list"]').should('contain', 'Squats');
  });

  it('should edit an existing exercise', () => {
    cy.get('[data-testid="exercise-item"]').first().click();
    cy.get('[data-testid="edit-exercise-button"]').click();

    cy.get('[data-testid="exercise-name-input"]')
      .clear()
      .type('Modified Exercise');
    cy.get('[data-testid="save-exercise-button"]').click();

    cy.get('[data-testid="exercise-list"]').should(
      'contain',
      'Modified Exercise'
    );
  });

  it('should delete an exercise', () => {
    const exerciseName = 'Exercise to Delete';
    cy.get('[data-testid="exercise-item"]').contains(exerciseName).click();
    cy.get('[data-testid="delete-exercise-button"]').click();
    cy.get('[data-testid="confirm-delete-button"]').click();

    cy.get('[data-testid="exercise-list"]').should('not.contain', exerciseName);
  });
});
```

## 📚 Documentación

### Estándares de Documentación

````typescript
/**
 * Hook personalizado para manejar datos de ejercicios
 *
 * @param exerciseId - ID del ejercicio a cargar
 * @returns Objeto con estado del ejercicio, loading y error
 *
 * @example
 * ```tsx
 * const { exercise, loading, error, updateExercise } = useExerciseData('123');
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return <ExerciseCard exercise={exercise} />;
 * ```
 */
export const useExerciseData = (exerciseId: string) => {
  // Implementation
};
````

### Documentación de Componentes

````typescript
/**
 * Tarjeta para mostrar información de un ejercicio
 *
 * @component
 * @example
 * ```tsx
 * <ExerciseCard
 *   exercise={exerciseData}
 *   onEdit={() => handleEdit(exerciseData.id)}
 *   onDelete={() => handleDelete(exerciseData.id)}
 * />
 * ```
 */
interface ExerciseCardProps {
  /** Datos del ejercicio a mostrar */
  exercise: Exercise;
  /** Callback ejecutado al hacer clic en editar */
  onEdit?: () => void;
  /** Callback ejecutado al hacer clic en eliminar */
  onDelete?: () => void;
  /** Mostrar estado de carga */
  loading?: boolean;
  /** Error a mostrar */
  error?: Error | null;
}
````

## 🔍 Revisión de Código

### Checklist de Revisión

#### Funcionalidad

- [ ] El código hace lo que se supone que debe hacer
- [ ] Maneja casos edge correctamente
- [ ] No introduce regresiones
- [ ] Es compatible con versiones anteriores

#### Código

- [ ] Sigue las convenciones de nomenclatura
- [ ] Está bien estructurado y organizado
- [ ] No tiene código duplicado
- [ ] Es legible y mantenible
- [ ] Tiene comentarios donde es necesario

#### Testing

- [ ] Tiene tests unitarios
- [ ] Tiene tests de integración si es necesario
- [ ] Los tests pasan
- [ ] La cobertura es adecuada

#### Performance

- [ ] No introduce problemas de performance
- [ ] Usa lazy loading cuando es apropiado
- [ ] Optimiza re-renders
- [ ] Maneja memoria correctamente

#### Seguridad

- [ ] No introduce vulnerabilidades
- [ ] Valida inputs correctamente
- [ ] Maneja errores apropiadamente
- [ ] No expone información sensible

#### Accesibilidad

- [ ] Es accesible para screen readers
- [ ] Tiene navegación por teclado
- [ ] Usa colores apropiadamente
- [ ] Tiene alt text en imágenes

### Comentarios de Revisión

```markdown
## ✅ Aspectos Positivos

- Buena implementación de la funcionalidad
- Tests bien escritos
- Documentación clara

## 🔧 Sugerencias de Mejora

- Considerar usar `useMemo` para el cálculo costoso
- Agregar validación para el input
- Mejorar el manejo de errores

## 🐛 Problemas Encontrados

- Falta validación en línea 45
- Test no cubre caso edge
- Variable no utilizada en línea 23

## 📝 Comentarios Generales

- El código está bien estructurado
- Considerar refactorizar la función larga
- Agregar más comentarios para casos complejos
```

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
## 🐛 Descripción del Bug

Descripción clara y concisa del bug.

## 🔄 Pasos para Reproducir

1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hacia abajo hasta '...'
4. Ve el error

## ✅ Comportamiento Esperado

Descripción clara de lo que debería pasar.

## 📸 Screenshots

Si aplica, agrega screenshots para ayudar a explicar el problema.

## 💻 Información del Entorno

- **Sistema Operativo**: [ej. macOS 12.0]
- **Navegador**: [ej. Chrome 96.0.4664.110]
- **Versión de Node**: [ej. 18.0.0]
- **Versión de pnpm**: [ej. 8.0.0]

## 📋 Información Adicional

Cualquier otra información que pueda ser útil para resolver el bug.
```

## 💡 Solicitar Features

### Template de Feature Request

```markdown
## 💡 Descripción de la Feature

Descripción clara y concisa de la funcionalidad deseada.

## 🎯 Problema que Resuelve

Explicación de qué problema resuelve esta feature.

## 💭 Solución Propuesta

Descripción de cómo te gustaría que funcione la feature.

## 🔄 Alternativas Consideradas

Lista de otras soluciones que has considerado.

## 📋 Información Adicional

Cualquier contexto adicional, screenshots, mockups, etc.
```

## 🏆 Reconocimiento

### Contribuidores Destacados

- **🌱 Primeros Pasos**: Contribuidores que han hecho su primera contribución
- **🌿 Consistencia**: Contribuidores que mantienen contribuciones regulares
- **🌳 Liderazgo**: Contribuidores que ayudan a otros y guían el proyecto

### Badges de Contribución

```markdown
- 🥇 **Gold Contributor**: 50+ contribuciones
- 🥈 **Silver Contributor**: 25+ contribuciones
- 🥉 **Bronze Contributor**: 10+ contribuciones
- 🌱 **First Time**: Primera contribución
- 🚀 **Feature Champion**: Implementó feature importante
- 🐛 **Bug Hunter**: Encontró y corrigió bugs críticos
- 📚 **Documentation Hero**: Mejoró significativamente la documentación
```

## 📞 Contacto

### Canales de Comunicación

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas y discusiones generales
- **Pull Requests**: Para contribuciones de código
- **Email**: Para asuntos privados o sensibles

### Horarios de Disponibilidad

- **Revisión de PRs**: 24-48 horas
- **Respuesta a Issues**: 24 horas
- **Releases**: Semanalmente
- **Sprints**: Cada 2 semanas

## 📄 Licencia

Al contribuir a este proyecto, aceptas que tus contribuciones serán licenciadas bajo la misma licencia que el proyecto (MIT License).

---

**¡Gracias por contribuir a Follow Gym! 🎉**
