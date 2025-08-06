from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import pipeline
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPT-OSS Training Assistant", version="1.0.0")

# Configurar CORS para permitir conexiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de datos
class ChatRequest(BaseModel):
    message: str
    reasoning_level: str = "medium"  # low, medium, high
    context: str = ""  # Datos de entrenamiento adicionales

class ChatResponse(BaseModel):
    response: str
    error: str = None

# Variable global para el pipeline
pipe = None

@app.on_event("startup")
async def startup_event():
    """Inicializar el modelo al arrancar el servidor"""
    global pipe
    try:
        logger.info("Cargando modelo GPT-OSS-120B...")
        
        # Usar modelo local si existe, sino descargar
        model_id = "openai/gpt-oss-120b"
        
        pipe = pipeline(
            "text-generation",
            model=model_id,
            torch_dtype="auto",
            device_map="auto",
        )
        
        logger.info("Modelo cargado exitosamente!")
    except Exception as e:
        logger.error(f"Error cargando modelo: {e}")
        raise e

@app.get("/")
async def root():
    return {"message": "GPT-OSS Training Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": pipe is not None}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal para chat con el modelo"""
    if pipe is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    try:
        # Construir prompt con contexto de entrenamiento
        if request.context:
            enhanced_message = f"""
Contexto de entrenamiento: {request.context}

Pregunta: {request.message}

Responde como un experto en entrenamiento físico y fitness:
"""
        else:
            enhanced_message = f"""
Como experto en entrenamiento físico y fitness, responde esta pregunta: {request.message}
"""

        messages = [
            {"role": "user", "content": enhanced_message}
        ]
        
        logger.info(f"Procesando mensaje con nivel de razonamiento: {request.reasoning_level}")
        
        outputs = pipe(
            messages,
            max_new_tokens=512,  # Más tokens para respuestas detalladas
            temperature=0.7,
            do_sample=True,
        )
        
        response = outputs[0]["generated_text"][-1]
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")
        return ChatResponse(response="", error=str(e))

@app.post("/analyze-training", response_model=ChatResponse)
async def analyze_training_data(request: ChatRequest):
    """Endpoint específico para análisis de datos de entrenamiento"""
    if pipe is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    try:
        analysis_prompt = f"""
Analiza estos datos de entrenamiento y proporciona insights útiles:

{request.message}

Proporciona:
1. Análisis de progreso
2. Identificación de patrones
3. Recomendaciones específicas
4. Posibles mejoras
"""
        
        messages = [
            {"role": "user", "content": analysis_prompt}
        ]
        
        outputs = pipe(
            messages,
            max_new_tokens=768,  # Más tokens para análisis detallado
            temperature=0.5,
            do_sample=True,
        )
        
        response = outputs[0]["generated_text"][-1]
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error analizando datos: {e}")
        return ChatResponse(response="", error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False) 