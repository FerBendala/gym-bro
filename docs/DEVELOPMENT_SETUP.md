# 🛠️ Configuración de Desarrollo - Follow Gym

## 🎯 Prerrequisitos

### Software Requerido

- **Node.js**: Versión 18.0.0 o superior
- **pnpm**: Versión 8.0.0 o superior
- **Git**: Versión 2.30.0 o superior
- **Editor de código**: VS Code recomendado

### Verificación de Versiones

```bash
# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar pnpm
pnpm --version
# Debe mostrar: 8.x.x o superior

# Verificar Git
git --version
# Debe mostrar: 2.30.x o superior
```

## 🚀 Instalación Inicial

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <repository-url>
cd follow-gym

# Verificar que estás en la rama correcta
git branch
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias
pnpm install

# Verificar instalación
pnpm list --depth=0
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo de variables de entorno
cp .env.example .env

# Editar variables de entorno
nano .env
```

**Variables de entorno requeridas:**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Development Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Follow Gym
```

### 4. Verificar Configuración

```bash
# Verificar que todo funciona
pnpm dev

# Abrir en navegador: http://localhost:5173
```

## 🔧 Configuración del Editor

### VS Code (Recomendado)

#### Extensiones Requeridas

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

#### Configuración de Workspace

Crear `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Configuración de Prettier

Crear `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🧪 Configuración de Testing

### Instalación de Testing

```bash
# Instalar dependencias de testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuración de Vitest

Crear `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
  },
});
```

### Setup de Testing

Crear `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
}));
```

## 🔍 Configuración de Linting

### ESLint

El proyecto ya incluye configuración ESLint estricta. Para verificar:

```bash
# Ejecutar linting
pnpm lint

# Corregir automáticamente
pnpm lint:fix
```

### TypeScript

```bash
# Verificar tipos
pnpm tsc --noEmit

# Verificar tipos en modo estricto
pnpm tsc --strict --noEmit
```

## 🚀 Scripts de Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm dev:host         # Servidor con host público

# Build
pnpm build            # Build de producción
pnpm build:analyze    # Build con análisis de bundle
pnpm preview          # Vista previa de producción

# Testing
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con cobertura

# Linting
pnpm lint             # Verificar código
pnpm lint:fix         # Corregir automáticamente

# Type Checking
pnpm type-check       # Verificar tipos TypeScript
```

### Scripts Personalizados

Agregar a `package.json`:

```json
{
  "scripts": {
    "dev:host": "vite --host",
    "build:analyze": "vite build --mode analyze",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.vite",
    "reset": "pnpm clean && pnpm install"
  }
}
```

## 🔧 Configuración de Build

### Vite Configuration

El archivo `vite.config.ts` ya está configurado con:

- **React Plugin**: Soporte para JSX/TSX
- **Path Aliases**: `@/` apunta a `src/`
- **Build Optimization**: Minificación y splitting
- **Dev Server**: Hot reload y HMR

### Optimizaciones de Build

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['apexcharts', 'react-apexcharts'],
          firebase: ['firebase/app', 'firebase/firestore'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

## 📊 Herramientas de Desarrollo

### DevTools

#### React DevTools

```bash
# Instalar extensión de navegador
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

#### Redux DevTools (para Zustand)

```bash
# Instalar extensión de navegador
# Chrome: Redux DevTools
# Firefox: Redux DevTools
```

### Debugging

#### Configuración de Debug

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Attach to Chrome",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

#### Logging

```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: unknown) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};
```

## 🔒 Configuración de Seguridad

### Variables de Entorno

```bash
# Nunca committear .env
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Configuración de Dispositivos

### Desarrollo Móvil

```bash
# Servidor con host público para testing móvil
pnpm dev:host

# URL disponible en red local
# http://192.168.1.x:5173
```

### Responsive Testing

```bash
# Herramientas de testing responsive
# Chrome DevTools: Device Toolbar
# Firefox: Responsive Design Mode
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. **Error de Dependencias**

```bash
# Limpiar cache
pnpm store prune
rm -rf node_modules
pnpm install
```

#### 2. **Error de TypeScript**

```bash
# Verificar configuración
pnpm tsc --noEmit

# Limpiar cache de TypeScript
rm -rf node_modules/.cache
```

#### 3. **Error de ESLint**

```bash
# Verificar configuración
pnpm lint

# Corregir automáticamente
pnpm lint:fix
```

#### 4. **Error de Build**

```bash
# Limpiar build
rm -rf dist
pnpm build
```

#### 5. **Error de Firebase**

```bash
# Verificar variables de entorno
cat .env

# Verificar configuración de Firebase
# En src/api/firebase.ts
```

### Logs de Desarrollo

```bash
# Ver logs detallados
DEBUG=vite:* pnpm dev

# Ver logs de build
pnpm build --debug
```

## 📚 Recursos Adicionales

### Documentación Oficial

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

### Herramientas Recomendadas

- **Postman**: Testing de APIs
- **Insomnia**: Alternativa a Postman
- **Figma**: Diseño de interfaces
- **Lighthouse**: Análisis de performance

## ✅ Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] pnpm 8+ instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] VS Code configurado
- [ ] Extensiones instaladas
- [ ] Servidor de desarrollo funcionando
- [ ] Linting configurado
- [ ] TypeScript funcionando
- [ ] Firebase configurado
- [ ] Testing configurado

## 🎯 Próximos Pasos

1. **Explorar el código**: Revisar estructura de carpetas
2. **Ejecutar tests**: `pnpm test`
3. **Revisar documentación**: Leer archivos en `docs/`
4. **Hacer primer commit**: Configurar Git hooks
5. **Configurar CI/CD**: Pipeline de integración continua
