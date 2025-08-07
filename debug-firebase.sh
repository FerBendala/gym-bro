#!/bin/bash

# Script para debuggear Firebase directamente con curl
echo "🔍 Debuggeando Firebase con curl..."

# Configuración de Firebase
PROJECT_ID="follow-gym-12345"
API_KEY="AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq"

echo "📊 EJERCICIOS:"
curl -s "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/exercises?key=$API_KEY" | jq '.documents | length'

echo "🏋️ REGISTROS DE ENTRENAMIENTO:"
curl -s "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/workoutRecords?key=$API_KEY" | jq '.documents | length'

echo "📅 ASIGNACIONES DE EJERCICIOS:"
curl -s "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/exerciseAssignments?key=$API_KEY" | jq '.documents | length'

echo ""
echo "📋 ÚLTIMOS 5 REGISTROS DE ENTRENAMIENTO:"
curl -s "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/workoutRecords?key=$API_KEY" | jq '.documents[0:5] | .[] | {date: .fields.date.timestampValue, exerciseId: .fields.exerciseId.stringValue, weight: .fields.weight.integerValue, reps: .fields.reps.integerValue, sets: .fields.sets.integerValue}' 