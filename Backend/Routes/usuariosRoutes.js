const express = require("express");
const router = express.Router();

const {
  obtenerPerfil,
  actualizarPerfil,
  cambiarClave,

  listarUsuarios,
  obtenerUsuario,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  contarUsuarios
} = require("../Controllers/usuariosController");

// 👉 Rutas para usuarios (cliente)
router.get("/perfil", obtenerPerfil);
router.put("/perfil", actualizarPerfil);
router.put("/cambiar-clave", cambiarClave);

router.get("/count", contarUsuarios);
// 👉 Rutas para usuarios (admin - dashboard)
router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.post("/", registrarUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
router.patch("/:id/estado", cambiarEstadoUsuario); // activar/inactivar usuario


// ✅ Solo exporta el router
module.exports = router;
