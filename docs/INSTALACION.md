# Guía de Instalación - APP-TAI-5.6

## 🔧 Requisitos Previos

- Node.js v18+ y npm
- PostgreSQL 13+
- Git
- Visual Studio Code (opcional pero recomendado)

## 📥 1. Clonar el Repositorio

```bash
git clone https://github.com/auxalmacenlaboratoriotai-blip/APP-TAI-5.6.git
cd APP-TAI-5.6
```

## 🗄️ 2. Configurar Base de Datos

### Opción A: Windows

1. **Descargar PostgreSQL:**
   - https://www.postgresql.org/download/windows/
   - Instalar versión 14 o superior
   - Guardar contraseña del usuario `postgres`

2. **Crear base de datos:**
   ```bash
   # Abrir psql (SQL Shell)
   psql -U postgres
   
   # Crear base de datos
   CREATE DATABASE app_tai_5_6;
   \c app_tai_5_6
   \i backend/src/config/schema.sql
   ```

### Opción B: Docker (Recomendado)

```bash
# Instalar Docker Desktop desde https://www.docker.com/products/docker-desktop

# En la carpeta del proyecto:
docker run --name postgres-tai -e POSTGRES_PASSWORD=Admin12345 -e POSTGRES_DB=app_tai_5_6 -p 5432:5432 -d postgres:15

# Verificar que está corriendo:
docker ps
```

## 🖥️ 3. Instalar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus datos:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=Admin12345
# DB_NAME=app_tai_5_6
# JWT_SECRET=tu_secreto_super_seguro_aqui
# PORT=5000

# Iniciar servidor
npm run dev

# Debe mostrar: "Servidor ejecutándose en puerto 5000"
```

## 🌐 4. Instalar Aplicación Web

```bash
cd ../web

# Instalar dependencias
npm install

# Crear archivo .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Iniciar aplicación
npm start

# Se abrirá en http://localhost:3000
```

## 🖨️ 5. Instalar Aplicación Windows (Desktop)

```bash
cd ../desktop

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Para crear ejecutable:
npm run build
# El .exe estará en /dist
```

## 📱 6. Instalar Aplicación Móvil (React Native)

```bash
cd ../mobile

# Instalar dependencias
npm install

# Crear archivo .env
echo "API_URL=http://192.168.1.XXX:5000" > .env
# (Reemplazar XXX con tu IP local)

# Iniciar con Expo
npx expo start

# Opciones:
# - Presionar 'w' para web
# - Escanear QR con Expo Go (iOS/Android)
# - Presionar 'a' para Android Emulator
# - Presionar 'i' para iOS Simulator
```

## ✅ 7. Verificar Instalación

### Paso 1: Probar Backend
```bash
curl http://localhost:5000/api/health
# Debe responder: {"status": "ok"}
```

### Paso 2: Probar Login Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "contraseña": "Admin12345"}'
# Debe devolver un token JWT
```

### Paso 3: Acceder a la Web
- Ir a http://localhost:3000
- Usuario: `admin`
- Contraseña: `Admin12345`
- Debe mostrar el dashboard

## 🚀 Estructura de Ejecución en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Web:**
```bash
cd web
npm start
```

**Terminal 3 - Desktop (opcional):**
```bash
cd desktop
npm start
```

**Terminal 4 - Mobile (opcional):**
```bash
cd mobile
npx expo start
```

## 🔐 Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Admin12345
DB_NAME=app_tai_5_6

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_no_usar_production
JWT_EXPIRE=7d

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Web (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### Mobile (.env)
```env
API_URL=http://192.168.1.XXX:5000
ENV=development
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verificar que PostgreSQL está corriendo
- Verificar credenciales en .env
- Ejecutar: `psql -U postgres -h localhost`

### Error: "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Error: "npm command not found"
- Instalar Node.js desde https://nodejs.org/
- Reiniciar terminal después de instalar

## 📞 Soporte

Para reportar problemas:
1. Revisar logs en consola
2. Verificar archivo .env
3. Crear un issue en GitHub
