# Configuración del Chat con gpt-oss-20b

## 🚀 Configuración Rápida

El chat ahora usa el modelo [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b) de OpenAI, que es un modelo de código abierto gratuito con capacidades avanzadas de razonamiento.

### 🎯 Ventajas de gpt-oss-20b

- ✅ **Completamente gratuito** (no hay costos de API)
- ✅ **Código abierto** (Apache 2.0 license)
- ✅ **Capacidades de razonamiento** configurable (low, medium, high)
- ✅ **21B parámetros** con 3.6B parámetros activos
- ✅ **Formato Harmony** para respuestas estructuradas
- ✅ **Funciona localmente** o en servidores

### 🔧 Funcionamiento Automático

El sistema está configurado para funcionar automáticamente:

1. **Descarga automática** del modelo desde Hugging Face
2. **Instalación automática** de dependencias Python
3. **Fallback inteligente** si el modelo no está disponible
4. **Configuración de reasoning** (low, medium, high)

## 🔧 Funcionamiento

### Modo gpt-oss-20b (Recomendado)
- ✅ **Respuestas libres y naturales** usando el modelo local
- ✅ **Contexto personalizado** basado en los datos del usuario
- ✅ **Consejos específicos** de fitness y entrenamiento
- ✅ **Motivación personalizada** según el historial del usuario
- ✅ **Razonamiento configurable** según la complejidad de la pregunta

### Modo Fallback (Sin modelo)
- ✅ **15 categorías de respuestas** basadas en palabras clave
- ✅ **Funciona sin configuración** adicional
- ✅ **Respuestas inteligentes** para temas específicos

## 💰 Costos

- **gpt-oss-20b**: **Completamente gratis** (modelo de código abierto)
- **Uso típico**: **Sin costos** (se ejecuta localmente)
- **Fallback**: **Gratis** (sin costos adicionales)

## 🛠️ Personalización

### Modificar el Prompt del Sistema

Edita `netlify/functions/chat-python.py` y modifica la variable `system_content`:

```python
system_content = 'Eres un experto en fitness y entrenamiento llamado "GymBro".
Instrucciones personalizadas aquí...'
```

### Configurar Nivel de Razonamiento

El modelo soporta tres niveles de razonamiento:

- **Low**: Respuestas rápidas para diálogo general
- **Medium**: Velocidad y detalle balanceados (por defecto)
- **High**: Análisis profundo y detallado

Se puede configurar enviando `reasoning_level` en la request:

```javascript
{
  "message": "¿Qué ejercicios me recomiendas?",
  "reasoning_level": "high",
  "context": "datos del usuario..."
}
```

### Agregar Más Respuestas de Fallback

En la función `generate_fallback_response`, agrega más palabras clave:

```python
responses = {
    'nueva-palabra': 'Nueva respuesta personalizada',
    # ... más respuestas
}
```

## 🔍 Troubleshooting

### Error: "Dependencias de IA no disponibles"
- El modelo se está descargando por primera vez
- Espera unos minutos para que se complete la descarga
- Verifica que hay suficiente espacio en disco

### Error: "Modelo no disponible, usando fallback"
- El modelo está en proceso de carga
- La primera carga puede tomar varios minutos
- Las siguientes cargas serán más rápidas

### Error: "Error cargando modelo"
- Verifica que hay suficiente memoria RAM (mínimo 16GB recomendado)
- El modelo requiere aproximadamente 16GB de memoria
- Considera usar un servidor con más recursos

## 📊 Monitoreo

### Logs de Netlify
- Ve a **Functions** → **chat-python** en tu dashboard de Netlify
- Revisa los logs para ver el funcionamiento del modelo

### Health Check
- Endpoint: `/api/health`
- Muestra el estado actual del sistema

## 🔒 Seguridad

- ✅ **Modelo local**: No hay llamadas a APIs externas
- ✅ **Datos privados**: Todo se procesa localmente
- ✅ **Código abierto**: Transparencia total del modelo
- ✅ **Fallback automático**: Funciona sin configuración adicional

## 🚀 Próximos Pasos

1. **Despliega la aplicación** - El modelo se descargará automáticamente
2. **Prueba el chat** con diferentes tipos de preguntas
3. **Personaliza el prompt** según tus necesidades específicas
4. **Ajusta el reasoning_level** según la complejidad de las preguntas

## 📚 Recursos Adicionales

- [Documentación oficial de gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [Formato Harmony](https://huggingface.co/openai/gpt-oss-20b#reasoning-levels)
- [Capacidades de razonamiento](https://huggingface.co/openai/gpt-oss-20b#reasoning-levels) 