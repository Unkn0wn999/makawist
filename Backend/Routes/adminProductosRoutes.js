const express = require("express");
const router = express.Router();
const {
  obtenerProductosAdmin,
  registrarProducto,
  actualizarProducto,
  eliminarProducto
} = require("../Controllers/adminProductosController");
const upload = require("../Middleware/uploadMiddleware");

router.get("/", obtenerProductosAdmin);
router.post("/", upload.single('imagen'), registrarProducto);
router.put("/:id", upload.single('imagen'), actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
