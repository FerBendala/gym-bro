#!/usr/bin/env python3
"""
Función serverless de Netlify para chat con gpt-oss-20b
Basado en la documentación oficial: https://huggingface.co/openai/gpt-oss-20b
"""

import os
import json
import logging
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def handler(event, context):
    """Función principal de Netlify"""
    # Configurar CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
    }

    # Manejar preflight requests
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
        }

    try:
        # Solo permitir POST requests
        if event.get('httpMethod') != 'POST':
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
            }

        # Parsear el body de la request
        body = json.loads(event.get('body', '{}'))
        message = body.get('message', '')
        user_context = body.get('context', '')
        reasoning_level = body.get('reasoning_level', 'medium')
        max_tokens = body.get('max_tokens', 1000)
        temperature = body.get('temperature', 0.7)

        if not message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Message is required'}),
            }

        logger.info(f"📨 Mensaje recibido: {message[:100]}...")
        logger.info(f"📊 Contexto recibido (longitud): {len(user_context) if user_context else 0}")

        # Cargar modelo si no está cargado
        if model is None:
            if not load_model():
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': 'Model not loaded'}),
                }

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

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'response': response,
                'model': MODEL_ID,
                'reasoning_level': reasoning_level
            }),
        }

    except Exception as e:
        logger.error(f"❌ Error en función: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Error interno del servidor',
                'details': str(e) if os.environ.get('NODE_ENV') == 'development' else None,
            }),
        } 