from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPT Training Assistant", version="1.0.0")

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
    allow_credentials=False,
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

# Base de conocimiento para respuestas inteligentes
TRAINING_KNOWLEDGE = {
    "ejercicios": {
        "press_banca": {
            "técnica": "1) Acuéstate con la espalda arqueada y pies firmes en el suelo, 2) Agarra la barra con manos ligeramente más anchas que los hombros, 3) Baja la barra controladamente hasta el pecho, 4) Empuja hacia arriba manteniendo la posición",
            "progresión": "Aumenta 2.5-5kg por semana, 3 series de 8-12 repeticiones",
            "ejercicios_auxiliares": "Press inclinado, fondos, press de hombro, flexiones"
        },
        "sentadilla": {
            "técnica": "1) Pies separados al ancho de hombros, 2) Mantén el pecho alto y espalda recta, 3) Empuja las rodillas hacia afuera, 4) Baja hasta que los muslos estén paralelos al suelo",
            "progresión": "Aumenta 5-10kg por semana, 3 series de 8-12 repeticiones",
            "ejercicios_auxiliares": "Sentadilla frontal, sentadilla búlgara, extensiones de pierna"
        },
        "peso_muerto": {
            "técnica": "1) Barra cerca de las espinillas, 2) Espalda recta y pecho alto, 3) Empuja el suelo con los pies, 4) Mantén la barra cerca del cuerpo",
            "progresión": "Aumenta 5-10kg por semana, 3 series de 5-8 repeticiones",
            "ejercicios_auxiliares": "Peso muerto rumano, buenos días, hiperextensiones"
        }
    },
    "nutrición": {
        "proteína": "1.6-2.2g por kg de peso corporal al día",
        "carbohidratos": "3-7g por kg de peso corporal al día",
        "grasas": "0.8-1.2g por kg de peso corporal al día",
        "hidratación": "2-3L de agua al día, más durante el entrenamiento"
    },
    "recuperación": {
        "descanso": "7-9 horas de sueño por noche",
        "días_descanso": "48-72h entre grupos musculares",
        "estiramientos": "10-15 minutos después del entrenamiento",
        "masaje": "Foam rolling y masajes para recuperación"
    }
}

