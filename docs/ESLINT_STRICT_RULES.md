# Reglas ESLint Implementadas

## Resumen

Se han implementado reglas ESLint para mejorar la calidad del código, mantener consistencia y prevenir errores comunes. Las reglas están organizadas en las siguientes categorías:

## 📋 Categorías de Reglas

### 1. TypeScript Básico

- **`@typescript-eslint/no-unused-vars`**: Error por variables no utilizadas (con patrones de ignorado)
- **`@typescript-eslint/no-explicit-any`**: Prohíbe el uso de `any`
- **`@typescript-eslint/no-non-null-assertion`**: **DESACTIVADO** - Permite el operador `!`
- **`@typescript-eslint/prefer-optional-chain`**: **DESACTIVADO** - No fuerza el uso de `?.`
- **`@typescript-eslint/no-unnecessary-condition`**: **DESACTIVADO** - No detecta condiciones innecesarias
- **`@typescript-eslint/no-floating-promises`**: **DESACTIVADO** - No requiere manejo de promesas
- **`@typescript-eslint/await-thenable`**: **DESACTIVADO** - No fuerza await en funciones thenable
- **`@typescript-eslint/no-misused-promises`**: **DESACTIVADO** - No previene mal uso de promesas
- **`@typescript-eslint/require-await`**: **DESACTIVADO** - No requiere await en funciones async
- **`@typescript-eslint/no-unsafe-*`**: **DESACTIVADAS** - Permite uso inseguro de tipos

### 2. Calidad de Código

- **`no-console`**: Advertencia por uso de console.log
- **`no-debugger`**: Error por debugger statements
- **`no-alert`**: **DESACTIVADO** - Permite alert()
- **`no-eval`**: Error por eval()
- **`no-implied-eval`**: Error por eval implícito
- **`no-new-func`**: Error por new Function()
- **`no-script-url`**: Error por URLs de script
- **`prefer-const`**: Error - Fuerza const cuando es posible
- **`no-var`**: Error - Prohíbe var
- **`object-shorthand`**: Error - Fuerza shorthand de objetos
- **`prefer-template`**: Error - Fuerza template literals
- **`prefer-arrow-callback`**: Error - Fuerza arrow functions
- **`arrow-spacing`**: Error - Espaciado en arrow functions
- **`no-duplicate-imports`**: **DESACTIVADO** - Permite imports duplicados
- **`no-useless-rename`**: Error - Prohíbe renombrado inútil
- **`prefer-destructuring`**: Error - Fuerza destructuring de objetos
- **`no-unused-expressions`**: Error - Prohíbe expresiones no utilizadas
- **`no-unreachable`**: Error - Prohíbe código inalcanzable
- **`no-constant-condition`**: Error - Prohíbe condiciones constantes
- **`no-dupe-*`**: Error - Prohíbe duplicados (keys, args, class members, else-if, case)
- **`no-func-assign`**: Error - Prohíbe reasignación de funciones
- **`no-import-assign`**: Error - Prohíbe reasignación de imports
- **`no-obj-calls`**: Error - Prohíbe llamadas a objetos como funciones
- **`no-redeclare`**: Error - Prohíbe redeclaración
- **`no-sparse-arrays`**: Error - Prohíbe arrays dispersos
- **`no-unreachable-loop`**: Error - Prohíbe loops inalcanzables
- **`no-unsafe-negation`**: Error - Prohíbe negación insegura
- **`use-isnan`**: Error - Requiere isNaN para comparaciones NaN
- **`valid-typeof`**: Error - Valida typeof

### 3. Estilo y Formato

