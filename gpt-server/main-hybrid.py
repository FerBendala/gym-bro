from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import requests
import json
import re

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPT Training Assistant (Hybrid)", version="1.0.0")

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
MODEL_NAME = "mistral:7b"

# Respuestas rápidas para preguntas comunes
QUICK_RESPONSES = {
    "press banca": """Para mejorar tu press de banca:

🏋️ TÉCNICA:
• Acuéstate con espalda arqueada y pies firmes
• Agarra la barra ligeramente más ancha que hombros
• Baja controladamente hasta el pecho
• Empuja hacia arriba manteniendo posición

📈 PROGRESIÓN:
• Aumenta 2.5-5kg por semana
• 3 series de 8-12 repeticiones

💪 EJERCICIOS AUXILIARES:
• Press inclinado, fondos, press hombro
• Flexiones, press francés

💡 CONSEJOS:
• Enfócate en técnica antes que peso
• Respira correctamente (exhala al empujar)
• Mantén core activo durante movimiento
• Descansa 2-3 minutos entre series""",

    "sentadilla": """Para mejorar tus sentadillas:

🏋️ TÉCNICA:
• Pies separados al ancho de hombros
• Mantén pecho alto y espalda recta
• Empuja rodillas hacia afuera
• Baja hasta muslos paralelos al suelo

📈 PROGRESIÓN:
• Aumenta 5-10kg por semana
• 3 series de 8-12 repeticiones

💪 EJERCICIOS AUXILIARES:
• Sentadilla frontal, búlgara
• Extensiones de pierna, zancadas

💡 CONSEJOS:
• Mantén peso en los talones
• No dejes rodillas doblarse hacia adentro
• Respira profundamente en posición baja
• Incluye variaciones para desarrollo completo""",

    "peso muerto": """Para mejorar tu peso muerto:

🏋️ TÉCNICA:
• Barra cerca de las espinillas
• Espalda recta y pecho alto
• Empuja el suelo con los pies
• Mantén barra cerca del cuerpo

📈 PROGRESIÓN:
• Aumenta 5-10kg por semana
• 3 series de 5-8 repeticiones

💪 EJERCICIOS AUXILIARES:
• Peso muerto rumano, buenos días
• Hiperextensiones, puente de glúteos

💡 CONSEJOS:
• Nunca redondees la espalda
• Mantén barra cerca del cuerpo
• Empuja con piernas, no tires con espalda
• Calienta bien antes de cargar peso""",

    "proteína": """Para nutrición óptima:

🥩 PROTEÍNA:
• 1.6-2.2g por kg de peso corporal
• Distribuye en 4-6 comidas

🍞 CARBOHIDRATOS:
• 3-7g por kg de peso corporal
• Principal fuente de energía

🥑 GRASAS:
• 0.8-1.2g por kg de peso corporal
• Esenciales para hormonas

💧 HIDRATACIÓN:
• 2-3L de agua al día
• Más durante entrenamiento

⏰ TIMING:
• Come 1-2 horas antes del entrenamiento
• Consume proteína dentro de 30 min post-entrenamiento
• Incluye carbohidratos para recuperación""",

    "meseta": """Para superar una meseta:

🔄 VARIACIÓN:
• Cambia rutina cada 4-6 semanas
• Añade ejercicios nuevos
• Varía repeticiones y series

📈 INTENSIDAD:
• Aumenta peso gradualmente
• Incluye series de alta intensidad
• Considera periodización

💪 VOLUMEN:
• Aumenta series o repeticiones
• Añade días de entrenamiento
• Incluye ejercicios auxiliares

🛌 RECUPERACIÓN:
• Revisa descanso (7-9h sueño)
• Considera deload semanal
• Optimiza nutrición

🎯 MENTALIDAD:
• Mantén diario de entrenamiento
• Establece metas específicas
• Celebra pequeños progresos""",

    "cardio": """Para cardio efectivo:

⏰ TIMING:
• Haz cardio DESPUÉS de pesas
• 20-30 minutos 3-4 veces por semana
• Intensidad moderada (70-80% FC máx)

🔥 TIPOS:
• HIIT: 20-30s alta intensidad, 1-2 min descanso
• LISS: 30-45 minutos ritmo constante
• Circuitos: Combinar cardio y fuerza

🎯 OBJETIVOS:
• Pérdida de grasa: HIIT + LISS
• Resistencia: LISS principalmente
• Rendimiento: HIIT específico

💡 CONSEJOS:
• Adapta según objetivos
• No exageres (puede afectar ganancias)
• Hidrátate bien durante cardio""",

    "descanso": """Para recuperación óptima:

😴 SUEÑO:
• 7-9 horas por noche
• Esencial para crecimiento muscular

🛌 DÍAS DE DESCANSO:
• 48-72h entre grupos musculares
• Permite reparación muscular

🧘 ESTRÉS:
• Minimiza estrés mental
• Incluye actividades relajantes
• Considera meditación

💆 MOVILIDAD:
• 10-15 minutos después del entrenamiento
• Mejora flexibilidad y recuperación

🔄 DELOAD:
• Semana de descarga cada 4-6 semanas
• Reduce volumen 50-70%
• Mantén intensidad moderada

💧 HIDRATACIÓN:
• 2-3L de agua al día
• Más durante entrenamientos intensos
• Considera electrolitos""",

    "técnica": """Para mejorar tu técnica:

🎯 FUNDAMENTOS:
• Comienza con pesos ligeros
• Enfócate en mente-músculo
• Respira correctamente (exhala en esfuerzo)

📹 ANÁLISIS:
• Graba series para revisar
• Compara con videos de referencia
• Busca feedback de entrenadores

🧠 CONCENTRACIÓN:
• Elimina distracciones
• Visualiza movimiento
• Mantén core activo

📚 EDUCACIÓN:
• Estudia biomecánica
• Aprende de expertos
• Practica movimientos sin peso

⏰ PROGRESIÓN:
• Domina técnica antes de aumentar peso
• Añade peso gradualmente
• Revisa técnica regularmente""",

    "suplementos": """Para suplementación efectiva:

🥛 PROTEÍNA EN POLVO:
• 20-30g post-entrenamiento
• Whey para recuperación rápida
• Caseína para recuperación lenta

💊 CREATINA:
• 5g diarios (monohidrato)
• Mejora fuerza y potencia
• No necesita carga

🧠 BCAA:
• Durante entrenamientos largos
• Ayuda con fatiga muscular
• Preserva masa muscular

🩸 VITAMINA D:
• 2000-4000 UI diarias
• Esencial para hormonas
• Mejora recuperación

💪 PRE-ENTRENO:
• Solo si es necesario
• Contiene cafeína y creatina
• No usar todos los días

💡 CONSEJOS:
• Prioriza nutrición real
• Consulta con profesional
• No exageres con suplementos""",

    "lesiones": """Para prevenir y tratar lesiones:

🛡️ PREVENCIÓN:
• Calienta 10-15 minutos
• Estira después del entrenamiento
• Progresa gradualmente

💪 FORTALECIMIENTO:
• Trabaja músculos estabilizadores
• Incluye ejercicios de equilibrio
• Fortalece core y glúteos

🩹 LESIONES COMUNES:
• Rodilla: Fortalece cuádriceps
• Espalda: Mejora técnica
• Hombro: Estira y fortalece

⏰ RECUPERACIÓN:
• Descansa lesiones agudas
• Usa hielo para inflamación
• Consulta fisioterapeuta

💡 CONSEJOS:
• Escucha tu cuerpo
• No ignores el dolor
• Regresa gradualmente al entrenamiento""",

    "motivación": """Para mantener la motivación:

🎯 METAS CLARAS:
• Establece objetivos específicos
• Divide en metas pequeñas
• Celebra cada logro

📊 SEGUIMIENTO:
• Lleva diario de entrenamiento
• Toma fotos de progreso
• Mide resultados regularmente

👥 COMUNIDAD:
• Entrena con amigos
• Únete a grupos de fitness
• Comparte tus logros

🧠 MENTALIDAD:
• Enfócate en el proceso
• Acepta altibajos
• Visualiza tu versión mejor

💡 CONSEJOS:
• Crea rutinas consistentes
• Varía tus entrenamientos
• Recuerda por qué empezaste"""
}

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

