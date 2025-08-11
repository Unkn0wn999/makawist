const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');

router.get('/ventas-mensuales', dashboardController.ventasMensuales);
router.get('/top-categorias', dashboardController.topCategorias);





module.exports = router;
