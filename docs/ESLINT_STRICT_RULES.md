# Reglas ESLint Estrictas Implementadas

## Resumen

Se han implementado reglas ESLint estrictas para mejorar la calidad del código, mantener consistencia y prevenir errores comunes. Las reglas están organizadas en las siguientes categorías:

## 📋 Categorías de Reglas

### 1. TypeScript Estricto

- **`@typescript-eslint/no-explicit-any`**: Prohíbe el uso de `any`
- **`@typescript-eslint/no-non-null-assertion`**: Prohíbe el operador `!`
- **`@typescript-eslint/prefer-nullish-coalescing`**: Fuerza el uso de `??` en lugar de `||`
- **`@typescript-eslint/prefer-optional-chain`**: Fuerza el uso de `?.`
- **`@typescript-eslint/no-unnecessary-condition`**: Detecta condiciones innecesarias
- **`@typescript-eslint/no-floating-promises`**: Requiere manejo de promesas
- **`@typescript-eslint/await-thenable`**: Fuerza await en funciones thenable
- **`@typescript-eslint/no-misused-promises`**: Previene mal uso de promesas
- **`@typescript-eslint/require-await`**: Requiere await en funciones async
- **`@typescript-eslint/no-unsafe-*`**: Previene uso inseguro de tipos

### 2. Calidad de Código

- **`no-console`**: Advertencia por uso de console.log
- **`no-debugger`**: Error por debugger statements
- **`no-alert`**: Prohíbe alert()
- **`no-eval`**: Prohíbe eval()
- **`prefer-const`**: Fuerza const cuando es posible
- **`no-var`**: Prohíbe var
- **`object-shorthand`**: Fuerza shorthand de objetos
- **`prefer-template`**: Fuerza template literals
- **`prefer-arrow-callback`**: Fuerza arrow functions
- **`no-duplicate-imports`**: Previene imports duplicados

### 3. Estilo y Formato

- **`indent`**: 2 espacios
- **`quotes`**: Comillas simples
- **`semi`**: Punto y coma obligatorio
- **`comma-dangle`**: Coma final en multilínea
- **`no-trailing-spaces`**: Sin espacios al final
- **`eol-last`**: Nueva línea al final
- **`no-multiple-empty-lines`**: Máximo 1 línea vacía
- **`space-before-blocks`**: Espacio antes de bloques
- **`keyword-spacing`**: Espaciado de keywords
- **`space-infix-ops`**: Espaciado en operadores

### 4. Complejidad

- **`complexity`**: Máximo 10 (warn)
- **`max-depth`**: Máximo 4 niveles (warn)
- **`max-len`**: Máximo 100 caracteres (warn)
- **`max-lines`**: Máximo 300 líneas por archivo (warn)
- **`max-lines-per-function`**: Máximo 50 líneas por función (warn)
- **`max-nested-callbacks`**: Máximo 3 callbacks anidados (warn)
- **`max-params`**: Máximo 4 parámetros (warn)
- **`max-statements`**: Máximo 20 statements (warn)

### 5. Importaciones

- **`import/no-duplicates`**: Sin imports duplicados
- **`import/order`**: Orden específico de imports
  - Builtin modules
  - External modules
  - Internal modules
  - Parent directories
  - Sibling directories
  - Index files

### 6. React Específico

- **`react/display-name`**: Requiere displayName
- **`react/jsx-key`**: Requiere key en listas
- **`react/jsx-no-duplicate-props`**: Sin props duplicadas
- **`react/jsx-no-undef`**: Sin JSX indefinido
- **`react/no-array-index-key`**: Evita usar índice como key
- **`react/no-danger`**: Advertencia por dangerouslySetInnerHTML
- **`react/no-deprecated`**: Error por APIs deprecadas
- **`react/no-direct-mutation-state`**: Prohíbe mutación directa del estado
- **`react/no-find-dom-node`**: Prohíbe findDOMNode
- **`react/no-is-mounted`**: Prohíbe isMounted
- **`react/no-render-return-value`**: Prohíbe usar return de render
- **`react/no-string-refs`**: Prohíbe refs como strings
- **`react/no-unescaped-entities`**: Prohíbe entidades sin escapar
- **`react/no-unknown-property`**: Prohíbe props desconocidas
- **`react/no-unsafe`**: Prohíbe APIs inseguras
- **`react/self-closing-comp`**: Fuerza self-closing
- **`react/sort-comp`**: Ordena métodos de componentes
- **`react/sort-prop-types`**: Ordena propTypes
- **`react/style-prop-object`**: Requiere objeto para style
- **`react/void-dom-elements-no-children`**: Prohíbe children en elementos void

