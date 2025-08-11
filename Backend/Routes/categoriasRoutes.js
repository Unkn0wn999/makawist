const express = require("express");
const router = express.Router();
const {
  obtenerCategorias,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
   obtenerCategoriaPorId 
} = require("../Controllers/categoriasController");

router.get("/", obtenerCategorias);
router.post("/", registrarCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);
router.get('/:id', obtenerCategoriaPorId);

module.exports = router;
