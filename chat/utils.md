# Organiza la carpeta utils siguiendo estos criterios

- Debe existir solo una carpeta utils por dominio, módulo o feature.
- Cada archivo debe contener solo funciones puras y reutilizables, sin dependencias de UI ni lógica de negocio específica.
- Si una función utilitaria solo aplica a un componente, colócala en utils dentro de la carpeta del componente, no en el utils global.
- Nombra los archivos de forma clara y específica: date.utils.ts, string.utils.ts, api.utils.ts, etc.
- Agrupa solo funciones coherentes dentro de un mismo archivo: no mezcles helpers sin relación.
- Las importaciones absolutas se hacen usando "@".
- Todas las funciones deben estar tipadas correctamente y ser exportadas de forma nombrada o por defecto si aplica.

```plaintext
Estructura esperada:
|- utils
 |-- date.utils.ts
 |-- string.utils.ts
 |-- api.utils.ts
 |-- index.ts
```

✅ No añadas carpetas dentro de utils.
✅ No pongas lógica de negocio ni dependencias de UI.
✅ Elimina helpers no usados o duplicados.
✅ Corrige todos los errores de linter y mantén el código claro, limpio y probado.
