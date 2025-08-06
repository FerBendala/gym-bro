# Guía de Despliegue - Follow Gym

## 🚀 Despliegue en Netlify

### Configuración Local

1. **Iniciar el entorno de desarrollo completo:**

   ```bash
   ./start-dev.sh
   ```

   Esto iniciará:

   - Frontend React en `http://localhost:5173`
   - Servidor de chat Python en `http://localhost:8004`

2. **Verificar que todo funciona:**

   ```bash
   # Verificar servidor de chat
   curl http://localhost:8004/health

   # Verificar frontend
   curl http://localhost:5173
   ```

### Despliegue en Netlify

#### 1. Preparación del Repositorio

Asegúrate de que tu repositorio contenga:

- ✅ `netlify.toml` (configuración de Netlify)
- ✅ `netlify/functions/` (funciones serverless)
- ✅ Variables de entorno configuradas

#### 2. Configuración en Netlify

1. **Conectar repositorio:**

   - Ve a [Netlify](https://netlify.com)
   - Conecta tu repositorio de GitHub
   - Configura el build:
     - **Build command:** `pnpm build`
     - **Publish directory:** `dist`

2. **Configurar variables de entorno:**
   En el dashboard de Netlify, ve a **Site settings > Environment variables** y añade:
   ```
   OPENAI_API_KEY=tu_api_key_de_openai
   CHAT_API_URL=https://api.openai.com/v1/chat/completions
   NODE_ENV=production
   ```

#### 3. Configuración de Funciones Serverless

Las funciones serverless están configuradas en `netlify/functions/`:

- **`chat.js`**: Maneja las peticiones del chat
- **`health.js`**: Health check del servidor

#### 4. Variables de Entorno Opcionales

Para usar OpenAI en producción, configura estas variables en Netlify:

```bash
# Para usar OpenAI (recomendado para producción)
OPENAI_API_KEY=sk-...
CHAT_API_URL=https://api.openai.com/v1/chat/completions

# Para usar API externa
CHAT_API_URL=https://tu-api-externa.com/chat
```

### 🔧 Configuración del Chat

#### Desarrollo Local

- El chat usa `http://localhost:8004` para desarrollo
- Servidor Python con modelo Phi3-mini
- Respuestas rápidas y en español

#### Producción (Netlify)

- El chat usa `/api/chat` (funciones serverless)
- Soporte para OpenAI GPT-3.5-turbo
- Fallback a respuestas simuladas si no hay API key

### 📋 Estructura del Proyecto

```
follow-gym/
├── src/                    # Frontend React
├── gpt-server/            # Servidor Python (solo desarrollo)
├── netlify/
│   └── functions/         # Funciones serverless (producción)
│       ├── chat.js
│       └── health.js
├── netlify.toml           # Configuración de Netlify
├── start-dev.sh           # Script de desarrollo
└── env.example            # Variables de entorno
```

### 🚨 Troubleshooting

#### Problemas Comunes

1. **Chat no responde en producción:**

   - Verifica que las variables de entorno estén configuradas
   - Revisa los logs de Netlify Functions

2. **Error de CORS:**

   - Las funciones serverless ya incluyen headers CORS
   - Verifica que las URLs sean correctas

3. **Modelo no carga:**
   - En desarrollo: Verifica que Ollama esté ejecutándose
   - En producción: Verifica la API key de OpenAI

#### Logs y Debugging

```bash
# Ver logs de desarrollo
tail -f gpt-server/chat.log

# Ver logs de Netlify Functions
# En el dashboard de Netlify > Functions > Logs

# Verificar estado del servidor
curl http://localhost:8004/health
```

### 🔄 Actualizaciones

Para actualizar el despliegue:

1. **Push a main branch:**

   ```bash
   git add .
   git commit -m "Update chat functionality"
   git push origin main
   ```

2. **Netlify se actualiza automáticamente**

3. **Verificar el despliegue:**
   - Revisa los logs en Netlify
   - Prueba el chat en la URL de producción

### 📱 URLs

- **Desarrollo:** `http://localhost:5173`
- **Producción:** `https://tu-app.netlify.app`
- **Chat API (dev):** `http://localhost:8004`
- **Chat API (prod):** `https://tu-app.netlify.app/.netlify/functions/chat`

### 🎯 Características del Chat

- ✅ **Desarrollo local:** Modelo Phi3-mini (rápido)
- ✅ **Producción:** OpenAI GPT-3.5-turbo (completo)
- ✅ **Fallback:** Respuestas simuladas si no hay API
- ✅ **Español:** Todas las respuestas en español
- ✅ **Fitness:** Especializado en entrenamiento y nutrición
- ✅ **Responsive:** Funciona en móvil y desktop
