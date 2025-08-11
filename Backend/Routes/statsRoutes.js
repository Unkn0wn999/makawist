const express = require('express');
const router = express.Router();
const pool = require("../Db/connection");

// Total usuarios
router.get('/usuarios/total', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Total categorías
router.get('/categorias/total', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM categorias');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Total productos
router.get('/productos/total', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM productos');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Total ventas (sumatoria)
router.get('/ventas/total', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT SUM(total) AS total FROM pedidos');
    res.json({ total: rows[0].total || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener total de ventas' });
  }
});

// Promociones activas
router.get('/promociones/activas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM promociones WHERE activa = 1');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

module.exports = router;
