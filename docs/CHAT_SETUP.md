# Configuración del Chat con Phi-3

## 🚀 Configuración Rápida

El chat ahora usa **Phi-3-mini-4k-instruct** de Microsoft, que es un modelo de lenguaje avanzado y **completamente gratuito** a través de Hugging Face Inference API.

### 🎯 Ventajas de Phi-3

- ✅ **Completamente gratuito** (hasta 30,000 requests/mes)
- ✅ **Modelo avanzado** de Microsoft (3.8B parámetros)
- ✅ **Respuestas naturales** y conversacionales
- ✅ **Contexto de 4K tokens** para conversaciones largas
- ✅ **Optimizado para instrucciones** y conversaciones
- ✅ **Sin costos ocultos** ni límites estrictos

### 🔧 Funcionamiento Automático

El sistema está configurado para funcionar automáticamente:

1. **API de Hugging Face**: Usa la Inference API gratuita
2. **Fallback inteligente**: Si la API no está disponible
3. **Respuestas contextuales**: Basadas en los datos del usuario
4. **Conversaciones naturales**: Como un entrenador personal real

## 🔧 Funcionamiento

### Modo Phi-3 (Recomendado)
- ✅ **Respuestas libres y naturales** usando el modelo de Microsoft
- ✅ **Contexto personalizado** basado en los datos del usuario
- ✅ **Consejos específicos** de fitness y entrenamiento
- ✅ **Motivación personalizada** según el historial del usuario
- ✅ **Conversaciones fluidas** sobre cualquier tema de fitness

### Modo Fallback (Sin API)
- ✅ **15 categorías de respuestas** basadas en palabras clave
- ✅ **Funciona sin configuración** adicional
- ✅ **Respuestas inteligentes** para temas específicos

## 💰 Costos

- **Phi-3**: **Completamente gratis** (30,000 requests/mes)
- **Uso típico**: **Sin costos** (dentro del límite gratuito)
- **Fallback**: **Gratis** (sin costos adicionales)

## 🛠️ Configuración

### 1. Obtener API Key de Hugging Face

1. Ve a [Hugging Face](https://huggingface.co/)
2. Crea una cuenta o inicia sesión
3. Ve a **Settings** → **Access Tokens**
4. Crea un nuevo token
5. Copia el token (empieza con `hf_`)

### 2. Configurar en Netlify

#### Opción A: Variables de Entorno en Netlify Dashboard

1. Ve a tu proyecto en [Netlify Dashboard](https://app.netlify.com/)
2. Ve a **Site settings** → **Environment variables**
3. Agrega una nueva variable:
   - **Key**: `HF_API_KEY`
   - **Value**: Tu token de Hugging Face (ej: `hf_...`)
4. Guarda los cambios

#### Opción B: Variables de Entorno Locales

Crea un archivo `.env` en la raíz del proyecto:

```bash
HF_API_KEY=hf-tu-token-aqui
```

### 3. Verificar Configuración

Una vez configurado, el health check mostrará:

```json
{
  "status": "healthy",
  "mode": "phi-3",
  "model": "phi-3-mini-4k-instruct",
  "phi3_available": true
}
```

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

### Error: "Hugging Face API key no configurada"
- Verifica que la variable `HF_API_KEY` esté configurada
- Asegúrate de que el valor sea correcto (empieza con `hf_`)

### Error: "Hugging Face API error: 401"
- El token es inválido o ha expirado
- Genera un nuevo token en Hugging Face

### Error: "Hugging Face API error: 429"
- Has excedido el límite de rate limit
- Espera unos minutos antes de hacer más preguntas

### Error: "Hugging Face API error: 503"
- El modelo está cargando (primera vez)
- Espera unos segundos y vuelve a intentar

## 📊 Monitoreo

### Logs de Netlify
- Ve a **Functions** → **chat** en tu dashboard de Netlify
- Revisa los logs para ver el funcionamiento del modelo

### Health Check
- Endpoint: `/api/health`
- Muestra el estado actual del sistema

## 🔒 Seguridad

- ✅ **API key segura**: Nunca se expone al frontend
- ✅ **Todas las llamadas** pasan por Netlify Functions
- ✅ **Variables de entorno** seguras en Netlify
- ✅ **Fallback automático** si la API falla

## 🚀 Próximos Pasos

1. **Configura Hugging Face** siguiendo los pasos arriba
2. **Prueba el chat** con diferentes tipos de preguntas
3. **Personaliza el prompt** según tus necesidades específicas
4. **Monitorea el uso** en tu dashboard de Hugging Face

## 📚 Recursos Adicionales

- [Phi-3-mini-4k-instruct en Hugging Face](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index)
- [Documentación de Phi-3](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct) 