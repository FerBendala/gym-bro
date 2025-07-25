# Organiza la carpeta stores siguiendo estos criterios

- Debe existir solo una carpeta stores por dominio o módulo funcional.
- Cada store debe estar bien aislado, enfocado a una única responsabilidad o feature.
- Nombra cada archivo de store de forma clara y específica: auth.store.ts, user.store.ts, cart.store.ts, etc.
- Si el store es exclusivo de un componente, defínelo como hook dentro de la carpeta del componente (no en stores global).
- Define interfaces o tipos dentro del mismo archivo o, si son grandes, en types.ts dentro de la carpeta stores.
- Evita lógica innecesaria dentro del store: solo estado, setters y acciones estrictamente relacionadas.
- Las importaciones absolutas se hacen usando "@".
- Exporte siempre el hook con use al inicio: useAuthStore, useCartStore…

```plaintext
Estructura esperada:
|- stores
 |-- auth.store.ts
 |-- user.store.ts
 |-- cart.store.ts
 |-- types.ts (opcional)
 |-- index.ts (opcional, para reexportar)
```

✅ No mezcles lógica de componentes ni helpers genéricos dentro del store: usa utils si es necesario.
✅ No dupliques lógica entre stores: reutiliza funciones compartidas vía utils.
✅ Elimina stores no usados o duplicados.
✅ Corrige todos los errores de linter y mantén el tipado fuerte.