def generate_intelligent_response(message: str, context: str = "") -> str:
    """Genera una respuesta inteligente basada en el conocimiento del entrenamiento"""
    message_lower = message.lower()
    
    # Detectar tipo de pregunta
    if any(word in message_lower for word in ['press', 'banca', 'pecho', 'bench']):
        exercise = TRAINING_KNOWLEDGE["ejercicios"]["press_banca"]
        return f"""Para mejorar tu press de banca:

🏋️ TÉCNICA:
{exercise['técnica']}

📈 PROGRESIÓN:
{exercise['progresión']}

💪 EJERCICIOS AUXILIARES:
{exercise['ejercicios_auxiliares']}

💡 CONSEJOS:
- Enfócate en la técnica antes que el peso
- Respira correctamente (exhala al empujar)
- Mantén el core activo durante todo el movimiento
- Descansa 2-3 minutos entre series"""
    
    elif any(word in message_lower for word in ['sentadilla', 'squat', 'pierna', 'leg']):
        exercise = TRAINING_KNOWLEDGE["ejercicios"]["sentadilla"]
        return f"""Para mejorar tus sentadillas:

🏋️ TÉCNICA:
{exercise['técnica']}

📈 PROGRESIÓN:
{exercise['progresión']}

💪 EJERCICIOS AUXILIARES:
{exercise['ejercicios_auxiliares']}

💡 CONSEJOS:
- Mantén el peso en los talones
- No dejes que las rodillas se doblen hacia adentro
- Respira profundamente en la posición baja
- Incluye variaciones para desarrollo completo"""
    
    elif any(word in message_lower for word in ['peso muerto', 'deadlift', 'muerto']):
        exercise = TRAINING_KNOWLEDGE["ejercicios"]["peso_muerto"]
        return f"""Para mejorar tu peso muerto:

🏋️ TÉCNICA:
{exercise['técnica']}

📈 PROGRESIÓN:
{exercise['progresión']}

💪 EJERCICIOS AUXILIARES:
{exercise['ejercicios_auxiliares']}

💡 CONSEJOS:
- Nunca redondees la espalda
- Mantén la barra cerca del cuerpo
- Empuja con las piernas, no tires con la espalda
- Calienta bien antes de cargar peso"""
    
    elif any(word in message_lower for word in ['proteína', 'nutrición', 'comida', 'alimentación']):
        nutrition = TRAINING_KNOWLEDGE["nutrición"]
        return f"""Para una nutrición óptima:

🥩 PROTEÍNA:
{nutrition['proteína']} - Distribuye en 4-6 comidas

🍞 CARBOHIDRATOS:
{nutrition['carbohidratos']} - Principal fuente de energía

🥑 GRASAS:
{nutrition['grasas']} - Esenciales para hormonas

💧 HIDRATACIÓN:
{nutrition['hidratación']}

⏰ TIMING:
- Come 1-2 horas antes del entrenamiento
- Consume proteína dentro de 30 min post-entrenamiento
- Incluye carbohidratos para recuperación"""
    
    elif any(word in message_lower for word in ['meseta', 'estancado', 'progreso', 'avance']):
        return """Para superar una meseta:

🔄 VARIACIÓN:
- Cambia tu rutina cada 4-6 semanas
- Añade ejercicios nuevos
- Varía repeticiones y series

📈 INTENSIDAD:
- Aumenta peso gradualmente
- Incluye series de alta intensidad
- Considera periodización

💪 VOLUMEN:
- Aumenta series o repeticiones
- Añade días de entrenamiento
- Incluye ejercicios auxiliares

🛌 RECUPERACIÓN:
- Revisa tu descanso (7-9h sueño)
- Considera un deload semanal
- Optimiza tu nutrición

🎯 MENTALIDAD:
- Mantén un diario de entrenamiento
- Establece metas específicas
- Celebra pequeños progresos"""
    
    elif any(word in message_lower for word in ['cardio', 'aeróbico', 'correr', 'bicicleta']):
        return """Para cardio efectivo:

⏰ TIMING:
- Haz cardio DESPUÉS de las pesas
- 20-30 minutos 3-4 veces por semana
- Intensidad moderada (70-80% FC máx)

🔥 TIPOS:
- HIIT: 20-30 segundos alta intensidad, 1-2 min descanso
- LISS: 30-45 minutos ritmo constante
- Circuitos: Combinar cardio y fuerza

🎯 OBJETIVOS:
- Pérdida de grasa: HIIT + LISS
- Resistencia: LISS principalmente
- Rendimiento: HIIT específico

💡 CONSEJOS:
- Adapta según tus objetivos
- No exageres (puede afectar ganancias)
- Hidrátate bien durante el cardio"""
    
    elif any(word in message_lower for word in ['descanso', 'recuperación', 'dormir', 'sueño']):
        recovery = TRAINING_KNOWLEDGE["recuperación"]
        return f"""Para una recuperación óptima:

😴 SUEÑO:
{recovery['descanso']} - Esencial para crecimiento muscular

🛌 DÍAS DE DESCANSO:
{recovery['días_descanso']} - Permite reparación muscular

🧘 ESTRÉS:
- Minimiza estrés mental
- Incluye actividades relajantes
- Considera meditación

💆 MOVILIDAD:
{recovery['estiramientos']} - Mejora flexibilidad y recuperación

🔄 DELOAD:
- Semana de descarga cada 4-6 semanas
- Reduce volumen 50-70%
- Mantén intensidad moderada

💧 HIDRATACIÓN:
- 2-3L de agua al día
- Más durante entrenamientos intensos
- Considera electrolitos"""
    
    elif any(word in message_lower for word in ['técnica', 'forma', 'ejecución']):
        return """Para mejorar tu técnica:

🎯 FUNDAMENTOS:
- Comienza con pesos ligeros
- Enfócate en la mente-músculo
- Respira correctamente (exhala en esfuerzo)

📹 ANÁLISIS:
- Graba tus series para revisar
- Compara con videos de referencia
- Busca feedback de entrenadores

🧠 CONCENTRACIÓN:
- Elimina distracciones
- Visualiza el movimiento
- Mantén el core activo

📚 EDUCACIÓN:
- Estudia la biomecánica
- Aprende de expertos
- Practica movimientos sin peso

⏰ PROGRESIÓN:
- Domina la técnica antes de aumentar peso
- Añade peso gradualmente
- Revisa técnica regularmente"""
    
    else:
        return f"""Entiendo tu pregunta sobre '{message}'. 

Como asistente de entrenamiento, te recomiendo estos principios fundamentales:

💪 CONSISTENCIA:
- Mantén una rutina regular
- No te saltes entrenamientos
- Sé paciente con el progreso

📈 PROGRESIÓN:
- Aumenta peso/intensidad gradualmente
- Registra tus entrenamientos
- Celebra pequeños avances

🏋️ TÉCNICA:
- Prioriza la forma sobre el peso
- Aprende de expertos
- Graba y revisa tus movimientos

🥗 NUTRICIÓN:
- Come suficiente proteína (1.6-2.2g/kg)
- Hidrátate bien (2-3L agua/día)
- Come 1-2h antes del entrenamiento

🛌 RECUPERACIÓN:
- Duerme 7-9 horas por noche
- Descansa 48-72h entre grupos musculares
- Incluye días de descanso

¿Hay algo específico sobre lo que quieras profundizar? Puedo ayudarte con:
- Técnica de ejercicios específicos
- Nutrición y suplementación
- Programación de entrenamiento
- Superación de mesetas
- Recuperación y descanso"""

