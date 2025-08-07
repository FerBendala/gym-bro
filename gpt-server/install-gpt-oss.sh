#!/bin/bash

echo "🚀 Instalando GPT-OSS-20B con Ollama..."

# Verificar si Ollama está instalado
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama no está instalado. Por favor instala Ollama primero:"
    echo "   https://ollama.ai/download"
    exit 1
fi

echo "📥 Descargando GPT-OSS-20B..."
ollama pull gpt-oss:20b

echo "✅ GPT-OSS-20B instalado correctamente!"
echo ""
echo "🎯 Para usar el modelo:"
echo "   ollama run gpt-oss:20b"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   python main-fast.py"
echo ""
echo "📊 Características del modelo:"
echo "   • 21B parámetros"
echo "   • Reasoning levels: low, medium, high"
echo "   • Optimizado para conversaciones"
echo "   • Apache 2.0 license" 