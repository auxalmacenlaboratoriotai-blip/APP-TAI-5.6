const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', [
  body('usuario').trim().notEmpty().withMessage('Usuario requerido'),
  body('contrasena').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { usuario, contrasena } = req.body;

    // Buscar usuario
    const result = await pool.query(
      'SELECT id, nom_usuario, correo, contrasena, rol, saludo_personalizado, nombre_completo FROM usuarios WHERE nom_usuario = $1 OR correo = $1',
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioDb = result.rows[0];

    // Verificar contraseña
    const esValido = await bcrypt.compare(contrasena, usuarioDb.contrasena);
    if (!esValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último acceso
    await pool.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [usuarioDb.id]
    );

    // Generar token
    const token = jwt.sign(
      { id: usuarioDb.id, usuario: usuarioDb.nom_usuario, rol: usuarioDb.rol, correo: usuarioDb.correo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      usuario: {
        id: usuarioDb.id,
        nom_usuario: usuarioDb.nom_usuario,
        correo: usuarioDb.correo,
        rol: usuarioDb.rol,
        nombre_completo: usuarioDb.nombre_completo,
        saludo_personalizado: usuarioDb.saludo_personalizado
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// Registro de técnicos
router.post('/register', [
  body('correo').isEmail().withMessage('Correo inválido'),
  body('nombre_completo').trim().notEmpty().withMessage('Nombre completo requerido'),
  body('contrasena').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { correo, nombre_completo, contrasena } = req.body;

    // Verificar si el correo ya existe
    const existente = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (existente.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Generar usuario a partir del correo
    const nom_usuario = correo.split('@')[0];
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nom_usuario, correo, contrasena, rol, nombre_completo) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom_usuario, correo, rol',
      [nom_usuario, correo, hashedPassword, 'tecnico', nombre_completo]
    );

    res.status(201).json({
      mensaje: 'Técnico registrado exitosamente',
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en registro' });
  }
});

// Verificar token
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nom_usuario, correo, rol, nombre_completo FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error verificando token' });
  }
});

module.exports = router;
