const express = require("express");
const router = express.Router();
const {
  obtenerProductos,
  listarProductos,
  registrarProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductoPorId,
  obtenerProductosNuevos
} = require("../Controllers/productosController");

// Rutas públicas
router.get("/", obtenerProductos);                 // /api/productos
// Importante: La ruta específica debe ir antes que la ruta con parámetro
router.get("/nuevos-productos", obtenerProductosNuevos);     // /api/productos/nuevos-productos
// Las rutas con parámetros deben ir al final
router.get("/:id", obtenerProductoPorId);          // /api/productos/:id

// Rutas dashboard admin
router.get("/dashboard", listarProductos);
router.post("/", registrarProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
