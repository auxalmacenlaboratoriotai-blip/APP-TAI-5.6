# APP-TAI-5.6

## Aplicación Completa de Gestión de Equipos - Laboratorio TAI México

Aplicación web, escritorio y móvil para gestión de inventario, calibraciones y desperfectos.

### 📋 Características

- ✅ **Autenticación** - Admin (contraseña fija) y Técnicos (registro por correo)
- ✅ **Inventario de Equipos** - CRUD con 3 imágenes por equipo
- ✅ **Control de Calibraciones** - Registro, vigencia y alertas
- ✅ **Registro de Desperfectos** - Reporte y seguimiento
- ✅ **Dashboard Moderno** - Barra de búsqueda y calendario integrado
- ✅ **Generación de PDFs** - Reportes descargables
- ✅ **Estadísticas y Gráficas** - Análisis visual de datos
- ✅ **Búsqueda Rápida** - Full-text search en tiempo real
- ✅ **Saludo Personalizado** - Bienvenida al usuario

### 🏗️ Arquitectura

```
APP-TAI-5.6/
├── backend/                 # API REST (Node.js + Express)
├── web/                     # Aplicación Web (React)
├── desktop/                 # Aplicación Windows (Electron)
├── mobile/                  # Aplicación Móvil (React Native)
├── docs/                    # Documentación
└── .github/                 # Configuración GitHub
```

### 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express.js
- PostgreSQL (servidor centralizado local)
- JWT para autenticación
- Multer para carga de imágenes
- PDFKit para generación de reportes

**Frontend (Web):**
- React + TypeScript
- Tailwind CSS
- Chart.js / Recharts
- Axios para API calls

**Desktop (Windows):**
- Electron + React
- Mismo código base que web

**Mobile (Android/iOS):**
- React Native + Expo
- Diseño responsive

### 🚀 Instalación Rápida

```bash
# Backend
cd backend
npm install
npm run dev

# Web
cd web
npm install
npm start

# Desktop
cd desktop
npm install
npm start

# Mobile
cd mobile
npm install
expo start
```

### 🔐 Credenciales por Defecto

**Admin:**
- Usuario: `admin`
- Contraseña: `Admin12345`

**Técnicos:**
- Se registran automáticamente con su correo

### 📊 Base de Datos

PostgreSQL con las siguientes tablas principales:
- `usuarios` - Gestión de usuarios
- `equipos` - Inventario de equipos
- `imagenes_equipos` - Imágenes (3 por equipo)
- `calibraciones` - Control de calibraciones
- `desperfectos` - Registro de problemas

### 📝 Licencia

Laboratorio TAI México © 2026
