// Script para debuggear Firebase directamente
const https = require('https');

// Configuración de Firebase (reemplaza con tus valores reales)
const PROJECT_ID = 'follow-gym-12345'; // Reemplaza con tu project ID
const API_KEY = 'tu-api-key'; // Reemplaza con tu API key

// Función para hacer request a Firebase
function firebaseRequest(collection) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?key=${API_KEY}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Función principal
async function debugFirebase() {
  console.log('🔍 Debuggeando Firebase...\n');

  try {
    // Obtener ejercicios
    console.log('📊 EJERCICIOS:');
    const exercises = await firebaseRequest('exercises');
    console.log(`Total ejercicios: ${exercises.documents?.length || 0}`);
    if (exercises.documents) {
      exercises.documents.slice(0, 3).forEach(doc => {
        console.log(`- ${doc.fields?.name?.stringValue || 'Sin nombre'} (ID: ${doc.name.split('/').pop()})`);
      });
    }
    console.log('');

    // Obtener registros de entrenamiento
    console.log('🏋️ REGISTROS DE ENTRENAMIENTO:');
    const workoutRecords = await firebaseRequest('workoutRecords');
    console.log(`Total registros: ${workoutRecords.documents?.length || 0}`);
    if (workoutRecords.documents) {
      workoutRecords.documents.slice(0, 5).forEach(doc => {
        const fields = doc.fields;
        const date = fields?.date?.timestampValue;
        const exerciseId = fields?.exerciseId?.stringValue;
        const weight = fields?.weight?.integerValue;
        const reps = fields?.reps?.integerValue;
        const sets = fields?.sets?.integerValue;

        console.log(`- ${date ? new Date(date).toLocaleDateString('es-ES') : 'Sin fecha'}: ${weight}kg x ${reps} reps (${sets} sets) - ExerciseID: ${exerciseId}`);
      });
    }
    console.log('');

    // Obtener asignaciones de ejercicios
    console.log('📅 ASIGNACIONES DE EJERCICIOS:');
    const assignments = await firebaseRequest('exerciseAssignments');
    console.log(`Total asignaciones: ${assignments.documents?.length || 0}`);
    if (assignments.documents) {
      assignments.documents.slice(0, 3).forEach(doc => {
        const fields = doc.fields;
        const dayOfWeek = fields?.dayOfWeek?.stringValue;
        const exerciseId = fields?.exerciseId?.stringValue;
        const order = fields?.order?.integerValue;

        console.log(`- ${dayOfWeek}: ExerciseID ${exerciseId} (orden: ${order})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugFirebase();
}

module.exports = { debugFirebase }; 