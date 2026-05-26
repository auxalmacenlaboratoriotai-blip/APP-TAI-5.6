# Estructura del Proyecto APP-TAI-5.6

## 📁 Carpetas Principales

### `/backend`
API REST que maneja toda la lógica del negocio.

**Estructura:**
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuración PostgreSQL
│   │   └── auth.js          # Configuración JWT
│   ├── routes/
│   │   ├── auth.js          # Autenticación
│   │   ├── equipos.js       # Inventario
│   │   ├── calibraciones.js # Calibraciones
│   │   ├── desperfectos.js  # Desperfectos
│   │   └── reportes.js      # PDFs y reportes
│   ├── controllers/
│   │   └── [controladores]  # Lógica de negocio
│   ├── middleware/
│   │   ├── auth.js          # Validación JWT
│   │   └── multer.js        # Carga de imágenes
│   ├── models/
│   │   └── [modelos BD]     # Esquemas
│   ├── utils/
│   │   ├── pdf.js           # Generación PDFs
│   │   └── validators.js    # Validaciones
│   └── app.js               # Configuración Express
├── .env.example
└── package.json
```

### `/web`
Aplicación React para navegadores web.

**Estructura:**
```
web/
├── src/
│   ├── components/
│   │   ├── auth/            # Login/Registro
│   │   ├── dashboard/       # Panel principal
│   │   ├── inventario/      # CRUD equipos
│   │   ├── calibraciones/   # Calibraciones
│   │   ├── desperfectos/    # Reportes
│   │   └── common/          # Componentes reutilizables
│   ├── pages/
│   ├── services/            # API calls
│   ├── context/             # Redux/Context
│   ├── styles/              # Tailwind CSS
│   ├── utils/               # Funciones auxiliares
│   ├── App.tsx
│   └── index.tsx
├── public/
│   └── images/              # Assets (logo TAI)
└── package.json
```

### `/desktop`
Aplicación Electron para Windows (mismo código React).

**Estructura:**
```
desktop/
├── public/
│   └── electron.js          # Proceso principal Electron
├── src/                      # Mismo que /web
└── package.json
```

### `/mobile`
Aplicación React Native para Android/iOS.

**Estructura:**
```
mobile/
├── src/
│   ├── screens/             # Pantallas de la app
│   ├── components/          # Componentes reutilizables
│   ├── navigation/          # Navegación
│   ├── services/            # API calls
│   └── utils/               # Funciones auxiliares
├── app.json                 # Configuración Expo
└── package.json
```

## 🗄️ Base de Datos - Esquema

### Tabla: `usuarios`
```sql
id SERIAL PRIMARY KEY
nom_usuario VARCHAR(100) UNIQUE
contraseña VARCHAR(255)
correo VARCHAR(120) UNIQUE
rol VARCHAR(20) (admin, tecnico)
saludo_personalizado VARCHAR(255)
fecha_creacion TIMESTAMP
activo BOOLEAN
```

### Tabla: `equipos`
```sql
id SERIAL PRIMARY KEY
num_inventario VARCHAR(50) UNIQUE
descripcion TEXT
marca VARCHAR(100)
modelo VARCHAR(100)
serie VARCHAR(100)
rama VARCHAR(50)
disponibilidad VARCHAR(50)
resguardo VARCHAR(255)
fecha_creacion TIMESTAMP
usuario_creador_id INT (FK)
```

### Tabla: `imagenes_equipos`
```sql
id SERIAL PRIMARY KEY
equipo_id INT (FK)
ruta_imagen VARCHAR(255)
ordinal INT (1-3)
fecha_carga TIMESTAMP
```

### Tabla: `calibraciones`
```sql
id SERIAL PRIMARY KEY
equipo_id INT (FK)
nombre VARCHAR(100)
marca VARCHAR(100)
modelo VARCHAR(100)
serie VARCHAR(100)
vigencia_anos INT
fecha_cotizacion DATE
ultima_calibracion DATE
fecha_vencimiento DATE
dias_vigencia INT
vigencia VARCHAR(20) (VIGENTE, VENCIDA, PROXIMO)
fecha_creacion TIMESTAMP
```

### Tabla: `desperfectos`
```sql
id SERIAL PRIMARY KEY
equipo_id INT (FK)
descripcion TEXT
estatus VARCHAR(50) (activo, resuelto)
fecha_reporte TIMESTAMP
fecha_resolucion TIMESTAMP
tecnico_id INT (FK)
```

## 🔐 Autenticación

- **Admin:** Usuario fijo `admin` con contraseña `Admin12345`
- **Técnicos:** Se registran automáticamente con su correo
- **Token JWT:** Válido por 7 días
- **Roles:** Admin (solo lectura/escritura) y Técnico (lectura)

## 🌐 Endpoints API

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro técnico
- `POST /api/auth/verify` - Verificar token

### Equipos
- `GET /api/equipos` - Listar todos
- `POST /api/equipos` - Crear
- `PUT /api/equipos/:id` - Actualizar
- `DELETE /api/equipos/:id` - Eliminar
- `POST /api/equipos/:id/imágenes` - Subir imágenes

### Calibraciones
- `GET /api/calibraciones` - Listar
- `POST /api/calibraciones` - Crear
- `PUT /api/calibraciones/:id` - Actualizar

### Desperfectos
- `GET /api/desperfectos` - Listar
- `POST /api/desperfectos` - Crear
- `PUT /api/desperfectos/:id` - Actualizar

### Reportes
- `GET /api/reportes/equipos/pdf` - PDF inventario
- `GET /api/reportes/calibraciones/pdf` - PDF calibraciones
- `GET /api/reportes/estadisticas` - Datos para gráficas
