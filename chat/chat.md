# Componentiza este componente siguiendo estos criterios

- El componente principal debe tener entre 80 y 120 líneas máximo.
- Divide la lógica en subcomponentes, hooks y utils, siempre dentro de la misma carpeta del componente.
- Solo puede haber una carpeta components, una carpeta hooks y una carpeta utils dentro de cada carpeta de componente.
- Si necesitas tipos o constantes, usa types.ts y constants.ts dentro de la carpeta del componente.
- Mantén la lógica simple y modular, sin crear más carpetas aparte de las mencionadas.
- Si necesitas estado global/local, recuerda que usamos Zustand.
- Las importaciones absolutas se hacen usando "@".
- Añade index.ts para exportar el componente principal.

```plain-text
estructura esperada:
|- Componente
 |-- components
 |-- hooks
 |-- utils
 |-- Componente.tsx
 |-- types.ts (opcional)
 |-- constants.ts (opcional)
 |-- index.ts
```

✅ No añadas carpetas extra ni mezcles lógica que no corresponda. Todo debe ser escalable y mantenible.
✅ Elimina archivos o código no usado.
✅ Corrige todos los errores de linter.
