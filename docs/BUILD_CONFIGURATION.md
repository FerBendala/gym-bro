# 🔧 Configuración de Build - Follow Gym

## 🎯 Visión General

Follow Gym utiliza Vite como build tool principal, con configuraciones optimizadas para desarrollo y producción. El sistema de build está diseñado para maximizar el rendimiento y minimizar el tamaño del bundle.

## 🛠️ Configuración de Vite

### Configuración Base

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['apexcharts', 'react-apexcharts'],
          firebase: ['firebase/app', 'firebase/firestore'],
          utils: ['date-fns', 'clsx'],
        },
      },
    },
  },
});
```

### Optimizaciones de Desarrollo

```typescript
// vite.config.ts - Configuración de desarrollo
export default defineConfig({
  server: {
    // Hot Module Replacement optimizado
    hmr: {
      overlay: true,
    },
    // Proxy para APIs externas
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'apexcharts',
    ],
  },
});
```

### Optimizaciones de Producción

```typescript
// vite.config.ts - Configuración de producción
export default defineConfig({
  build: {
    // Configuración de chunks
    rollupOptions: {
      output: {
        // Chunks manuales para mejor caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['zustand'],

          // Feature chunks
          'charts-vendor': ['apexcharts', 'react-apexcharts'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore'],
          'utils-vendor': ['date-fns', 'clsx'],

          // Component chunks
          'ui-components': [
            '@/components/button',
            '@/components/card',
            '@/components/input',
          ],
          'data-components': [
            '@/components/exercise-card',
            '@/components/exercise-list',
            '@/components/stat-card',
          ],
        },

        // Nombres de archivos optimizados
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `js/[name]-[hash].js`;
        },

        // Assets optimizados
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },

    // Configuración de minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Límites de tamaño
    chunkSizeWarningLimit: 1000,

    // Source maps para debugging
    sourcemap: true,
  },
});
```

## 📦 Configuración de TypeScript

### Configuración Base

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Configuración de Node

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["vite.config.ts"]
}
```

## 🎨 Configuración de Tailwind CSS

### Configuración Base

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

### Optimizaciones de CSS

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
```

## 🚀 Optimizaciones de Performance

### Code Splitting

```typescript
// Lazy loading de componentes pesados
const AdminPanel = lazy(() => import('@/pages/admin-panel'));
const Analytics = lazy(() => import('@/components/analytics'));
const DataExport = lazy(() => import('@/components/data-export'));

// Lazy loading de utilidades
const heavyUtils = lazy(() => import('@/utils/heavy-utils'));
```

### Tree Shaking

```typescript
// Importaciones específicas para tree shaking
import { Button } from '@/components/button';
import { roundToDecimals } from '@/utils/functions/math-utils';

// En lugar de importaciones completas
// import * as utils from '@/utils';
```

### Bundle Analysis

```bash
# Instalar analizador de bundle
pnpm add -D rollup-plugin-visualizer

# Configurar en vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

## 🔧 Configuración de Entorno

### Variables de Entorno

```bash
# .env.development
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

# .env.production
VITE_APP_ENV=production
VITE_API_URL=https://api.followgym.com
VITE_DEBUG=false
```

### Configuración de Build por Entorno

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    build: {
      // Configuraciones específicas por entorno
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,

      rollupOptions: {
        output: {
          // Chunks diferentes por entorno
          manualChunks: isProduction
            ? {
                vendor: ['react', 'react-dom'],
                charts: ['apexcharts'],
              }
            : undefined,
        },
      },
    },
  };
});
```

## 📊 Métricas de Build

### Tamaños de Bundle

```bash
# Analizar bundle
pnpm build:analyze

# Resultados típicos:
# - Total: ~500KB (gzipped: ~150KB)
# - Vendor: ~200KB (gzipped: ~60KB)
# - App: ~150KB (gzipped: ~45KB)
# - Charts: ~100KB (gzipped: ~30KB)
# - Firebase: ~50KB (gzipped: ~15KB)
```

### Performance Metrics

```typescript
// Métricas de performance
const performanceMetrics = {
  firstContentfulPaint: '< 1.5s',
  largestContentfulPaint: '< 2.5s',
  cumulativeLayoutShift: '< 0.1',
  firstInputDelay: '< 100ms',
  timeToInteractive: '< 3s',
};
```

## 🔍 Configuración de Debugging

### Source Maps

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true, // Para debugging en producción
  },
});
```

### DevTools

```typescript
// Configuración de Redux DevTools para Zustand
import { devtools } from 'zustand/middleware';

const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'follow-gym-store',
    }
  )
);
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. **Bundle Size Muy Grande**

```bash
# Analizar bundle
pnpm build:analyze

# Identificar dependencias grandes
pnpm list --depth=0

# Optimizar imports
# Usar importaciones específicas en lugar de completas
```

#### 2. **Build Lento**

```bash
# Limpiar cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstalar dependencias
pnpm install

# Usar build paralelo
pnpm build --parallel
```

#### 3. **Errores de TypeScript**

```bash
# Verificar configuración
pnpm tsc --noEmit

# Limpiar cache de TypeScript
rm -rf node_modules/.cache
```

#### 4. **Problemas de CSS**

```bash
# Rebuild CSS
pnpm build:css

# Verificar PostCSS
npx postcss src/index.css --output dist/output.css
```

## 📈 Optimizaciones Avanzadas

### Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'follow-gym-v1';
const urlsToCache = ['/', '/static/js/bundle.js', '/static/css/main.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});
```

### PWA Configuration

```json
// public/manifest.json
{
  "name": "Follow Gym",
  "short_name": "FollowGym",
  "description": "Fitness tracking application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Compression

```typescript
// vite.config.ts
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

## 🎯 Scripts de Build

### Scripts Disponibles

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:analyze": "vite build --mode analyze",
    "build:staging": "vite build --mode staging",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Scripts Personalizados

```bash
#!/bin/bash
# scripts/build.sh

echo "🚀 Building Follow Gym..."

# Limpiar build anterior
rm -rf dist

# Verificar tipos
pnpm type-check

# Linting
pnpm lint

# Build de producción
pnpm build

# Analizar bundle
pnpm build:analyze

echo "✅ Build completado!"
```

## 📊 Métricas de Rendimiento

### Lighthouse Scores

```typescript
const lighthouseScores = {
  performance: 95,
  accessibility: 100,
  bestPractices: 95,
  seo: 90,
};
```

### Bundle Analysis

```typescript
const bundleMetrics = {
  totalSize: '500KB',
  gzippedSize: '150KB',
  chunks: 8,
  modules: 250,
  dependencies: 45,
};
```

## 🔮 Roadmap de Optimizaciones

### Fase Actual (v1.0)

- ✅ Vite configurado
- ✅ TypeScript optimizado
- ✅ Tailwind CSS configurado
- ✅ Code splitting implementado
- ✅ Bundle analysis configurado

### Fase Futura (v2.0)

- 🚧 Service Worker para caching
- 🚧 PWA completa
- 🚧 Micro-frontends
- 🚧 CDN optimization
- 🚧 Edge caching
