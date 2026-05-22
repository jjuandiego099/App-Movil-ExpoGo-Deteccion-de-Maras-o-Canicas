# 📱 App Móvil — Detección de Maras (Canicas)

> Aplicación móvil construida con **Expo Go** que se conecta a la API REST de detección de maras (canicas) usando YOLOv8s. Permite capturar imágenes desde el celular y recibir detecciones en tiempo real.

**Autores:** Juan Diego Chaparro García · Juan José Vargas · Santiago Amado  
**Universidad:** Universidad Autónoma de Bucaramanga · **Curso:** Inteligencia Artificial y Ciencia de Datos  
**Año:** 2026

---

## 📖 ¿Qué hace esta app?

Esta app móvil es el cliente móvil del sistema de detección de maras. Se comunica con la [API de inferencia](https://github.com/tu-usuario/Modelo-de-Prediccion-de-Maras-Canicas) para:

- 📷 Subir una foto tomada desde el celular
- 🔍 Recibir las detecciones del modelo YOLOv8s (maras negras, azules, verdes y blancas)
- 📊 Ver el resultado anotado y las estadísticas de detección

---

## 🗂️ Estructura del Proyecto

```
app-maras-expo/
│
├── app/
│   ├── index.tsx           # Pantalla principal — captura y detección
│   ├── stats.tsx           # Pantalla de estadísticas históricas
│   └── _layout.tsx         # Navegación con tabs
│
├── components/
│   ├── DetectionResult.tsx # Componente de resultado con bounding boxes
│   └── MarbleCounter.tsx   # Conteo por tipo de mara
│
├── services/
│   └── api.ts              # Cliente HTTP para la API de detección
│
├── constants/
│   └── Config.ts           # URL base de la API y configuración
│
├── assets/                 # Íconos y splash screen
├── app.json                # Configuración de Expo
├── package.json            # Dependencias
└── README.md               # Este archivo
```

---

## ⚡ Conexión con la API

La app se conecta al backend FastAPI del proyecto principal. Configura la URL en `constants/Config.ts`:

```typescript
// constants/Config.ts
export const API_BASE_URL = "http://<IP-de-tu-maquina>:8000";
// Ejemplo local:    "http://192.168.1.100:8000"
// Ejemplo en EC2:   "https://tu-dominio.com"
```

> **⚠️ Importante:** Expo Go en el celular no puede usar `localhost`. Debes usar la IP local de tu máquina o la URL pública de EC2.

### Endpoints que usa la app

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Verifica el estado de la API, conexión y modelo YOLO cargado |
| `GET` | `/stats/totales` | Retorna el total acumulado de canicas detectadas por clase |
| `GET` | `/stats/historial` | Retorna historial paginado de detecciones registradas |
| `GET` | `/classes` | Lista las clases detectables del modelo YOLO |
| `GET` | `/metrics` | Retorna métricas generales de inferencia y rendimiento |
| `POST` | `/predict` | Recibe imagen → retorna JSON con detecciones |
| `POST` | `/predict/image` | Recibe imagen → retorna PNG anotado |
| `POST` | `/predict/video` | Recibe video → retorna MP4 anotado |
| `POST` | `/predict/camera` | Procesa captura de cámara → retorna detecciones |

---

## 🚀 Instalación y ejecución

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Expo Go](https://expo.dev/go) instalado en tu celular (Android o iOS)
- La [API de detección](https://github.com/tu-usuario/Modelo-de-Prediccion-de-Maras-Canicas) corriendo localmente o en EC2

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/app-maras-expo.git
cd app-maras-expo
npm install
```

### 2. Configurar la URL de la API

Edita `constants/Config.ts` con la IP de tu máquina:

```bash
# Para encontrar tu IP local en macOS/Linux:
ifconfig | grep "inet "

# En Windows:
ipconfig
```

### 3. Iniciar la app

```bash
npx expo start
```

Luego escanea el QR con la cámara de tu celular (iOS) o con la app Expo Go (Android).

---

## 📱 Pantallas de la App

### 📷 Detección
- Botón para abrir la cámara o la galería
- Previsualización de la imagen seleccionada
- Envío automático a la API al confirmar
- Muestra la imagen anotada con los bounding boxes de cada mara detectada
- Contador por tipo: ⚫ Negra · 🔵 Azul · 🟢 Verde · ⚪ Blanca

### 📊 Estadísticas
- Historial de detecciones realizadas desde el celular
- Conteo total acumulado por clase
- Explicacion del umbral de confianza e IOU

### ℹ️ Info
- Descripcion de la aplicacion 
- Como funciona la aplicacion
- Categorias de prediccion 

---

## 🎯 Clases detectadas

| ID | Clase | Color |
|----|-------|-------|
| 0 | `black marble` | ⚫ Negra |
| 1 | `blue marble` | 🔵 Azul |
| 2 | `green marble` | 🟢 Verde |
| 3 | `white marble` | ⚪ Blanca |

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| [Expo](https://expo.dev/) | Framework móvil multiplataforma |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegación por archivos |
| [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | Acceso a cámara y galería |
| [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) | Captura de fotos en vivo |
| TypeScript | Tipado estático |
| Fetch API | Comunicación con la API REST |

---

## 🔧 Variables de configuración

```typescript
// constants/Config.ts
export const CONFIG = {
  API_BASE_URL: "http://192.168.1.100:8000", // Cambia según tu entorno
  DEFAULT_CONF:  0.60,   // Umbral de confianza
  DEFAULT_IOU:   0.45,   // Umbral IoU (NMS)
  TIMEOUT_MS:    10000,  // Timeout de las peticiones en ms
};
```

---

## 🐛 Solución de problemas

**La app no conecta con la API**
- Verifica que el celular y la computadora estén en la **misma red WiFi**
- Confirma que la IP en `Config.ts` sea la correcta (`ifconfig` / `ipconfig`)
- Asegúrate de que el servidor esté corriendo en el puerto 8000

**El QR no abre Expo Go**
- Usa `npx expo start --tunnel` para generar un enlace accesible fuera de tu red local

**Error de permisos de cámara**
- Ve a Configuración del celular → Apps → Expo Go → Permisos → Activar Cámara

---

## 📄 Licencia

Copyright (c) 2026  
Universidad Autónoma de Bucaramanga (UNAB)
