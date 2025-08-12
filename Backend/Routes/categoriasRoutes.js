const express = require("express");
const router = express.Router();
const {
  obtenerCategorias,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerCategoriaPorId,
  contarCategorias
} = require("../Controllers/categoriasController");

// Contar categorías (debe ir antes que /:id)
router.get("/count", contarCategorias);

// Rutas CRUD
router.get("/", obtenerCategorias);
router.post("/", registrarCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);

// Esta siempre al final
router.get("/:id", obtenerCategoriaPorId);

module.exports = router;
