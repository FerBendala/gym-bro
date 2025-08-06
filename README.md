# Follow Gym - Aplicación de Seguimiento de Entrenamiento

## 📋 Descripción

Follow Gym es una aplicación web moderna para el seguimiento y análisis de entrenamientos de fuerza. Desarrollada con React, TypeScript y Vite, ofrece análisis avanzados, métricas detalladas y una interfaz intuitiva.

## 🚀 Características Principales

- **Seguimiento de Entrenamientos**: Registro detallado de ejercicios, series y pesos
- **Análisis Avanzado**: Métricas de progreso, tendencias y predicciones
- **Dashboard Interactivo**: Visualizaciones gráficas y estadísticas en tiempo real
- **Exportación de Datos**: Funcionalidad completa de exportación en múltiples formatos
- **Accesibilidad**: Cumplimiento de estándares WCAG
- **Responsive Design**: Interfaz adaptativa para todos los dispositivos

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Lucide React
- **Gráficos**: ApexCharts
- **Estado**: Zustand
- **Base de Datos**: IndexedDB + Firebase
- **Linting**: ESLint con reglas estrictas

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd follow-gym

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build

# Ejecutar linting
pnpm lint

# Ejecutar linting con corrección automática
pnpm lint:fix
```

## 🔧 Configuración ESLint Estricta

El proyecto incluye una configuración ESLint estricta que garantiza:

### ✅ Reglas Implementadas

#### TypeScript Estricto

- Prohibición de `any` y `!` assertions
- Uso obligatorio de `??` y `?.`
- Detección de condiciones innecesarias
- Manejo estricto de promesas

#### Calidad de Código

- Formato consistente (2 espacios, comillas simples)
- Prevención de código peligroso (`eval`, `alert`)
- Uso preferente de `const` y arrow functions
- Template literals obligatorios

#### Complejidad

- Máximo 10 de complejidad ciclomática
- Máximo 50 líneas por función
- Máximo 300 líneas por archivo
- Máximo 4 parámetros por función

#### React Específico

- Validación de props y keys
- Prevención de APIs deprecadas
- Mejores prácticas de componentes
- Accesibilidad obligatoria

#### Accesibilidad (jsx-a11y)

- Alt text obligatorio en imágenes
- Validación de enlaces y formularios
- Props ARIA requeridas
- Navegación por teclado

### 📊 Estado Actual

- **Errores críticos**: 0
- **Advertencias**: 6 (console.log en logger.ts)
- **Total de problemas**: 6

### 🎯 Beneficios

- **Código más limpio y mantenible**
- **Detección temprana de errores**
- **Mejor accesibilidad**
- **TypeScript más seguro**
- **React más robusto**

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas de la aplicación
├── stores/             # Estado global (Zustand)
├── utils/              # Utilidades y funciones
├── hooks/              # Custom hooks
├── interfaces/         # Tipos TypeScript
└── constants/          # Constantes de la aplicación
```

## 🚀 Scripts Disponibles

```bash
pnpm dev          # Desarrollo
pnpm build        # Construcción
pnpm preview      # Vista previa
pnpm lint         # Linting
pnpm lint:fix     # Linting con corrección
```

## 📚 Documentación

- [Reglas ESLint Estrictas](./docs/ESLINT_STRICT_RULES.md)
- [Utilidades del Proyecto](./docs/UTILITIES_DOCUMENTATION.md)
- [Integración Zustand](./docs/ZUSTAND_INTEGRATION.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - _Desarrollo inicial_ - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [ApexCharts](https://apexcharts.com/)
