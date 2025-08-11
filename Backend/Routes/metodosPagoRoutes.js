const express = require("express");
const router = express.Router();
const { agregarMetodoPago, obtenerMetodosPago } = require("../Controllers/metodosPagoController");

router.post("/", agregarMetodoPago);
router.get("/", obtenerMetodosPago);

module.exports = router;
