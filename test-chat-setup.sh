#!/bin/bash

echo "🧪 Probando configuración del chat en el mismo host..."

# Verificar que Python esté instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no está instalado"
    exit 1
fi

echo "✅ Python3 encontrado"

# Verificar que las dependencias estén instaladas
cd gpt-server
if [ ! -d "venv" ]; then
    echo "🔧 Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate

# Verificar dependencias
echo "📦 Verificando dependencias..."
pip install -r requirements.txt

# Probar el servidor Python
echo "🤖 Probando servidor Python..."
python main.py &
SERVER_PID=$!

# Esperar a que se inicie
sleep 10

# Probar la conexión
echo "🔍 Probando conexión al servidor..."
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Servidor Python funcionando en http://localhost:8001"
    
    # Probar endpoint de chat
    echo "💬 Probando endpoint de chat..."
    curl -X POST http://localhost:8001/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "Hola, ¿cómo estás?", "reasoning_level": "low"}' \
        --max-time 30
    
    echo ""
    echo "✅ Configuración del chat funcionando correctamente"
else
    echo "❌ Error: No se pudo conectar al servidor Python"
fi

# Limpiar
kill $SERVER_PID 2>/dev/null
cd ..

echo ""
echo "🎯 Para iniciar ambos servidores, ejecuta:"
echo "   ./start-dev.sh" 