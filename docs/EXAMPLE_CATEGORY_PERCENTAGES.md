# Ejemplo Práctico: Porcentajes de Categorías

## Escenario: Crear ejercicio "Dominadas"

### Paso 1: Acceder al formulario

1. Ve a **Administración** → **Ejercicios**
2. Haz clic en **"Crear Nuevo Ejercicio"**

### Paso 2: Completar información básica

```
Nombre: Dominadas
Categorías: [Espalda] [Hombros]
```

### Paso 3: Asignar porcentajes

Aparece la sección **"Distribución por Categorías"**:

```
📊 Distribución por Categorías
Asigna porcentajes a cada categoría seleccionada (total debe ser 100%)

Espalda: [80] %
Hombros: [20] %

Total: 100.0% ✅
```

### Paso 4: Guardar ejercicio

Los datos que se envían a Firebase:

```json
{
  "name": "Dominadas",
  "categories": ["Espalda", "Hombros"],
  "categoryPercentages": {
    "Espalda": 80,
    "Hombros": 20
  },
  "description": "",
  "url": ""
}
```

## Escenario: Editar ejercicio existente

### Paso 1: Seleccionar ejercicio

En la lista de ejercicios, haz clic en el botón de editar (lápiz) del ejercicio "Dominadas"

### Paso 2: Modificar porcentajes

Cambia los porcentajes:

```
Espalda: [85] %
Hombros: [15] %

Total: 100.0% ✅
```

### Paso 3: Guardar cambios

Los datos actualizados:

```json
{
  "name": "Dominadas",
  "categories": ["Espalda", "Hombros"],
  "categoryPercentages": {
    "Espalda": 85,
    "Hombros": 15
  }
}
```

## Visualización en la Lista

Después de guardar, el ejercicio aparece así:

```
Dominadas
[Espalda] [Hombros]

📊 Distribución:
[Espalda: 85%] [Hombros: 15%]
```

## Casos Especiales

### Una sola categoría

Si seleccionas solo "Espalda":

```
📊 Distribución por Categorías

Espalda: [100] % (automático)

💡 Con una sola categoría, se asigna automáticamente 100%
```

### Múltiples categorías sin porcentajes

Si no asignas porcentajes:

```
📊 Distribución por Categorías

Espalda: [0] %
Hombros: [0] %

Total: 0.0% ❌
⚠️ El total debe ser exactamente 100%. Actual: 0.0%
```

## Debug en Consola

Al guardar, verás en la consola del navegador:

```
Datos del formulario: {
  name: "Dominadas",
  categories: ["Espalda", "Hombros"],
  categoryPercentages: { Espalda: 80, Hombros: 20 },
  description: "",
  url: ""
}

Datos a enviar a Firebase: {
  name: "Dominadas",
  categories: ["Espalda", "Hombros"],
  categoryPercentages: { Espalda: 80, Hombros: 20 },
  description: undefined,
  url: undefined
}
```

## Validaciones

✅ **Total 100%**: La suma debe ser exactamente 100%
✅ **Rango válido**: Cada porcentaje entre 0% y 100%
✅ **Una categoría**: Se asigna automáticamente 100%
✅ **Múltiples categorías**: Distribución manual requerida

## Beneficios

1. **Análisis preciso**: El sistema calcula mejor el volumen por categoría
2. **Planificación equilibrada**: Ayuda a balancear el entrenamiento
3. **Personalización**: Cada usuario define sus propios porcentajes
4. **Consistencia**: Evita suposiciones sobre distribución del esfuerzo
