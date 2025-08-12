const express = require("express");
const router = express.Router();
const { contarVentas } = require("../Controllers/ventasController");

router.get("/count", contarVentas);

module.exports = router;
