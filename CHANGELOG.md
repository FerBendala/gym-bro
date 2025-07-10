# Changelog

## [Unreleased]

### Added

- **Resumen de Balance Muscular Mejorado**: Nuevo componente con análisis avanzado del equilibrio entre grupos musculares
  - Análisis visual mejorado con indicadores por categoría
  - Métricas de balance con puntuación de equilibrio (0-100)
  - Detección automática de desequilibrios y factores de riesgo
  - Recomendaciones personalizadas para mejorar el balance
  - Comparación entre grupo dominante y más débil
  - Visualizaciones interactivas con efectos hover y gradientes
  - Responsive design adaptado a móviles y desktop

### Fixed

- **Lógica de agrupación por semanas**: Corregida inconsistencia en el cálculo de semanas
  - Los entrenamientos ahora se agrupan correctamente por semanas que van de lunes a domingo
  - Un entrenamiento del lunes 30 de junio ahora cuenta correctamente para la semana del 1 de julio
  - Todas las funciones de análisis temporal ahora usan `date-fns` con locale español consistentemente
  - Corregidos los componentes: `ProgressTimeline`, `calculateVolumeDistribution`, `analyzeBalanceHistory`

### Removed

- **Página de Resumen**: Eliminada la pestaña "Resumen" del dashboard de progreso
  - Simplificación de la navegación con 3 pestañas principales
  - "Por Categoría" es ahora la pestaña por defecto
  - Eliminado componente `DashboardContent` y sus tipos asociados
- **Secciones redundantes en "Por Categoría"**: Eliminados los resúmenes duplicados
  - Removido "Resumen Comparativo de Métricas"
  - Removido "Resumen de Balance Muscular"
  - Simplificación de la interfaz para evitar información duplicada

### Improved

- **Análisis de Ejercicios**: Integración del nuevo componente de balance muscular
- **UI/UX**: Diseño moderno con cards mejoradas y visualizaciones más atractivas
- **Análisis de Datos**: Cálculo de métricas avanzadas incluyendo progreso temporal y frecuencia
- **Navegación**: Experiencia simplificada con pestañas más específicas

### Technical

- Nuevo componente `MuscleBalanceSummary` con interfaces TypeScript completas
- Funciones auxiliares para cálculo de balance ideal y generación de recomendaciones
- Mejoras en la estructura de datos para análisis por categorías
- Optimización de rendimiento en cálculos de métricas
- Refactorización del sistema de navegación del dashboard
- Uso consistente de `date-fns` con locale español para cálculos temporales

---

## Versiones Anteriores

### [1.0.0] - 2024-01-XX

- Lanzamiento inicial de la aplicación de seguimiento de gimnasio
- Funcionalidades básicas de registro y análisis de entrenamientos
