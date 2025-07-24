# Organiza la carpeta constants siguiendo estos criterios

- Solo debe existir una carpeta constants por dominio o módulo funcional.
- Agrupa solo constantes puras, sin lógica ni funciones innecesarias.
- Divide las constantes en archivos temáticos si es necesario (api.constants.ts, ui.constants.ts, etc.), pero mantén todo dentro de la misma carpeta constants.
- Si una constante solo aplica a un componente, muévela a su constants.ts local dentro de la carpeta del componente.
- Usa nombres de archivo y nombres de exportación claros y consistentes.
- Todas las constantes deben estar tipadas si aplica (as const o readonly).
- Las importaciones absolutas se hacen usando "@".

```plaintext
Estructura esperada:
|- constants
 |-- api.constants.ts
 |-- ui.constants.ts
 |-- other.constants.ts
 |-- index.ts (opcional, para reexportar)
```

✅ No mezcles lógica de negocio ni funciones complejas dentro de constants.
✅ Elimina constantes no usadas o duplicadas.
✅ Corrige errores de linter y mantén un estilo limpio.
