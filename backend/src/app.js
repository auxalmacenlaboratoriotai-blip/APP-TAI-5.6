const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const equiposRoutes = require('./routes/equipos');
const calibracionesRoutes = require('./routes/calibraciones');
const desperfectosRoutes = require('./routes/desperfectos');
const reportesRoutes = require('./routes/reportes');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/calibraciones', calibracionesRoutes);
app.use('/api/desperfectos', desperfectosRoutes);
app.use('/api/reportes', reportesRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
