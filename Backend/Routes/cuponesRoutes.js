const express = require('express');
const router = express.Router();
const cuponesController = require('../Controllers/cuponesController');

router.get('/activas/count', cuponesController.contarCuponesActivos);
// Rutas públicas
router.get('/promociones-activas', cuponesController.listarCuponesActivos);

// Validar cupón por código
router.get('/validar', cuponesController.validarCupon);


// CRUD admin
router.get('/admin/cupones', cuponesController.listarTodosCupones);
router.post('/admin/cupones', cuponesController.crearCupon);
router.put('/admin/cupones/:id', cuponesController.editarCupon);
router.delete('/admin/cupones/:id', cuponesController.eliminarCupon);

module.exports = router;
