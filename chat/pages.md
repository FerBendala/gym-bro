# Componentiza esta página siguiendo estos criterios

- La página principal debe tener entre 80 y 120 líneas máximo.
- Divide la lógica en subcomponentes, hooks y utils, siempre dentro de la misma carpeta de la página.
- Solo puede haber una carpeta components, una carpeta hooks y una carpeta utils dentro de cada carpeta de página.
- Si necesitas tipos o constantes, usa types.ts y constants.ts dentro de la carpeta de la página.
- Mantén la lógica simple y modular, sin crear más carpetas aparte de las mencionadas.
- Si necesitas estado global/local, recuerda que usamos Zustand.
- Las importaciones absolutas se hacen usando "@".
- Añade index.ts para exportar la página principal.

```plaintext
Estructura esperada:
|- Pages
  |- Page
    |-- components
    |-- hooks
    |-- utils
    |-- page.tsx (nombre de la carpeta)
    |-- types.ts (opcional)
    |-- constants.ts (opcional)
    |-- index.ts
```

✅ No añadas carpetas extra ni mezcles lógica que no corresponda. Todo debe ser escalable y mantenible.
✅ Elimina archivos o código no usado.
✅ Corrige todos los errores de linter.
