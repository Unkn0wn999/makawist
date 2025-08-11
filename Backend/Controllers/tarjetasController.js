const pool = require("../Db/connection");

// Registrar nueva tarjeta
const registrarTarjeta = async (req, res) => {
  try {
    const usuarioId = req.usuario.id; // Usar req.usuario.id para mantener consistencia
    const {
      TitularTarjeta,
      NumeroTarjeta,
      FechaExpiracion,
      CVV,
      TipoTarjeta
    } = req.body;

    // Validación de campos requeridos
    if (!TitularTarjeta || !NumeroTarjeta || !FechaExpiracion || !CVV || !TipoTarjeta) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    await pool.query(
      `INSERT INTO MetodosPago (IdUsuario, TitularTarjeta, NumeroTarjeta, FechaExpiracion, Cvv, TipoTarjeta)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, TitularTarjeta, NumeroTarjeta, FechaExpiracion, CVV, TipoTarjeta]
    );

    res.json({ mensaje: "Tarjeta registrada correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar tarjeta:", error);
    res.status(500).json({ mensaje: "Error interno al registrar tarjeta" });
  }
};

// Listar tarjetas
const listarTarjetas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id; // Usar req.usuario.id para mantener consistencia

    const [filas] = await pool.query(
      `SELECT IdMetodo AS IdTarjeta, TitularTarjeta, NumeroTarjeta, FechaExpiracion, TipoTarjeta
       FROM MetodosPago WHERE IdUsuario = ?`,
      [usuarioId]
    );

    res.json(filas);
  } catch (error) {
    console.error("❌ Error al listar tarjetas:", error);
    res.status(500).json({ mensaje: "Error interno al obtener tarjetas" });
  }
};

// Eliminar tarjeta
const eliminarTarjeta = async (req, res) => {
  try {
    const id = req.params.id;
    const usuarioId = req.usuario.id; // Usar req.usuario.id para mantener consistencia

    const [resultado] = await pool.query(
      `DELETE FROM MetodosPago WHERE IdMetodo = ? AND IdUsuario = ?`,
      [id, usuarioId]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Tarjeta no encontrada o no autorizada" });
    }

    res.json({ mensaje: "Tarjeta eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar tarjeta:", error);
    res.status(500).json({ mensaje: "Error interno al eliminar tarjeta" });
  }
};

module.exports = {
  registrarTarjeta,
  listarTarjetas,
  eliminarTarjeta
};
