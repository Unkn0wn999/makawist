const express = require("express");
const router = express.Router();
const { verificarToken } = require("../Middleware/authMiddleware");


const carritoController = require("../Controllers/carritoController");

// Listar productos del carrito
router.get("/", verificarToken, carritoController.listarCarrito);

// Obtener cantidad total de productos en el carrito
router.get("/cantidad", verificarToken, carritoController.obtenerCantidadCarrito);

// Verificar si un producto está en el carrito
router.post("/verificar", verificarToken, carritoController.verificarProductoEnCarrito);

// Agregar producto
router.post("/", verificarToken, carritoController.agregarAlCarrito);

// Actualizar cantidad
router.put("/:idProducto", verificarToken, carritoController.actualizarCantidad);

// Eliminar producto
router.delete("/:idProducto", verificarToken, carritoController.eliminarDelCarrito);

// Vaciar todo el carrito
router.delete("/vaciar/todo", verificarToken, carritoController.vaciarCarrito);

module.exports = router;