def get_quick_response(message: str) -> str:
    """Obtener respuesta rápida para preguntas comunes"""
    message_lower = message.lower()
    
    # Palabras clave para cada categoría
    keywords = {
        "press banca": ["press", "banca", "pecho", "bench"],
        "sentadilla": ["sentadilla", "squat", "pierna", "leg"],
        "peso muerto": ["peso muerto", "deadlift", "muerto"],
        "proteína": ["proteína", "proteina", "nutrición", "nutricion", "comida", "alimentación"],
        "meseta": ["meseta", "estancado", "progreso", "avance"],
        "cardio": ["cardio", "aeróbico", "aerobico", "correr", "bicicleta"],
        "descanso": ["descanso", "recuperación", "recuperacion", "dormir", "sueño"],
        "técnica": ["técnica", "tecnica", "forma", "ejecución", "ejecucion"],
        "suplementos": ["suplementos", "suplemento", "proteína en polvo", "creatina", "bcaa", "vitamina"],
        "lesiones": ["lesión", "lesion", "dolor", "injury", "rehabilitación", "rehabilitacion"],
        "motivación": ["motivación", "motivacion", "motivado", "motivada", "ánimo", "animo", "inspiración"]
    }
    
    for category, keyword_list in keywords.items():
        for keyword in keyword_list:
            if keyword in message_lower:
                return QUICK_RESPONSES[category]
    
    return None

