#!/bin/bash

# Script para iniciar el entorno de desarrollo completo
# Incluye el servidor de chat Python y el frontend React

echo "🚀 Iniciando entorno de desarrollo completo..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo procesos..."
    pkill -f "python main-fast.py" || true
    pkill -f "pnpm dev" || true
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap cleanup SIGINT

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Función para iniciar el servidor de chat
start_chat_server() {
    echo "🐍 Iniciando servidor de chat Python..."
    cd gpt-server
    
    # Verificar si existe el entorno virtual
    if [ ! -d "venv" ]; then
        echo "📦 Creando entorno virtual..."
        python3 -m venv venv
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Instalar dependencias si no están instaladas
    if [ ! -f "venv/lib/python*/site-packages/fastapi" ]; then
        echo "📦 Instalando dependencias de Python..."
        pip install -r requirements.txt
    fi
    
    # Iniciar servidor de chat en background
    echo "🚀 Iniciando servidor de chat en http://localhost:8004"
    python main-fast.py &
    CHAT_PID=$!
    
    # Volver al directorio raíz
    cd ..
    
    # Esperar a que el servidor esté listo
    echo "⏳ Esperando a que el servidor de chat esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:8004/health > /dev/null 2>&1; then
            echo "✅ Servidor de chat listo!"
            break
        fi
        echo "⏳ Esperando... ($i/30)"
        sleep 2
    done
    
    if ! curl -s http://localhost:8004/health > /dev/null 2>&1; then
        echo "❌ Error: El servidor de chat no se pudo iniciar correctamente"
        exit 1
    fi
}

# Función para iniciar el frontend
start_frontend() {
    echo "⚛️ Iniciando frontend React..."
    
    # Verificar si pnpm está instalado
    if ! command -v pnpm &> /dev/null; then
        echo "❌ Error: pnpm no está instalado. Instálalo con: npm install -g pnpm"
        exit 1
    fi
    
    # Instalar dependencias si no están instaladas
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias de Node.js..."
        pnpm install
    fi
    
    # Iniciar servidor de desarrollo
    echo "🚀 Iniciando servidor de desarrollo en http://localhost:5173"
    pnpm dev &
    FRONTEND_PID=$!
}

# Función para mostrar información
show_info() {
    echo ""
    echo "🎉 Entorno de desarrollo iniciado correctamente!"
    echo ""
    echo "📱 Frontend: http://localhost:5173"
    echo "🤖 Chat API: http://localhost:8004"
    echo ""
    echo "📋 Comandos útiles:"
    echo "  - Ver logs del chat: tail -f gpt-server/chat.log"
    echo "  - Verificar estado: curl http://localhost:8004/health"
    echo "  - Detener todo: Ctrl+C"
    echo ""
    echo "⏳ Presiona Ctrl+C para detener todos los servicios..."
    echo ""
}

# Función principal
main() {
    echo "🔧 Configurando entorno de desarrollo..."
    
    # Iniciar servidor de chat
    start_chat_server
    
    # Iniciar frontend
    start_frontend
    
    # Mostrar información
    show_info
    
    # Mantener el script ejecutándose
    wait
}

# Ejecutar función principal
main 