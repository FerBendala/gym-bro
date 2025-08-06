from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import requests
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPT Training Assistant (Ollama)", version="1.0.0")

# Configurar CORS para permitir conexiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Modelo de datos
class ChatRequest(BaseModel):
    message: str
    reasoning_level: str = "medium"
    context: str = ""

class ChatResponse(BaseModel):
    response: str
    error: str = None

# Configuración de Ollama
OLLAMA_URL = "http://localhost:11434"
MODEL_NAME = "mistral:7b"  # Modelo más rápido

def check_ollama_available():
    """Verificar si Ollama está disponible"""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags")
        return response.status_code == 200
    except:
        return False

def generate_response_with_ollama(prompt: str) -> str:
    """Generar respuesta usando Ollama"""
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 150
            }
        }
        
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "No se pudo generar una respuesta")
        else:
            logger.error(f"Error en Ollama: {response.status_code} - {response.text}")
            return "Error al generar respuesta"
            
    except Exception as e:
        logger.error(f"Error comunicándose con Ollama: {e}")
        return f"Error de conexión: {str(e)}"

@app.get("/")
async def root():
    return {"message": "GPT Training Assistant API (Ollama)", "status": "running"}

@app.get("/health")
async def health_check():
    ollama_available = check_ollama_available()
    return {
        "status": "healthy" if ollama_available else "unhealthy",
        "model_loaded": ollama_available,
        "mode": "ollama",
        "model": MODEL_NAME
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal para chat con el modelo"""
    try:
        # Construir prompt con contexto de entrenamiento
        if request.context:
            enhanced_prompt = f"""
Contexto de entrenamiento: {request.context}

Pregunta: {request.message}

Como experto en entrenamiento físico y fitness, responde esta pregunta de manera detallada y útil:
"""
        else:
            enhanced_prompt = f"""
Como experto en fitness, responde brevemente: {request.message}

Da 3-5 consejos prácticos y específicos.
"""

        logger.info(f"Procesando mensaje: {request.message}")
        
        # Generar respuesta usando Ollama
        response = generate_response_with_ollama(enhanced_prompt)
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")
        return ChatResponse(response="", error=str(e))

@app.post("/analyze-training", response_model=ChatResponse)
async def analyze_training_data(request: ChatRequest):
    """Endpoint específico para análisis de datos de entrenamiento"""
    try:
        analysis_prompt = f"""
Analiza estos datos de entrenamiento y proporciona insights útiles:

{request.message}

Como experto en entrenamiento físico, proporciona:
1. Análisis detallado del progreso
2. Identificación de patrones y tendencias
3. Recomendaciones específicas para mejorar
4. Posibles ajustes en la rutina
5. Consejos para optimizar el rendimiento

Sé específico y proporciona consejos prácticos.
"""

        logger.info(f"Analizando datos de entrenamiento")
        
        # Generar análisis usando Ollama
        response = generate_response_with_ollama(analysis_prompt)
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error analizando datos: {e}")
        return ChatResponse(response="", error=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor con Ollama en http://localhost:8001")
    print(f"🧠 Usando modelo: {MODEL_NAME}")
    print("📋 Asegúrate de tener Ollama instalado y ejecutándose")
    print("💡 Para instalar Ollama: https://ollama.ai")
    print("💡 Para descargar el modelo: ollama pull llama2")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False) 