# Configuración del Chat en el Mismo Host

## 🎯 Objetivo

Ejecutar el chat GPT-OSS-120B **completamente en el mismo host** que la aplicación React, sin necesidad de servicios externos ni API keys.

## 📋 Requisitos

### Sistema

- **Python 3.8+**
- **Node.js 16+**
- **pip3**
- **Git**

### Hardware (Recomendado)

- **RAM**: 16GB+ (mínimo 8GB)
- **GPU**: Compatible con CUDA (opcional pero recomendado)
- **Almacenamiento**: 10GB+ libre para el modelo

## 🚀 Instalación Paso a Paso

### 1. **Verificar Python**

```bash
python3 --version
pip3 --version
```

### 2. **Crear entorno virtual**

```bash
cd gpt-server
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. **Instalar dependencias**

```bash
pip install -r requirements.txt
```

### 4. **Probar la configuración**

```bash
cd ..
./test-chat-setup.sh
```

### 5. **Iniciar ambos servidores**

```bash
./start-dev.sh
```

## 🔧 Configuración de Puertos

### Servidores en el mismo host:

- **React/Vite**: `http://localhost:5173`
- **GPT-OSS API**: `http://localhost:8001`

### Verificar que funcionan:

```bash
# Verificar React
curl http://localhost:5173

# Verificar API Python
curl http://localhost:8001/health
```

## 🐛 Troubleshooting

### Error: "Python no encontrado"

```bash
# Instalar Python en macOS
brew install python3

# Instalar Python en Ubuntu
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### Error: "Modelo no carga"

```bash
# Verificar GPU
nvidia-smi

# Verificar memoria
free -h

# Usar CPU si no hay GPU
# El modelo funcionará más lento pero funcionará
```

### Error: "Puerto 8001 ocupado"

```bash
# Encontrar proceso que usa el puerto
lsof -i :8001

# Matar proceso
kill -9 <PID>
```

### Error: "CORS error"

- El servidor Python ya incluye configuración CORS
- Verificar que ambos servidores estén en los puertos correctos
- Verificar que el navegador no esté bloqueando las peticiones

## 📊 Monitoreo

### Verificar estado de los servidores:

```bash
# Estado de React
curl -s http://localhost:5173 > /dev/null && echo "✅ React OK" || echo "❌ React Error"

# Estado de Python API
curl -s http://localhost:8001/health | jq '.'
```

### Logs en tiempo real:

```bash
# Ver logs del servidor Python
tail -f gpt-server/logs/app.log

# Ver logs de React
npm run dev
```

## 🔒 Seguridad

### Ventajas del mismo host:

- ✅ **Sin API keys**: No hay costos externos
- ✅ **Datos privados**: Todo se procesa localmente
- ✅ **Sin internet**: Funciona offline
- ✅ **Control total**: Tú controlas el modelo

### Consideraciones:

- ⚠️ **Recursos**: El modelo requiere mucha RAM/GPU
- ⚠️ **Primera descarga**: ~63GB de modelo
- ⚠️ **Tiempo de carga**: 2-5 minutos al iniciar

## 🎯 Uso

### En la aplicación:

1. Navega a "IA Chat" en el menú
2. Verifica que el indicador de conexión esté verde
3. Haz preguntas sobre entrenamiento
4. Usa las preguntas rápidas para empezar

### Ejemplos de uso:

- "¿Cómo mejorar mi press de banca?"
- "¿Cuánta proteína necesito?"
- "¿Cómo superar una meseta?"
- "¿Cardio antes o después de pesas?"

## 🔄 Actualizaciones

### Actualizar el modelo:

```bash
cd gpt-server
source venv/bin/activate
pip install --upgrade transformers torch
```

### Actualizar dependencias:

```bash
cd gpt-server
source venv/bin/activate
pip install -r requirements.txt --upgrade
```

## 📞 Soporte

### Si algo no funciona:

1. Ejecuta `./test-chat-setup.sh`
2. Verifica los logs de error
3. Asegúrate de que ambos servidores estén ejecutándose
4. Verifica que los puertos no estén ocupados

### Comandos útiles:

```bash
# Reiniciar todo
pkill -f "python main.py"
pkill -f "vite"
./start-dev.sh

# Verificar procesos
ps aux | grep python
ps aux | grep vite

# Verificar puertos
netstat -tulpn | grep :8001
netstat -tulpn | grep :5173
```
