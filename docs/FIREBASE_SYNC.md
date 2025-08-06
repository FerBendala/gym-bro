# Sincronización con Firebase

## Descripción

La aplicación ahora incluye funcionalidad completa de sincronización con Firebase para la configuración de volumen del usuario. Esto permite que los usuarios accedan a su configuración personalizada desde cualquier dispositivo.

## Características Implementadas

### 1. Servicio de Configuración de Usuario (`UserSettingsService`)

- **Ubicación**: `src/api/services/user-settings-service.ts`
- **Funcionalidades**:
  - `getUserSettings()`: Obtiene configuración desde Firebase
  - `saveUserSettings()`: Guarda configuración en Firebase
  - `updateVolumeDistribution()`: Actualiza solo la distribución de volumen
  - `syncWithFirebase()`: Sincronización bidireccional

### 2. Hook de Sincronización (`useSettingsSync`)

- **Ubicación**: `src/hooks/use-settings-sync.ts`
- **Funcionalidades**:
  - `syncToFirebase()`: Sincroniza configuración local con Firebase
  - `loadFromFirebase()`: Carga configuración desde Firebase
  - `syncBidirectional()`: Sincronización bidireccional completa

### 3. Hook de Autenticación (`useAuth`)

- **Ubicación**: `src/hooks/use-auth.ts`
- **Funcionalidades**:
  - Manejo del estado de autenticación
  - Obtención del ID del usuario autenticado
  - Fallback para desarrollo

### 4. Componentes de UI

#### `VolumeSettingsSyncStatus`

- Muestra el estado de sincronización
- Botón para sincronización manual
- Indicadores visuales de estado

#### `VolumeSettingsFirebaseInfo`

- Información sobre la sincronización con Firebase
- Beneficios de la sincronización en la nube

#### `VolumeSettingsTestSync`

- Componente de prueba para verificar conexión
- Útil para desarrollo y debugging

## Estructura de Datos

### Configuración de Usuario en Firebase

```typescript
interface UserSettingsData {
  theme?: 'light' | 'dark';
  language?: string;
  autoSync?: boolean;
  syncInterval?: number; // minutos
  maxCacheSize?: number; // MB
  customVolumeDistribution?: Record<string, number>;
  updatedAt: number;
}
```

### Estructura en Firestore

```
users/
  {userId}/
    settings/
      userSettings/
        - customVolumeDistribution: Record<string, number>
        - theme: string
        - language: string
        - autoSync: boolean
        - syncInterval: number
        - maxCacheSize: number
        - updatedAt: number
```

## Flujo de Sincronización

### 1. Carga Inicial

1. Intenta cargar desde Firebase
2. Si no hay datos en Firebase, usa IndexedDB como fallback
3. Si hay datos en Firebase, los sincroniza con IndexedDB

### 2. Guardado

1. Guarda en Firebase como fuente principal
2. Guarda en IndexedDB como respaldo local
3. Maneja errores de conexión

### 3. Sincronización Manual

1. Usuario puede forzar sincronización
2. Combina datos locales con remotos
3. Resuelve conflictos (Firebase tiene prioridad)

## Configuración de Firebase

### Variables de Entorno Requeridas

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/settings/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Uso en la Aplicación

### En el Hook de Configuración de Volumen

```typescript
// Cargar configuración
const firebaseResult = await UserSettingsService.getUserSettings();
if (firebaseResult.success && firebaseResult.data?.customVolumeDistribution) {
  setState((prev) => ({
    ...prev,
    volumeDistribution: firebaseResult.data.customVolumeDistribution,
  }));
}

// Guardar configuración
const result = await UserSettingsService.updateVolumeDistribution(
  volumeDistribution
);
if (result.success) {
  // También guardar en IndexedDB como respaldo
  await updateItem('metadata', newSettings);
}
```

### En Componentes

```typescript
// Estado de sincronización
const { state, syncBidirectional } = useSettingsSync();

// Sincronización manual
const handleSync = async () => {
  await syncBidirectional();
};
```

## Manejo de Errores

### Errores de Conexión

- Fallback automático a IndexedDB
- Notificaciones de error al usuario
- Logs detallados para debugging

### Errores de Autenticación

- Uso de ID temporal para desarrollo
- Preparado para autenticación real

### Errores de Datos

- Validación de datos antes de guardar
- Rollback a configuración anterior en caso de error

## Beneficios

1. **Persistencia**: La configuración se mantiene entre sesiones
2. **Multi-dispositivo**: Acceso desde cualquier dispositivo
3. **Respaldo**: Datos seguros en la nube
4. **Offline**: Funciona sin conexión usando IndexedDB
5. **Sincronización**: Actualización automática entre dispositivos

## Próximos Pasos

1. **Autenticación Real**: Implementar sistema de autenticación completo
2. **Sincronización Automática**: Sincronización en tiempo real
3. **Conflictos**: Resolución avanzada de conflictos
4. **Compresión**: Comprimir datos para optimizar transferencia
5. **Cifrado**: Cifrar datos sensibles en tránsito y almacenamiento
