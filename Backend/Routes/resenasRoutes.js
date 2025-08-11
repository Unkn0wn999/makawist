const express = require("express");
const router = express.Router();
const { verificarToken } = require("../Middleware/authMiddleware");
const {
  obtenerResenasPorProducto,
  verificarCompraProducto,
  registrarResena
} = require("../Controllers/resenasController");

// Rutas públicas
router.get("/productos/:idProducto", obtenerResenasPorProducto);

// Rutas protegidas (requieren autenticación)
router.get("/verificar-compra/:idProducto", verificarToken, verificarCompraProducto);
router.post("/productos/:idProducto", verificarToken, registrarResena);

module.exports = router;