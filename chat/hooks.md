# Organiza la carpeta hooks siguiendo estos criterios

- Solo debe existir una carpeta hooks por dominio o módulo funcional.
- Cada hook debe estar bien aislado, enfocado a una única responsabilidad.
- Si un hook es exclusivo de un componente, colócalo en la carpeta hooks dentro del propio componente, no en la carpeta global de hooks.
- Nombra los hooks con el prefijo use (useFetchData.ts, useModal.ts…).
- Si un hook necesita helpers, colócalos como funciones dentro del mismo archivo o en utils si se reutilizan.
- Los hooks deben ser puros, sin lógica que no corresponda.
- Tipa correctamente inputs y outputs del hook.
- Las importaciones absolutas se hacen usando "@".

```plaintext
Estructura esperada:
|- hooks
 |-- useFetchData.ts
 |-- useModal.ts
 |-- useSomething.ts
 |-- index.ts (opcional, para reexportar)
```

✅ No dupliques lógica entre hooks: reutiliza helpers o combínalos si es necesario.
✅ No añadas carpetas dentro de hooks aparte de las permitidas por la arquitectura.
✅ Elimina hooks no usados o sin sentido.
✅ Corrige todos los errores de linter.