### 7. Accesibilidad (jsx-a11y)

- **`jsx-a11y/alt-text`**: Requiere alt en imágenes
- **`jsx-a11y/anchor-has-content`**: Requiere contenido en enlaces
- **`jsx-a11y/anchor-is-valid`**: Valida enlaces
- **`jsx-a11y/aria-props`**: Valida props ARIA
- **`jsx-a11y/aria-proptypes`**: Valida tipos de props ARIA
- **`jsx-a11y/aria-unsupported-elements`**: Prohíbe ARIA en elementos no soportados
- **`jsx-a11y/click-events-have-key-events`**: Requiere eventos de teclado
- **`jsx-a11y/heading-has-content`**: Requiere contenido en headings
- **`jsx-a11y/html-has-lang`**: Requiere lang en html
- **`jsx-a11y/iframe-has-title`**: Requiere title en iframes
- **`jsx-a11y/img-redundant-alt`**: Evita alt redundantes
- **`jsx-a11y/no-access-key`**: Prohíbe accessKey
- **`jsx-a11y/no-autofocus`**: Prohíbe autofocus
- **`jsx-a11y/no-distracting-elements`**: Prohíbe elementos distractores
- **`jsx-a11y/no-redundant-roles`**: Prohíbe roles redundantes
- **`jsx-a11y/role-has-required-aria-props`**: Requiere props ARIA para roles
- **`jsx-a11y/role-supports-aria-props`**: Valida props ARIA para roles
- **`jsx-a11y/scope`**: Requiere scope en th
- **`jsx-a11y/tabindex-no-positive`**: Prohíbe tabindex positivo

## 🚀 Scripts Disponibles

```bash
# Ejecutar linting
pnpm lint

# Ejecutar linting con corrección automática
pnpm lint:fix
```

## 📊 Estado Actual

- **Errores críticos**: 0
- **Advertencias**: 6 (console.log en logger.ts)
- **Total de problemas**: 6

## 🔧 Correcciones Automáticas

Las siguientes reglas se pueden corregir automáticamente con `pnpm lint:fix`:

- Formato de código (indentación, comillas, etc.)
- Comas finales
- Espaciado
- Imports duplicados
- Uso de const vs let
- Template literals
- Object shorthand
- Y más...

## 📝 Próximos Pasos

1. **Corregir errores críticos**: Usar `pnpm lint:fix` para corregir automáticamente
2. **Revisar advertencias**: Evaluar si las advertencias son válidas
3. **Refactorizar funciones complejas**: Dividir funciones con alta complejidad
4. **Mejorar accesibilidad**: Corregir problemas de a11y
5. **Optimizar imports**: Reorganizar imports según las reglas

## 🎯 Beneficios

- **Código más limpio**: Formato consistente
- **Menos errores**: Detección temprana de problemas
- **Mejor mantenibilidad**: Código más legible
- **Accesibilidad mejorada**: Cumplimiento de estándares a11y
- **TypeScript más seguro**: Uso estricto de tipos
- **React más robusto**: Mejores prácticas de React

## ⚠️ Notas Importantes

- Algunas reglas pueden ser muy estrictas para el desarrollo inicial
- Considera ajustar los límites de complejidad según el equipo
- Las reglas de accesibilidad son especialmente importantes para aplicaciones web
- Las reglas de TypeScript ayudan a prevenir errores en tiempo de ejecución

## ✅ Problemas Resueltos

- **Archivo .eslintignore eliminado**: Ya no se usa el archivo `.eslintignore` obsoleto
- **Configuración centralizada**: Todas las exclusiones están en `eslint.config.js`
- **Sin advertencias de configuración**: ESLint funciona sin warnings de configuración
