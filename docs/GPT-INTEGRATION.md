# Integración GPT-OSS-120B en Follow Gym

## 🎯 **Mismo Host - Sin API Keys**

Esta integración ejecuta **todo en el mismo host** sin necesidad de API keys externas.

## 🚀 Inicio Rápido

### 1. **Instalar dependencias Python**

```bash
cd gpt-server
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. **Probar la configuración**

```bash
./test-chat-setup.sh
```

### 3. **Iniciar ambos servidores en el mismo host**

```bash
./start-dev.sh
```

Esto iniciará **todo en localhost**:

- **React/Vite**: http://localhost:5173
- **GPT-OSS API**: http://localhost:8001

## 📁 Estructura del Proyecto

```
follow-gym/
├── gpt-server/                    # Servidor Python
│   ├── main.py                   # API FastAPI
│   ├── requirements.txt          # Dependencias Python
│   └── venv/                    # Entorno virtual
├── src/
│   ├── api/services/
│   │   └── chat-service.ts      # Servicio de comunicación
│   ├── hooks/
│   │   └── use-chat.ts         # Hook personalizado
│   └── components/
│       └── chat-assistant/      # Componente de chat
├── start-dev.sh                 # Script de inicio
└── GPT-INTEGRATION.md          # Esta documentación
```

## 🔧 Configuración

### Requisitos del Sistema

- **Python 3.8+**
- **pip3**
- **Node.js 16+**
- **GPU compatible** (recomendado para mejor rendimiento)

### Puertos Utilizados

- **5173**: Servidor de desarrollo Vite
- **8001**: API GPT-OSS

## 💻 Uso en la Aplicación

### Importar el componente

```typescript
import { ChatAssistant } from '../components/chat-assistant';

// En tu componente
<ChatAssistant
  title='Asistente de Entrenamiento'
  placeholder='Pregunta sobre tu rutina...'
/>;
```

### Usar el hook directamente

```typescript
import { useChat } from '../hooks';

const { sendMessage, response, loading, isConnected } = useChat();

// Enviar mensaje
await sendMessage('¿Cómo puedo mejorar mi press de banca?');

// Analizar datos de entrenamiento
await analyzeTrainingData(JSON.stringify(trainingData));
```

## 🎯 Funcionalidades

### 1. **Chat General**

- Preguntas sobre entrenamiento
- Consejos de nutrición
- Técnicas de ejercicio

### 2. **Análisis de Datos**

- Análisis de progreso
- Identificación de patrones
- Recomendaciones específicas

### 3. **Niveles de Razonamiento**

- **Bajo**: Respuestas rápidas
- **Medio**: Balance velocidad/detalle
- **Alto**: Análisis profundo

## 🔍 Endpoints de la API

### GET `/health`

Verificar estado del servidor y modelo.

### POST `/chat`

```json
{
  "message": "¿Cómo mejorar mi press de banca?",
  "reasoning_level": "high",
  "context": "Datos adicionales de entrenamiento"
}
```

### POST `/analyze-training`

Análisis específico de datos de entrenamiento.

## 🛠️ Desarrollo

### Iniciar solo el servidor Python

```bash
cd gpt-server
source venv/bin/activate
python main.py
```

### Iniciar solo el servidor React

```bash
npm run dev
```

### Verificar conexión

```bash
curl http://localhost:8001/health
```

## 🔧 Troubleshooting

### Error: "Modelo no cargado"

- Verificar que Python esté instalado
- Verificar dependencias: `pip install -r requirements.txt`
- Verificar GPU/dispositivo disponible

### Error: "CORS error"

- El servidor Python ya incluye configuración CORS
- Verificar que el puerto 8001 esté libre

### Error: "Connection refused"

- Verificar que el servidor Python esté ejecutándose
- Verificar puerto 8001
- Revisar logs del servidor Python

## 📊 Monitoreo

### Logs del Servidor Python

```bash
tail -f gpt-server/logs/app.log
```

### Estado de la API

```bash
curl http://localhost:8001/health
```

## 🚀 Producción

### Optimizaciones Recomendadas

1. **Modelo cuantizado** para menor uso de memoria
2. **Caché de respuestas** para preguntas frecuentes
3. **Rate limiting** para evitar sobrecarga
4. **Logging estructurado** para monitoreo

### Variables de Entorno

```bash
export GPT_MODEL_PATH="/path/to/local/model"
export GPT_MAX_TOKENS=512
export GPT_TEMPERATURE=0.7
```

## 📝 Notas Importantes

- **Primera ejecución**: El modelo se descargará automáticamente (~63GB)
- **Memoria**: Requiere mínimo 16GB RAM, recomendado 32GB+
- **GPU**: Opcional pero mejora significativamente el rendimiento
- **Licencia**: Apache 2.0 - uso comercial permitido

## 🤝 Contribución

Para añadir nuevas funcionalidades:

1. **Backend**: Modificar `gpt-server/main.py`
2. **Frontend**: Actualizar `src/api/services/chat-service.ts`
3. **UI**: Modificar `src/components/chat-assistant/`

## 📞 Soporte

Si encuentras problemas:

1. Verificar logs del servidor Python
2. Verificar conexión: `curl http://localhost:8001/health`
3. Reiniciar ambos servidores: `./start-dev.sh`