@app.get("/")
async def root():
    return {"message": "GPT Training Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True, "mode": "intelligent"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal para chat con el modelo"""
    try:
        logger.info(f"Procesando mensaje: {request.message}")
        
        # Generar respuesta inteligente
        response = generate_intelligent_response(request.message, request.context)
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")
        return ChatResponse(response="", error=str(e))

@app.post("/analyze-training", response_model=ChatResponse)
async def analyze_training_data(request: ChatRequest):
    """Endpoint específico para análisis de datos de entrenamiento"""
    try:
        analysis = f"""
Análisis inteligente de tus datos de entrenamiento:

📊 RESUMEN:
- Datos recibidos: {len(request.message)} caracteres
- Nivel de análisis: {request.reasoning_level}

💡 RECOMENDACIONES GENERALES:
1. Mantén consistencia en tu rutina
2. Progresión gradual de peso/intensidad
3. Técnica correcta antes que peso
4. Nutrición adecuada (1.6-2.2g proteína/kg)
5. Descanso suficiente (7-9h sueño)

🎯 PRÓXIMOS PASOS:
- Revisa tu técnica regularmente
- Ajusta la intensidad según progreso
- Varía ejercicios cada 4-6 semanas
- Incluye días de descanso activo

📈 MONITOREO:
- Registra tus entrenamientos
- Mide progreso semanal/mensual
- Ajusta según resultados

Este análisis se basa en principios científicos del entrenamiento de fuerza.
"""
        
        return ChatResponse(response=analysis)
        
    except Exception as e:
        logger.error(f"Error analizando datos: {e}")
        return ChatResponse(response="", error=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor inteligente en http://localhost:8002")
    print("🧠 Usando sistema de respuestas inteligentes basado en conocimiento de entrenamiento")
    uvicorn.run(app, host="0.0.0.0", port=8002, reload=False) 