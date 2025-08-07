#!/usr/bin/env python3
"""
Servidor para gpt-oss-20b usando vLLM
Basado en la documentación oficial: https://huggingface.co/openai/gpt-oss-20b
"""

import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuración del modelo
MODEL_ID = "openai/gpt-oss-20b"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Variables globales para el modelo
model = None
tokenizer = None
pipe = None

def load_model():
    """Cargar el modelo gpt-oss-20b"""
    global model, tokenizer, pipe
    
    try:
        logger.info(f"🔄 Cargando modelo {MODEL_ID} en {DEVICE}...")
        
        # Cargar tokenizer y modelo
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype="auto",
            device_map="auto",
            trust_remote_code=True
        )
        
        # Crear pipeline
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            torch_dtype="auto",
            device_map="auto",
        )
        
        logger.info("✅ Modelo gpt-oss-20b cargado exitosamente")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error cargando modelo: {e}")
        return False

def format_harmony_messages(messages, reasoning_level="medium"):
    """Formatear mensajes en formato Harmony para gpt-oss"""
    formatted = ""
    
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        
        if role == "system":
            # Agregar configuración de reasoning
            formatted += f"<|im_start|>system\nReasoning: {reasoning_level}\n{content}<|im_end|>\n"
        elif role == "user":
            formatted += f"<|im_start|>user\n{content}<|im_end|>\n"
        elif role == "assistant":
            formatted += f"<|im_start|>assistant\n{content}<|im_end|>\n"
    
    # Agregar el inicio de la respuesta del asistente
    formatted += "<|im_start|>assistant\n"
    
    return formatted

def generate_response(messages, reasoning_level="medium", max_tokens=1000, temperature=0.7):
    """Generar respuesta usando gpt-oss-20b"""
    try:
        # Formatear mensajes en formato Harmony
        formatted_input = format_harmony_messages(messages, reasoning_level)
        
        logger.info(f"🤖 Generando respuesta con reasoning_level: {reasoning_level}")
        logger.info(f"📝 Input formateado (primeros 200 chars): {formatted_input[:200]}...")
        
        # Generar respuesta
        outputs = pipe(
            formatted_input,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )
        
        # Extraer la respuesta generada
        generated_text = outputs[0]["generated_text"]
        
        # Extraer solo la parte del asistente
        if "<|im_start|>assistant\n" in generated_text:
            response = generated_text.split("<|im_start|>assistant\n")[-1]
            # Remover cualquier token de fin si existe
            response = response.replace("<|im_end|>", "").strip()
        else:
            response = generated_text.strip()
        
        logger.info(f"✅ Respuesta generada (primeros 200 chars): {response[:200]}...")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error generando respuesta: {e}")
        return f"Error generando respuesta: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model": MODEL_ID,
        "device": DEVICE,
        "mode": "gpt-oss-20b"
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Endpoint principal del chat"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        message = data.get('message', '')
        user_context = data.get('context', '')
        reasoning_level = data.get('reasoning_level', 'medium')
        max_tokens = data.get('max_tokens', 1000)
        temperature = data.get('temperature', 0.7)
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        logger.info(f"📨 Mensaje recibido: {message[:100]}...")
        logger.info(f"📊 Contexto recibido (longitud): {len(user_context) if user_context else 0}")
        
        # Verificar que el modelo esté cargado
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        # Preparar mensajes para el modelo
        messages = []
        
        # Agregar contexto del usuario si existe
        if user_context:
            system_content = f"""Eres un experto en fitness y entrenamiento llamado "GymBro". 
            Responde siempre en español de manera completa y detallada. 
            Usa el contexto del usuario para dar respuestas personalizadas.
            
            Contexto del usuario:
            {user_context}"""
        else:
            system_content = 'Eres un experto en fitness y entrenamiento llamado "GymBro". Responde siempre en español de manera completa y detallada.'
        
        messages.append({
            "role": "system",
            "content": system_content
        })
        
        messages.append({
            "role": "user",
            "content": message
        })
        
        # Generar respuesta
        response = generate_response(
            messages, 
            reasoning_level=reasoning_level,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        return jsonify({
            "response": response,
            "model": MODEL_ID,
            "reasoning_level": reasoning_level
        })
        
    except Exception as e:
        logger.error(f"❌ Error en endpoint /chat: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Página de inicio"""
    return jsonify({
        "message": "GPT-OSS-20B Chat Server",
        "model": MODEL_ID,
        "endpoints": {
            "health": "/health",
            "chat": "/chat (POST)"
        }
    })

if __name__ == '__main__':
    # Cargar modelo al iniciar
    if load_model():
        port = int(os.environ.get('PORT', 8004))
        logger.info(f"🚀 Iniciando servidor en puerto {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        logger.error("❌ No se pudo cargar el modelo. Saliendo...")
        exit(1) 