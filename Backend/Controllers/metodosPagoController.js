const pool = require("../Db/connection");
const jwt = require("jsonwebtoken");

const agregarMetodoPago = async (req, res) => {
  try {
    // Usar req.usuario en lugar de decodificar el token nuevamente
const idUsuario = req.usuario.id;
    const { titular, numero, expiracion, cvv, tipo } = req.body;

    await pool.query(
      `INSERT INTO MetodosPago (IdUsuario, TitularTarjeta, NumeroTarjeta, FechaExpiracion, Cvv, TipoTarjeta)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idUsuario, titular, numero, expiracion, cvv, tipo]
    );

    res.json({ mensaje: "Método de pago agregado correctamente" });
  } catch (error) {
    console.error("❌ Error al agregar método de pago:", error);
    res.status(500).json({ mensaje: "Error al agregar método de pago" });
  }
};

const obtenerMetodosPago = async (req, res) => {
  try {
    // Usar req.usuario en lugar de decodificar el token nuevamente
    const idUsuario = req.usuario.id;

    const [rows] = await pool.query(
      `SELECT IdMetodo, TitularTarjeta, TipoTarjeta, FechaExpiracion FROM MetodosPago WHERE IdUsuario = ?`,
      [idUsuario]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener métodos:", error);
    res.status(500).json({ mensaje: "Error al obtener métodos de pago" });
  }
};

module.exports = {
  agregarMetodoPago,
  obtenerMetodosPago
};
