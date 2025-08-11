const express = require("express");
const router = express.Router();
const {
  obtenerCategoriasAdmin,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require("../Controllers/adminCategoriasController");

router.get("/", obtenerCategoriasAdmin);
router.post("/", registrarCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);

module.exports = router;