- **`indent`**: Error - 2 espacios (SwitchCase: 1)
- **`quotes`**: Error - Comillas simples (avoidEscape: true)
- **`semi`**: Error - Punto y coma obligatorio
- **`comma-dangle`**: Error - Coma final en multilínea
- **`no-trailing-spaces`**: Error - Sin espacios al final
- **`eol-last`**: Error - Nueva línea al final
- **`no-multiple-empty-lines`**: Error - Máximo 1 línea vacía
- **`no-mixed-spaces-and-tabs`**: Error - Sin mezcla de espacios y tabs
- **`space-before-blocks`**: Error - Espacio antes de bloques
- **`keyword-spacing`**: Error - Espaciado de keywords
- **`space-infix-ops`**: Error - Espaciado en operadores
- **`space-before-function-paren`**: Error - Espaciado en parámetros de función
- **`object-curly-spacing`**: Error - Espacios en llaves de objetos
- **`array-bracket-spacing`**: Error - Sin espacios en corchetes de arrays
- **`computed-property-spacing`**: Error - Sin espacios en propiedades computadas
- **`func-call-spacing`**: Error - Sin espacios en llamadas de función
- **`block-spacing`**: Error - Espacios en bloques
- **`brace-style`**: Error - Estilo 1tbs (one true brace style)
- **`camelcase`**: Error - camelCase para propiedades
- **`new-cap`**: **DESACTIVADO** - Permite new sin mayúscula
- **`new-parens`**: Error - Paréntesis en new
- **`no-array-constructor`**: Error - Prohíbe new Array()
- **`no-new-object`**: Error - Prohíbe new Object()
- **`no-new-wrappers`**: Error - Prohíbe new String/Number/Boolean
- **`no-octal`**: Error - Prohíbe octales
- **`no-octal-escape`**: Error - Prohíbe escapes octales
- **`no-regex-spaces`**: Error - Prohíbe espacios en regex
- **`no-sequences`**: Error - Prohíbe secuencias de expresiones
- **`no-throw-literal`**: Error - Requiere Error en throw
- **`no-useless-call`**: Error - Prohíbe llamadas inútiles
- **`no-useless-concat`**: Error - Prohíbe concatenación inútil
- **`no-useless-escape`**: Error - Prohíbe escapes inútiles
- **`no-useless-return`**: Error - Prohíbe return inútil
- **`yoda`**: Error - Prohíbe condiciones Yoda

### 4. Importaciones

- **`import/no-duplicates`**: **DESACTIVADO** - Permite imports duplicados
- **`import/order`**: **DESACTIVADO** - No ordena imports

### 5. React Específico

- **`react/jsx-uses-react`**: **DESACTIVADO** - No requiere import de React
- **`react/react-in-jsx-scope`**: **DESACTIVADO** - No requiere React en scope
- **`react/prop-types`**: **DESACTIVADO** - No requiere propTypes
- **`react/display-name`**: Error - Requiere displayName
- **`react/jsx-key`**: Error - Requiere key en listas
- **`react/jsx-no-duplicate-props`**: Error - Sin props duplicadas
- **`react/jsx-no-undef`**: **DESACTIVADO** - No valida JSX indefinido
- **`react/jsx-uses-vars`**: Error - Requiere uso de variables JSX
- **`react/no-array-index-key`**: **DESACTIVADO** - Permite usar índice como key
- **`react/no-danger`**: **DESACTIVADO** - Permite dangerouslySetInnerHTML
- **`react/no-deprecated`**: Error - Error por APIs deprecadas
- **`react/no-direct-mutation-state`**: Error - Prohíbe mutación directa del estado
- **`react/no-find-dom-node`**: Error - Prohíbe findDOMNode
- **`react/no-is-mounted`**: Error - Prohíbe isMounted
- **`react/no-render-return-value`**: Error - Prohíbe usar return de render
- **`react/no-string-refs`**: Error - Prohíbe refs como strings
- **`react/no-unescaped-entities`**: **DESACTIVADO** - Permite entidades sin escapar
- **`react/no-unknown-property`**: Error - Prohíbe props desconocidas
- **`react/no-unsafe`**: Error - Prohíbe APIs inseguras
- **`react/self-closing-comp`**: Error - Fuerza self-closing
- **`react/sort-comp`**: Error - Ordena métodos de componentes
- **`react/sort-prop-types`**: Error - Ordena propTypes
- **`react/style-prop-object`**: Error - Requiere objeto para style
- **`react/void-dom-elements-no-children`**: Error - Prohíbe children en elementos void

### 6. React Hooks

- **`react-hooks/rules-of-hooks`**: Error - Reglas de hooks
- **`react-hooks/exhaustive-deps`**: Error - Dependencias exhaustivas

### 7. React Refresh

