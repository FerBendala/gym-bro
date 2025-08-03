# Porcentajes de Categorías en Ejercicios

## Descripción

La funcionalidad de porcentajes de categorías permite asignar valores específicos a cada categoría muscular de un ejercicio, definiendo qué porcentaje del esfuerzo total recibe cada grupo muscular.

## Casos de Uso

### Ejemplo: Dominadas

- **Categorías seleccionadas**: Espalda, Hombros
- **Porcentajes asignados**:
  - Espalda: 80%
  - Hombros: 20%

### Ejemplo: Press de Banca

- **Categorías seleccionadas**: Pecho, Hombros, Brazos
- **Porcentajes asignados**:
  - Pecho: 70%
  - Hombros: 20%
  - Brazos: 10%

## Cómo Usar

### 1. Crear un Nuevo Ejercicio

1. Ve a **Administración** → **Ejercicios**
2. Haz clic en **"Crear Nuevo Ejercicio"**
3. Completa el nombre del ejercicio
4. Selecciona las categorías relevantes
5. **Nueva funcionalidad**: Aparecerá una sección "Distribución por Categorías"
6. Asigna porcentajes a cada categoría (el total debe ser 100%)
7. Completa la descripción y URL (opcional)
8. Guarda el ejercicio

### 2. Editar un Ejercicio Existente

1. En la lista de ejercicios, haz clic en el botón de editar (lápiz)
2. Modifica las categorías si es necesario
3. Ajusta los porcentajes según sea necesario
4. Guarda los cambios

## Validaciones

- **Total 100%**: La suma de todos los porcentajes debe ser exactamente 100%
- **Rango válido**: Cada porcentaje debe estar entre 0% y 100%
- **Una categoría**: Si solo selecciona una categoría, automáticamente se asigna 100%
- **Múltiples categorías**: Debe distribuir manualmente los porcentajes

## Visualización

### En la Lista de Ejercicios

Los ejercicios con porcentajes asignados muestran:

- Categorías con badges azules
- **Nueva sección**: "Distribución" con porcentajes en badges verdes

### Ejemplo Visual

```
Dominadas
[Espalda] [Hombros]
📊 Distribución:
[Espalda: 80%] [Hombros: 20%]
```

## Beneficios

1. **Análisis más preciso**: El sistema puede calcular mejor el volumen por categoría
2. **Planificación mejorada**: Ayuda a equilibrar el entrenamiento
3. **Personalización**: Cada usuario puede definir sus propios porcentajes
4. **Consistencia**: Evita suposiciones sobre la distribución del esfuerzo

## Integración con el Sistema

Los porcentajes se utilizan en:

- Cálculo de volumen por categoría muscular
- Análisis de balance muscular
- Recomendaciones de entrenamiento
- Métricas de progreso

## Notas Técnicas

- Los porcentajes se almacenan como `Record<string, number>` en el campo `categoryPercentages`
- Campo opcional: Si no se asignan porcentajes, el sistema usa valores por defecto
- Compatibilidad: Ejercicios existentes sin porcentajes siguen funcionando normalmente
- Validación en tiempo real: El formulario valida que el total sea 100%
