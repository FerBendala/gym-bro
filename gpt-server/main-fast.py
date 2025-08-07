from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import requests
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPT Training Assistant (Fast)", version="1.0.0")

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
MODEL_NAME = "gpt-oss:20b"

def check_ollama_available():
    """Verificar si Ollama está disponible"""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags")
        return response.status_code == 200
    except:
        return False

def generate_response_with_ollama(prompt: str) -> str:
    """Generar respuesta usando Ollama optimizada para velocidad"""
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 1024,  # Optimizado para GPT-OSS-20B
                "top_k": 40,
                "repeat_penalty": 1.1,
                "mirostat": 2,
                "mirostat_tau": 5.0,
                "mirostat_eta": 0.1
            }
        }
        
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=60)
        
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
    return {"message": "GPT Training Assistant API (Fast)", "status": "running"}

@app.get("/health")
async def health_check():
    ollama_available = check_ollama_available()
    return {
        "status": "healthy" if ollama_available else "unhealthy",
        "model_loaded": ollama_available,
        "mode": "fast_ai",
        "model": MODEL_NAME
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal para chat con el modelo optimizado"""
    try:
        logger.info(f"Procesando mensaje: {request.message}")
        logger.info(f"Contexto recibido: {request.context[:200] if request.context else 'Sin contexto'}...")
        
        reasoning_level = request.reasoning_level

        # Prompt optimizado para respuestas completas y en español
        if request.context:
            enhanced_prompt = f"""
[INST] Eres un entrenador personal experto llamado "GymBro" que conoce perfectamente el entrenamiento de tu cliente. Tienes acceso a todos sus datos de entrenamiento, ejercicios, y progreso.

Reasoning: {reasoning_level}

CONTEXTO DEL USUARIO:
{request.context}

PREGUNTA: {request.message}

IMPORTANTE: 
- Actúa como su entrenador personal que conoce cada detalle de su rutina
- Usa SIEMPRE los datos reales del contexto para responder
- Si pregunta "qué ejercicios he hecho hoy", responde SOLO con los entrenamientos REALES de hoy
- Si no hay entrenamientos hoy, di claramente "No has hecho entrenamientos hoy"
- Si hay entrenamientos, lista específicamente cada ejercicio con peso, reps y sets
- Habla en segunda persona ("has hecho", "tu entrenamiento", "tu progreso")
- Sé específico con los datos: pesos, repeticiones, series, fechas
- NO inventes ejercicios que no están en los datos
- NO mezcles ejercicios programados con ejercicios realizados
- Proporciona análisis detallado y recomendaciones personalizadas
- Usa el reasoning level para ajustar la profundidad de tu respuesta

Responde únicamente en español y asegúrate de completar todas las ideas. Termina tu respuesta con un punto final. [/INST]
"""
        else:
            enhanced_prompt = f"""
[INST] Eres un entrenador personal experto llamado "GymBro". Responde SOLO EN ESPAÑOL de manera clara y directa.

Reasoning: {reasoning_level}

PREGUNTA: {request.message}

IMPORTANTE:
- Actúa como un entrenador personal profesional
- Habla en segunda persona ("tu entrenamiento", "tu progreso")
- Sé específico y práctico
- NO inventes datos que no tienes
- Si no tienes información específica, dilo claramente
- Usa el reasoning level para ajustar la profundidad de tu respuesta

Responde únicamente en español y asegúrate de completar todas las ideas. Termina tu respuesta con un punto final. [/INST]
"""

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
[INST] Eres un experto en entrenamiento físico. Analiza estos datos y proporciona insights útiles EN ESPAÑOL:

{request.message}

Proporciona EN ESPAÑOL:
1. Análisis del progreso
2. Patrones identificados
3. Recomendaciones específicas
4. Ajustes sugeridos
5. Consejos de optimización

Sé específico y práctico. Responde únicamente en español. [/INST]
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
    print("�� Iniciando servidor GPT-OSS en http://localhost:8004")
    print(f"🧠 Usando modelo: {MODEL_NAME}")
    print("⚡ Optimizado para respuestas inteligentes y reasoning")
    print("🇪🇸 Todas las respuestas en español")
    print("🎯 Reasoning levels: low, medium, high")
    uvicorn.run(app, host="0.0.0.0", port=8004, reload=False) 