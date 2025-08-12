const pool = require("../Db/connection");

const contarVentas = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM Ventas");
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error("❌ Error al contar ventas:", error);
    res.status(500).json({ error: "Error al contar ventas" });
  }
};

module.exports = { contarVentas };
