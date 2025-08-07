# Configuración del Chat con OpenAI

## 🚀 Configuración Rápida

Para habilitar el chat con modelo de lenguaje real (OpenAI), sigue estos pasos:

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú lateral
4. Crea una nueva API key
5. Copia la key (empieza con `sk-`)

### 2. Configurar en Netlify

#### Opción A: Variables de Entorno en Netlify Dashboard

1. Ve a tu proyecto en [Netlify Dashboard](https://app.netlify.com/)
2. Ve a **Site settings** → **Environment variables**
3. Agrega una nueva variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Tu API key de OpenAI (ej: `sk-...`)
4. Guarda los cambios

#### Opción B: Variables de Entorno Locales

Crea un archivo `.env` en la raíz del proyecto:

```bash
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### 3. Verificar Configuración

Una vez configurado, el health check mostrará:

```json
{
  "status": "healthy",
  "mode": "openai",
  "model": "gpt-3.5-turbo",
  "openai_available": true
}
```

## 🔧 Funcionamiento

### Modo OpenAI (Recomendado)
- ✅ Respuestas libres y naturales
- ✅ Contexto personalizado del usuario
- ✅ Consejos específicos de fitness
- ✅ Motivación personalizada

### Modo Fallback (Sin OpenAI)
- ✅ Respuestas inteligentes basadas en palabras clave
- ✅ 15 categorías de respuestas predefinidas
- ✅ Funciona sin configuración adicional

## 💰 Costos

- **OpenAI GPT-3.5-turbo**: ~$0.002 por 1K tokens
- **Uso típico**: ~$0.01-0.05 por conversación
- **Fallback**: Gratis (sin costos adicionales)

## 🛠️ Personalización

### Modificar el Prompt del Sistema

Edita `netlify/functions/chat.js` y modifica la variable `systemPrompt`:

```javascript
const systemPrompt = `Eres un entrenador personal experto llamado "GymBro".
Instrucciones personalizadas aquí...`;
```

### Agregar Más Respuestas de Fallback

En la función `generateFallbackResponse`, agrega más palabras clave:

```javascript
const responses = {
  'nueva-palabra': 'Nueva respuesta personalizada',
  // ... más respuestas
};
```

## 🔍 Troubleshooting

### Error: "OpenAI API key no configurada"
- Verifica que la variable `OPENAI_API_KEY` esté configurada
- Asegúrate de que el valor sea correcto (empieza con `sk-`)

### Error: "OpenAI API error: 401"
- La API key es inválida o ha expirado
- Genera una nueva key en OpenAI Platform

### Error: "OpenAI API error: 429"
- Has excedido el límite de rate limit
- Espera unos minutos antes de hacer más preguntas

## 📊 Monitoreo

### Logs de Netlify
- Ve a **Functions** → **chat** en tu dashboard de Netlify
- Revisa los logs para ver el funcionamiento

### Health Check
- Endpoint: `/api/health`
- Muestra el estado actual del sistema

## 🔒 Seguridad

- ✅ Las API keys nunca se exponen al frontend
- ✅ Todas las llamadas pasan por Netlify Functions
- ✅ Variables de entorno seguras en Netlify
- ✅ Fallback automático si OpenAI falla

## 🚀 Próximos Pasos

1. **Configura OpenAI** siguiendo los pasos arriba
2. **Prueba el chat** con diferentes preguntas
3. **Personaliza el prompt** según tus necesidades
4. **Monitorea los costos** en tu dashboard de OpenAI 