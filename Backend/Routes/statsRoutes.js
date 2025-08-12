const express = require("express");
const router = express.Router();
const { obtenerEstadisticas } = require("../Controllers/statsController");

// Endpoint único para todo
router.get("/estadisticas", obtenerEstadisticas);

module.exports = router;
