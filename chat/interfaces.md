# Organiza la carpeta interfaces siguiendo estos criterios

- Debe existir solo una carpeta interfaces por dominio o módulo funcional.
- Define solo tipos e interfaces relacionados con el dominio, módulo o feature.
- Si un tipo o interfaz es exclusivo de un componente, colócalo en su types.ts dentro de la carpeta del componente, no en interfaces.
- Organiza los archivos por contexto si hace falta (api.interfaces.ts, ui.interfaces.ts, domain.interfaces.ts…), pero mantén todo dentro de la carpeta interfaces.
- Los nombres de los archivos y de las interfaces deben ser claros, coherentes y usar kebab-case.
- Evita duplicar tipos: reutiliza o extiende interfaces siempre que sea posible.
- Las importaciones absolutas se hacen usando "@".

```plaintext
Estructura esperada:
|- interfaces
 |-- api.interfaces.ts
 |-- ui.interfaces.ts
 |-- domain.interfaces.ts
 |-- index.ts (opcional, para reexportar)
```

✅ No mezcles lógica ni constantes en interfaces.
✅ No añadas carpetas dentro de interfaces.
✅ Elimina tipos o interfaces no usados.
✅ Corrige todos los errores de linter y mantén los tipos exportados correctamente.
