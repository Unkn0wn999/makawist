const pool = require("../Db/connection");

/**
 * Obtener reseñas de un producto
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const obtenerResenasPorProducto = async (req, res) => {
  try {
    const { idProducto } = req.params;

    const [resenas] = await pool.query(`
      SELECT 
        r.IdReseña AS IdResena, 
        r.IdUsuario, 
        r.IdProducto, 
        r.Calificacion, 
        r.Comentario, 
        r.Fecha AS FechaCreacion,
        CONCAT(u.Nombres, ' ', u.Apellidos) AS NombreUsuario
      FROM ReseñasProductos r
      JOIN Usuarios u ON r.IdUsuario = u.IdUsuario
      WHERE r.IdProducto = ?
      ORDER BY r.Fecha DESC
    `, [idProducto]);

    // Transformar los datos para el frontend
    const resenasFormateadas = resenas.map(r => ({
      id: r.IdResena,
      idUsuario: r.IdUsuario,
      idProducto: r.IdProducto,
      calificacion: r.Calificacion,
      comentario: r.Comentario,
      fecha_creacion: r.FechaCreacion,
      nombre_usuario: r.NombreUsuario
    }));

    res.json(resenasFormateadas);
  } catch (error) {
    console.error("❌ Error al obtener reseñas:", error);
    res.status(500).json({ mensaje: "Error al obtener reseñas" });
  }
};

/**
 * Verificar si un usuario ha comprado un producto y puede dejar reseña
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const verificarCompraProducto = async (req, res) => {
  try {
    const { idProducto } = req.params;
    const idUsuario = req.usuario.id;

    // Verificar si el usuario ha comprado y recibido el producto
    const [pedidos] = await pool.query(`
      SELECT COUNT(*) AS comprado
      FROM Pedidos p
      JOIN DetallePedido dp ON p.IdPedido = dp.IdPedido
      WHERE p.IdUsuario = ? 
      AND dp.IdProducto = ? 
      AND p.Estado = 'entregado'
    `, [idUsuario, idProducto]);

    // Verificar si ya ha dejado una reseña
    const [resenaExistente] = await pool.query(`
      SELECT COUNT(*) AS yaComento
      FROM ReseñasProductos
      WHERE IdUsuario = ? AND IdProducto = ?
    `, [idUsuario, idProducto]);

    res.json({
      comprado: pedidos[0].comprado > 0,
      yaComento: resenaExistente[0].yaComento > 0
    });
  } catch (error) {
    console.error("❌ Error al verificar compra:", error);
    res.status(500).json({ mensaje: "Error al verificar compra" });
  }
};

/**
 * Registrar una nueva reseña de producto
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const registrarResena = async (req, res) => {
  try {
    const { idProducto } = req.params;
    const { calificacion, comentario } = req.body;
    const idUsuario = req.usuario.id;

    // Verificar si el usuario ha comprado y recibido el producto
    const [pedidos] = await pool.query(`
      SELECT COUNT(*) AS comprado
      FROM Pedidos p
      JOIN DetallePedido dp ON p.IdPedido = dp.IdPedido
      WHERE p.IdUsuario = ? 
      AND dp.IdProducto = ? 
      AND p.Estado = 'entregado'
    `, [idUsuario, idProducto]);

    if (pedidos[0].comprado === 0) {
      return res.status(403).json({ 
        mensaje: "Solo puedes dejar reseñas de productos que hayas comprado y recibido" 
      });
    }

    // Verificar si ya ha dejado una reseña
    const [resenaExistente] = await pool.query(`
      SELECT COUNT(*) AS yaComento
      FROM ReseñasProductos
      WHERE IdUsuario = ? AND IdProducto = ?
    `, [idUsuario, idProducto]);

    if (resenaExistente[0].yaComento > 0) {
      return res.status(400).json({ 
        mensaje: "Ya has dejado una reseña para este producto" 
      });
    }

    // Registrar la reseña
    await pool.query(`
      INSERT INTO ReseñasProductos (IdUsuario, IdProducto, Calificacion, Comentario, Fecha)
      VALUES (?, ?, ?, ?, NOW())
    `, [idUsuario, idProducto, calificacion, comentario]);

    res.status(201).json({ mensaje: "Reseña registrada correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar reseña:", error);
    res.status(500).json({ mensaje: "Error al registrar reseña" });
  }
};

module.exports = {
  obtenerResenasPorProducto,
  verificarCompraProducto,
  registrarResena
};