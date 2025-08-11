const express = require("express");
const router = express.Router();
const { listarPedidos, crearPedido, obtenerPedido } = require("../Controllers/pedidosController");
const { verificarToken } = require("../Middleware/authMiddleware");

// Rutas protegidas (requieren autenticación)
router.get("/", verificarToken, listarPedidos);
router.get("/:id", verificarToken, obtenerPedido);

// Ruta para crear pedidos (ahora protegida para poder acceder al ID del usuario)
router.post("/", verificarToken, crearPedido);

module.exports = router;
