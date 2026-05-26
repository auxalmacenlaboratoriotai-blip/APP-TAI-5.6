-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nom_usuario VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  correo VARCHAR(120) UNIQUE NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'tecnico' CHECK (rol IN ('admin', 'tecnico')),
  saludo_personalizado VARCHAR(255),
  nombre_completo VARCHAR(150),
  avatar_url VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Equipos (Inventario)
CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  num_inventario VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  serie VARCHAR(100) NOT NULL,
  rama VARCHAR(50),
  disponibilidad VARCHAR(50) NOT NULL DEFAULT 'EN USO' CHECK (disponibilidad IN ('EN USO', 'DISPONIBLE', 'MANTENIMIENTO', 'FUERA DE SERVICIO')),
  resguardo VARCHAR(255),
  ubicacion VARCHAR(255),
  especificaciones TEXT,
  fecha_adquisicion DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_creador_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario_actualizador_id INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de Imágenes de Equipos (3 imágenes por equipo)
CREATE TABLE IF NOT EXISTS imagenes_equipos (
  id SERIAL PRIMARY KEY,
  equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  ruta_imagen VARCHAR(255) NOT NULL,
  ordinal INT NOT NULL CHECK (ordinal >= 1 AND ordinal <= 3),
  descripcion VARCHAR(255),
  fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(equipo_id, ordinal)
);

-- Tabla de Calibraciones
CREATE TABLE IF NOT EXISTS calibraciones (
  id SERIAL PRIMARY KEY,
  equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  serie VARCHAR(100),
  vigencia_anos INT NOT NULL,
  fecha_cotizacion DATE,
  ultima_calibracion DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  dias_vigencia INT,
  vigencia VARCHAR(20) DEFAULT 'VIGENTE' CHECK (vigencia IN ('VIGENTE', 'VENCIDA', 'PROXIMO', 'POR_CALIBRAR')),
  certificado_url VARCHAR(255),
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_creador_id INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de Desperfectos
CREATE TABLE IF NOT EXISTS desperfectos (
  id SERIAL PRIMARY KEY,
  equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  sintomas TEXT,
  estatus VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estatus IN ('activo', 'en_reparacion', 'resuelto', 'cancelado')),
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion TIMESTAMP,
  fecha_estimada_resolucion DATE,
  tecnico_asignado_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  tecnico_reporte_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  solucion_aplicada TEXT,
  notas TEXT,
  costo_estimado NUMERIC(10, 2)
);

-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  tabla VARCHAR(100),
  accion VARCHAR(50) CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_origen VARCHAR(45)
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_equipos_num_inventario ON equipos(num_inventario);
CREATE INDEX idx_equipos_disponibilidad ON equipos(disponibilidad);
CREATE INDEX idx_calibraciones_vigencia ON calibraciones(vigencia);
CREATE INDEX idx_calibraciones_fecha_vencimiento ON calibraciones(fecha_vencimiento);
CREATE INDEX idx_desperfectos_estatus ON desperfectos(estatus);
CREATE INDEX idx_desperfectos_equipo_id ON desperfectos(equipo_id);
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);
