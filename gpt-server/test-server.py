from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPT-OSS Training Assistant (Test)", version="1.0.0")

# Configurar CORS para permitir conexiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  # Permitir todos los orígenes en desarrollo
    ],
    allow_credentials=False,  # Cambiar a False para evitar problemas
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Modelo de datos
class ChatRequest(BaseModel):
    message: str
    reasoning_level: str = "medium"  # low, medium, high
    context: str = ""  # Datos de entrenamiento adicionales

class ChatResponse(BaseModel):
    response: str
    error: str = None

@app.get("/")
async def root():
    return {"message": "GPT-OSS Training Assistant API (Test Mode)", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True, "mode": "test"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal para chat con el modelo (modo prueba)"""
    try:
        # Respuestas predefinidas para modo prueba
        responses = {
            "¿Cómo mejorar mi press de banca?": "Para mejorar tu press de banca, enfócate en: 1) Técnica correcta con espalda arqueada y pies firmes, 2) Progresión gradual de peso, 3) Ejercicios auxiliares como press inclinado y fondos, 4) Descanso adecuado entre series.",
            "¿Cuánta proteína necesito?": "Como regla general, necesitas 1.6-2.2g de proteína por kg de peso corporal al día. Para un atleta de 70kg, esto significa 112-154g de proteína diarios. Distribuye la ingesta en 4-6 comidas.",
            "¿Cómo superar una meseta?": "Para superar una meseta: 1) Varía tu rutina cada 4-6 semanas, 2) Aumenta la intensidad o volumen gradualmente, 3) Añade ejercicios nuevos, 4) Revisa tu nutrición y descanso, 5) Considera periodización.",
            "¿Cardio antes o después de pesas?": "Es mejor hacer cardio DESPUÉS de las pesas. El orden ideal es: 1) Calentamiento dinámico, 2) Entrenamiento de fuerza, 3) Cardio (opcional). Esto preserva tu energía para el entrenamiento de fuerza."
        }
        
        # Buscar respuesta predefinida o generar una inteligente
        if request.message in responses:
            response = responses[request.message]
        else:
            # Generar respuesta inteligente basada en palabras clave
            message_lower = request.message.lower()
            
            if any(word in message_lower for word in ['press', 'banca', 'pecho']):
                response = "Para mejorar tu press de banca: 1) Enfócate en la técnica con espalda arqueada y pies firmes, 2) Progresión gradual de peso, 3) Ejercicios auxiliares como press inclinado y fondos, 4) Descanso adecuado entre series."
            elif any(word in message_lower for word in ['sentadilla', 'squat', 'pierna']):
                response = "Para mejorar tus sentadillas: 1) Mantén el pecho alto y la espalda recta, 2) Empuja las rodillas hacia afuera, 3) Baja hasta que los muslos estén paralelos al suelo, 4) Incluye variaciones como sentadilla frontal y búlgara."
            elif any(word in message_lower for word in ['peso muerto', 'deadlift']):
                response = "Para mejorar tu peso muerto: 1) Posición inicial con barra cerca de las espinillas, 2) Espalda recta y pecho alto, 3) Empuja el suelo con los pies, 4) Mantén la barra cerca del cuerpo durante todo el movimiento."
            elif any(word in message_lower for word in ['proteína', 'nutrición', 'comida']):
                response = "Para nutrición: 1) Consume 1.6-2.2g de proteína por kg de peso corporal, 2) Distribuye en 4-6 comidas, 3) Incluye carbohidratos complejos, 4) Hidrátate bien (2-3L de agua al día), 5) Come 1-2 horas antes del entrenamiento."
            elif any(word in message_lower for word in ['meseta', 'estancado', 'progreso']):
                response = "Para superar una meseta: 1) Varía tu rutina cada 4-6 semanas, 2) Aumenta intensidad o volumen gradualmente, 3) Añade ejercicios nuevos, 4) Revisa nutrición y descanso, 5) Considera periodización y deload."
            elif any(word in message_lower for word in ['cardio', 'aeróbico']):
                response = "Para cardio: 1) Hazlo DESPUÉS de las pesas, 2) 20-30 minutos 3-4 veces por semana, 3) Intensidad moderada (70-80% FC máx), 4) Incluye HIIT 1-2 veces por semana, 5) Adapta según tus objetivos."
            elif any(word in message_lower for word in ['descanso', 'recuperación']):
                response = "Para recuperación: 1) Duerme 7-9 horas por noche, 2) Descansa 48-72h entre grupos musculares, 3) Incluye días de descanso activo, 4) Estira y haz movilidad, 5) Considera masajes y foam rolling."
            elif any(word in message_lower for word in ['técnica', 'forma']):
                response = "Para mejorar tu técnica: 1) Comienza con pesos ligeros, 2) Graba tus series para revisar, 3) Enfócate en la mente-músculo, 4) Respira correctamente (exhala en el esfuerzo), 5) Mantén el core activo."
            else:
                response = f"Entiendo tu pregunta sobre '{request.message}'. Como asistente de entrenamiento, te recomiendo: 1) Mantener consistencia en tu rutina, 2) Progresión gradual, 3) Técnica correcta, 4) Nutrición adecuada, 5) Descanso suficiente. ¿Hay algo específico sobre lo que quieras profundizar?"
        
        logger.info(f"Procesando mensaje: {request.message}")
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")
        return ChatResponse(response="", error=str(e))

@app.post("/analyze-training", response_model=ChatResponse)
async def analyze_training_data(request: ChatRequest):
    """Endpoint específico para análisis de datos de entrenamiento (modo prueba)"""
    try:
        analysis = f"""
Análisis de prueba de tus datos de entrenamiento:

📊 RESUMEN:
- Datos recibidos: {len(request.message)} caracteres
- Nivel de análisis: {request.reasoning_level}

💡 RECOMENDACIONES:
1. Continúa con tu progreso actual
2. Mantén consistencia en tu rutina
3. Asegúrate de descansar adecuadamente
4. Hidrátate bien durante el entrenamiento

🎯 PRÓXIMOS PASOS:
- Revisa tu técnica regularmente
- Ajusta la intensidad según tu progreso
- Considera variar ejercicios cada 4-6 semanas

Este es un análisis de prueba. En modo completo, el modelo IA analizaría tus datos específicos.
"""
        
        return ChatResponse(response=analysis)
        
    except Exception as e:
        logger.error(f"Error analizando datos: {e}")
        return ChatResponse(response="", error=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor de prueba en http://localhost:8001")
    print("📝 Este es un modo de prueba sin el modelo GPT-OSS completo")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False) 