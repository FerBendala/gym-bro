#!/bin/bash

echo "🚀 Instalando dependencias para gpt-oss-20b..."

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3.8+"
    exit 1
fi

# Verificar si pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 no está instalado. Por favor instala pip"
    exit 1
fi

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "⬆️ Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias base
echo "📚 Instalando dependencias base..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Instalar transformers y dependencias
echo "🤗 Instalando transformers..."
pip install transformers accelerate

# Instalar Flask y CORS
echo "🌐 Instalando Flask y CORS..."
pip install flask flask-cors

# Instalar vLLM para gpt-oss (opcional, para mejor rendimiento)
echo "⚡ Instalando vLLM para gpt-oss..."
pip install --pre vllm==0.10.1+gptoss \
    --extra-index-url https://wheels.vllm.ai/gpt-oss/ \
    --extra-index-url https://download.pytorch.org/whl/nightly/cu128 \
    --index-strategy unsafe-best-match

# Instalar gpt-oss package
echo "🎯 Instalando gpt-oss package..."
pip install gpt-oss

echo "✅ Instalación completada!"
echo ""
echo "📋 Para usar el servidor:"
echo "1. Activa el entorno virtual: source venv/bin/activate"
echo "2. Ejecuta el servidor: python main-gpt-oss.py"
echo "3. El servidor estará disponible en: http://localhost:8004"
echo ""
echo "🔍 Para verificar la instalación:"
echo "python -c \"import torch; print(f'CUDA disponible: {torch.cuda.is_available()}')\""
echo "python -c \"from transformers import AutoTokenizer; print('Transformers OK')\"" 