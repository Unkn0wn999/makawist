const pool = require("../Db/connection");

const listarCarrito = async (req, res) => {
  const idUsuario = req.usuario.id;
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.IdProducto,
        p.Nombre,
        p.Precio,
        p.ImagenURL,
        c.Cantidad
      FROM Carrito c
      JOIN Productos p ON c.IdProducto = p.IdProducto
      WHERE c.IdUsuario = ?
    `, [idUsuario]);

    // ✅ Convertir precio a número para evitar errores con toFixed
    const productos = rows.map(p => ({
      IdProducto: p.IdProducto,
      Nombre: p.Nombre,
      Precio: Number(p.Precio), // ✅ Conversión segura
      ImagenURL: p.ImagenURL,
      Cantidad: p.Cantidad
    }));

    res.json(productos);
  } catch (error) {
    console.error("❌ Error al listar carrito:", error);
    // Devolver un array vacío en lugar de un objeto de error para evitar problemas con métodos de array
    res.status(500).json([]);
  }
};


const agregarAlCarrito = async (req, res) => {
  const idUsuario = req.usuario.id;
  const { idProducto, cantidad } = req.body;

  try {
    // Si ya existe, actualiza la cantidad
    await pool.query(`
      INSERT INTO Carrito (IdUsuario, IdProducto, Cantidad)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Cantidad = Cantidad + VALUES(Cantidad)
    `, [idUsuario, idProducto, cantidad]);

    res.status(201).json({ mensaje: "Producto agregado al carrito" });
  } catch (error) {
    console.error("❌ Error al agregar al carrito:", error);
    res.status(500).json({ mensaje: "Error al agregar al carrito" });
  }
};

const actualizarCantidad = async (req, res) => {
  const idUsuario = req.usuario.id;
  const { idProducto } = req.params;
  const { cantidad } = req.body;

  try {
    await pool.query(`
      UPDATE Carrito 
      SET Cantidad = ?
      WHERE IdUsuario = ? AND IdProducto = ?
    `, [cantidad, idUsuario, idProducto]);

    res.json({ mensaje: "Cantidad actualizada" });
  } catch (error) {
    console.error("❌ Error al actualizar cantidad:", error);
    res.status(500).json({ mensaje: "Error al actualizar cantidad" });
  }
};

const eliminarDelCarrito = async (req, res) => {
  const idUsuario = req.usuario.id;
  const { idProducto } = req.params;

  try {
    await pool.query(`
      DELETE FROM Carrito 
      WHERE IdUsuario = ? AND IdProducto = ?
    `, [idUsuario, idProducto]);

    res.json({ mensaje: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("❌ Error al eliminar del carrito:", error);
    res.status(500).json({ mensaje: "Error al eliminar del carrito" });
  }
};

// Vaciar todo el carrito de un usuario
const vaciarCarrito = async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    await pool.query(`
      DELETE FROM Carrito 
      WHERE IdUsuario = ?
    `, [idUsuario]);

    res.json({ mensaje: "Carrito vaciado con éxito" });
  } catch (error) {
    console.error("❌ Error al vaciar el carrito:", error);
    res.status(500).json({ mensaje: "Error al vaciar el carrito" });
  }
};

// Obtener la cantidad total de productos en el carrito
const obtenerCantidadCarrito = async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    const [result] = await pool.query(`
      SELECT SUM(Cantidad) as cantidad
      FROM Carrito
      WHERE IdUsuario = ?
    `, [idUsuario]);

    const cantidad = result[0].cantidad || 0;
    res.json({ cantidad });
  } catch (error) {
    console.error("❌ Error al obtener cantidad del carrito:", error);
    res.status(500).json({ mensaje: "Error al obtener cantidad del carrito" });
  }
};

// Verificar si un producto está en el carrito del usuario
const verificarProductoEnCarrito = async (req, res) => {
  const idUsuario = req.usuario.id;
  const { producto_id } = req.body;

  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as existe
      FROM Carrito
      WHERE IdUsuario = ? AND IdProducto = ?
    `, [idUsuario, producto_id]);

    const existe = rows[0].existe > 0;
    res.json({ existe });
  } catch (error) {
    console.error("❌ Error al verificar producto en carrito:", error);
    res.status(500).json({ mensaje: "Error al verificar producto en carrito", existe: false });
  }
};

module.exports = {
  listarCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  obtenerCantidadCarrito,
  verificarProductoEnCarrito
};
