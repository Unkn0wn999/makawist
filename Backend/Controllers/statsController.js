const pool = require("../Db/connection");

exports.obtenerEstadisticas = async (req, res) => {
  try {
    // Ejecutamos todas las consultas en paralelo para optimizar velocidad
    const [
      [usuarios],
      [categorias],
      [productos],
      [ventas],
      [promociones]
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM usuarios"),
      pool.query("SELECT COUNT(*) AS total FROM categorias"),
      pool.query("SELECT COUNT(*) AS total FROM productos"),
      pool.query("SELECT SUM(total) AS total FROM pedidos"),
      pool.query("SELECT COUNT(*) AS total FROM promociones WHERE activa = 1")
    ]);

    res.json({
      usuarios: usuarios[0][0].total,
      categorias: categorias[0][0].total,
      productos: productos[0][0].total,
      totalVentas: ventas[0][0].total || 0,
      promocionesActivas: promociones[0][0].total
    });

  } catch (err) {
    console.error("❌ Error obteniendo estadísticas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};
