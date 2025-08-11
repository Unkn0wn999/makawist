const express = require("express");
const router = express.Router();
const verificarToken = require("../Middleware/verificarToken");
const {
  registrarTarjeta,
  listarTarjetas,
  eliminarTarjeta
} = require("../Controllers/tarjetasController");

// Obtener tarjetas del usuario autenticado
router.get("/", verificarToken, listarTarjetas);

// Registrar una nueva tarjeta
router.post("/", verificarToken, registrarTarjeta);

// Eliminar tarjeta por ID
router.delete("/:id", verificarToken, eliminarTarjeta);

module.exports = router;
