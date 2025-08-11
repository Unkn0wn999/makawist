const express = require("express");
const router = express.Router();
const controller = require("../Controllers/adminPromocionesController");

router.get("/", controller.listarPromociones);
router.post("/", controller.crearPromocion);
router.put("/:id", controller.actualizarPromocion);
router.delete("/:id", controller.eliminarPromocion);

module.exports = router;
