const express = require("express");
const router = express.Router();
const { verificarToken } = require("../Middleware/authMiddleware");
const direccionesController = require("../Controllers/direccionesController");

// Listar
router.get("/", verificarToken, direccionesController.listar);

// Agregar
router.post("/", verificarToken, direccionesController.agregar);

// Editar
router.put("/:id", verificarToken, direccionesController.actualizar);

// Eliminar
router.delete("/:id", verificarToken, direccionesController.eliminar);

module.exports = router;
