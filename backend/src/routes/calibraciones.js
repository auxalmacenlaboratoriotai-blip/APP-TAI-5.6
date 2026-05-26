const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las calibraciones
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { vigencia, equipo_id } = req.query;
    let query = `
      SELECT c.*, e.num_inventario, e.descripcion 
      FROM calibraciones c
      JOIN equipos e ON c.equipo_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (vigencia) {
      query += ` AND c.vigencia = $${params.length + 1}`;
      params.push(vigencia);
    }

    if (equipo_id) {
      query += ` AND c.equipo_id = $${params.length + 1}`;
      params.push(equipo_id);
    }

    query += ' ORDER BY c.fecha_vencimiento ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener calibraciones' });
  }
});

// Obtener calibración por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.num_inventario 
       FROM calibraciones c
       JOIN equipos e ON c.equipo_id = e.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calibración no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener calibración' });
  }
});

// Crear calibración
router.post('/', authMiddleware, adminOnly, [
  body('equipo_id').isInt().withMessage('equipo_id debe ser número'),
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('ultima_calibracion').isISO8601().withMessage('Fecha inválida'),
  body('vigencia_anos').isInt({ min: 1 }).withMessage('Vigencia debe ser número positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { equipo_id, nombre, marca, modelo, serie, ultima_calibracion, vigencia_anos, fecha_cotizacion, notas } = req.body;

    // Calcular fecha de vencimiento
    const fechaUltima = new Date(ultima_calibracion);
    const fechaVencimiento = new Date(fechaUltima);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + vigencia_anos);

    // Calcular días de vigencia
    const hoy = new Date();
    const diasVigencia = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

    // Determinar estado de vigencia
    let vigencia = 'VIGENTE';
    if (diasVigencia < 0) {
      vigencia = 'VENCIDA';
    } else if (diasVigencia <= 30) {
      vigencia = 'PROXIMO';
    }

    const result = await pool.query(
      `INSERT INTO calibraciones 
       (equipo_id, nombre, marca, modelo, serie, ultima_calibracion, fecha_vencimiento, vigencia_anos, dias_vigencia, vigencia, fecha_cotizacion, notas, usuario_creador_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [equipo_id, nombre, marca, modelo, serie, ultima_calibracion, fechaVencimiento, vigencia_anos, diasVigencia, vigencia, fecha_cotizacion, notas, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear calibración' });
  }
});

// Actualizar calibración
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { ultima_calibracion, vigencia_anos } = req.body;

    let query = 'UPDATE calibraciones SET ';
    const params = [];
    const campos = [];

    if (ultima_calibracion) {
      campos.push(`ultima_calibracion = $${params.length + 1}`);
      params.push(ultima_calibracion);
    }

    if (vigencia_anos) {
      campos.push(`vigencia_anos = $${params.length + 1}`);
      params.push(vigencia_anos);
    }

    if (ultima_calibracion || vigencia_anos) {
      const calibracion = await pool.query('SELECT * FROM calibraciones WHERE id = $1', [req.params.id]);
      if (calibracion.rows.length === 0) {
        return res.status(404).json({ error: 'Calibración no encontrada' });
      }

      const cal = calibracion.rows[0];
      const fechaUltima = new Date(ultima_calibracion || cal.ultima_calibracion);
      const anos = vigencia_anos || cal.vigencia_anos;
      const fechaVencimiento = new Date(fechaUltima);
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + anos);

      const hoy = new Date();
      const diasVigencia = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

      let vigencia = 'VIGENTE';
      if (diasVigencia < 0) vigencia = 'VENCIDA';
      else if (diasVigencia <= 30) vigencia = 'PROXIMO';

      campos.push(`fecha_vencimiento = $${params.length + 1}`);
      params.push(fechaVencimiento);
      campos.push(`dias_vigencia = $${params.length + 1}`);
      params.push(diasVigencia);
      campos.push(`vigencia = $${params.length + 1}`);
      params.push(vigencia);
    }

    campos.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    query += campos.join(', ') + ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(req.params.id);

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar calibración' });
  }
});

// Eliminar calibración
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM calibraciones WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calibración no encontrada' });
    }
    res.json({ mensaje: 'Calibración eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar calibración' });
  }
});

// Obtener calibraciones por vigencia
router.get('/estadisticas/vigencia', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vigencia, COUNT(*) as cantidad
      FROM calibraciones
      GROUP BY vigencia
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