- **`react-refresh/only-export-components`**: Advertencia - Solo componentes exportados

### 8. Accesibilidad (jsx-a11y)

- **`jsx-a11y/alt-text`**: Error - Requiere alt en imágenes
- **`jsx-a11y/anchor-has-content`**: Error - Requiere contenido en enlaces
- **`jsx-a11y/anchor-is-valid`**: Error - Valida enlaces
- **`jsx-a11y/aria-props`**: Error - Valida props ARIA
- **`jsx-a11y/aria-proptypes`**: Error - Valida tipos de props ARIA
- **`jsx-a11y/aria-unsupported-elements`**: Error - Prohíbe ARIA en elementos no soportados
- **`jsx-a11y/click-events-have-key-events`**: **DESACTIVADO** - No requiere eventos de teclado
- **`jsx-a11y/heading-has-content`**: Error - Requiere contenido en headings
- **`jsx-a11y/html-has-lang`**: Error - Requiere lang en html
- **`jsx-a11y/iframe-has-title`**: Error - Requiere title en iframes
- **`jsx-a11y/img-redundant-alt`**: Error - Evita alt redundantes
- **`jsx-a11y/no-access-key`**: Error - Prohíbe accessKey
- **`jsx-a11y/no-autofocus`**: Error - Prohíbe autofocus
- **`jsx-a11y/no-distracting-elements`**: Error - Prohíbe elementos distractores
- **`jsx-a11y/no-redundant-roles`**: Error - Prohíbe roles redundantes
- **`jsx-a11y/role-has-required-aria-props`**: Error - Requiere props ARIA para roles
- **`jsx-a11y/role-supports-aria-props`**: Error - Valida props ARIA para roles
- **`jsx-a11y/scope`**: Error - Requiere scope en th
- **`jsx-a11y/tabindex-no-positive`**: Error - Prohíbe tabindex positivo

## 🚀 Scripts Disponibles

```bash
# Ejecutar linting
pnpm lint

# Ejecutar linting con corrección automática
pnpm lint:fix
```

## 📊 Estado Actual

- **Errores críticos**: 0
- **Advertencias**: 0
- **Total de problemas**: 0

## 🔧 Correcciones Automáticas

Las siguientes reglas se pueden corregir automáticamente con `pnpm lint:fix`:

- Formato de código (indentación, comillas, etc.)
- Comas finales
- Espaciado
- Uso de const vs let
- Template literals
- Object shorthand
- Arrow functions
- Y más...

## 📝 Archivos Excluidos

Los siguientes archivos están excluidos del linting:

```javascript
ignores: [
  'dist',
  'vite.config.ts',
  '*.config.js',
  '*.config.ts',
  'node_modules/**',
  'docs/**',
  '*.md',
  '*.json',
  '*.log',
  '.cache/**',
  'coverage/**',
  '.vscode/**',
  '.idea/**',
  '*.swp',
  '*.swo',
  '.DS_Store',
  'Thumbs.db',
  'src/utils/logger.ts', // Excluido por uso intencional de console.log
];
```

## 🎯 Beneficios

- **Código más limpio**: Formato consistente
- **Menos errores**: Detección temprana de problemas
- **Mejor mantenibilidad**: Código más legible
- **Accesibilidad mejorada**: Cumplimiento de estándares a11y
- **TypeScript más seguro**: Uso básico de tipos
- **React más robusto**: Mejores prácticas de React

## ⚠️ Notas Importantes

- Las reglas TypeScript estrictas están desactivadas para facilitar el desarrollo
- El archivo `logger.ts` está excluido por uso intencional de console.log
- Las reglas de complejidad no están configuradas
- Las reglas de importaciones están desactivadas
- Las reglas de accesibilidad son especialmente importantes para aplicaciones web

## ✅ Problemas Resueltos

- **Archivo .eslintignore eliminado**: Ya no se usa el archivo `.eslintignore` obsoleto
- **Configuración centralizada**: Todas las exclusiones están en `eslint.config.js`
- **Sin advertencias de configuración**: ESLint funciona sin warnings de configuración
- **Logger excluido**: El archivo logger.ts está excluido por uso intencional de console.log
