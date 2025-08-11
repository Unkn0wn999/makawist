const express = require("express");
const router = express.Router();
const { verificarToken } = require("../Middleware/authMiddleware");


const favoritosController = require("../Controllers/favoritosController");

// Listar favoritos del usuario
router.get("/", verificarToken, favoritosController.listarFavoritos);

// Agregar a favoritos
router.post("/agregar", verificarToken, favoritosController.agregarFavorito);

// Eliminar de favoritos
router.post("/eliminar", verificarToken, favoritosController.eliminarFavorito);

module.exports = router;