@app.get("/")
async def root():
    return {"message": "GPT Training Assistant API (Hybrid)", "status": "running"}

@app.get("/health")
async def health_check():
    ollama_available = check_ollama_available()
    return {
        "status": "healthy" if ollama_available else "unhealthy",
        "model_loaded": ollama_available,
        "mode": "hybrid",
        "model": MODEL_NAME
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal para chat con el modelo"""
    try:
        logger.info(f"Procesando mensaje: {request.message}")
        
        # Intentar obtener respuesta rápida
        quick_response = get_quick_response(request.message)
        
        if quick_response:
            logger.info("Usando respuesta rápida")
            return ChatResponse(response=quick_response)
        
        # Si no hay respuesta rápida, usar el modelo
        logger.info("Usando modelo IA")
        
        # Construir prompt con contexto de entrenamiento
        if request.context:
            enhanced_prompt = f"""
Contexto de entrenamiento: {request.context}

Pregunta: {request.message}

Como experto en fitness, responde brevemente:
"""
        else:
            enhanced_prompt = f"""
Como experto en fitness y entrenamiento, responde SOLO EN ESPAÑOL de manera breve y práctica: {request.message}

Da 3-5 consejos específicos y útiles. Responde únicamente en español.
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
Analiza estos datos de entrenamiento y proporciona insights útiles EN ESPAÑOL:

{request.message}

Como experto en entrenamiento físico, proporciona EN ESPAÑOL:
1. Análisis detallado del progreso
2. Identificación de patrones y tendencias
3. Recomendaciones específicas para mejorar
4. Posibles ajustes en la rutina
5. Consejos para optimizar el rendimiento

Sé específico y proporciona consejos prácticos. Responde únicamente en español.
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
    print("🚀 Iniciando servidor híbrido en http://localhost:8001")
    print(f"🧠 Usando modelo: {MODEL_NAME}")
    print("⚡ Respuestas rápidas para preguntas comunes")
    print("🤖 Modelo IA para preguntas complejas")
    uvicorn.run(app, host="0.0.0.0", port=8003, reload=False) 