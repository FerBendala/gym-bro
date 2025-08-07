#!/bin/bash

# Script de build para funciones Python en Netlify
echo "🔧 Instalando dependencias de Python..."

# Instalar dependencias de Python
cd netlify/functions
pip3 install -r requirements.txt

echo "✅ Dependencias de Python instaladas" 