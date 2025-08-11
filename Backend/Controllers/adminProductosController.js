const pool = require("../Db/connection");

// 📋 Obtener todos los productos (admin)
const obtenerProductosAdmin = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.IdProducto,
        p.Nombre,
        p.Descripcion,
        p.Precio,
        p.PrecioOferta,
        p.Stock,
        p.ImagenURL,
        p.FechaCaducidad,
        p.Activo,
        p.FechaCreacion,
        c.Nombre AS NombreCategoria,
        p.IdCategoria
      FROM Productos p
      LEFT JOIN Categorias c ON p.IdCategoria = c.IdCategoria
    `);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos admin:", error);
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};

// ➕ Registrar producto
const registrarProducto = async (req, res) => {
  try {
    const {
      Nombre,
      Descripcion,
      Precio,
      PrecioOferta,
      Stock,
      IdCategoria,
      FechaCaducidad
    } = req.body;
    
    // Convert empty string to null for FechaCaducidad
    const fechaCaducidadValue = FechaCaducidad === '' ? null : FechaCaducidad;

    // Obtener el nombre del archivo subido
    let ImagenURL = null;
    if (req.file) {
      ImagenURL = req.file.filename;
    }

    await pool.query(
      `INSERT INTO Productos 
      (Nombre, Descripcion, Precio, PrecioOferta, Stock, ImagenURL, IdCategoria, FechaCaducidad, Activo, FechaCreacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [Nombre, Descripcion, Precio, PrecioOferta, Stock, ImagenURL, IdCategoria, fechaCaducidadValue]
    );

    res.status(201).json({ mensaje: "Producto registrado" });
  } catch (error) {
    console.error("❌ Error al registrar producto:", error);
    res.status(500).json({ mensaje: "Error al registrar producto" });
  }
};

// ✏️ Actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      Nombre,
      Descripcion,
      Precio,
      PrecioOferta,
      Stock,
      IdCategoria,
      Activo,
      FechaCaducidad
    } = req.body;
    
    // Convert empty string to null for FechaCaducidad
    const fechaCaducidadValue = FechaCaducidad === '' ? null : FechaCaducidad;

    // Verificar si hay una nueva imagen
    let ImagenURL = req.body.ImagenURL;
    if (req.file) {
      ImagenURL = req.file.filename;
    }

    await pool.query(
      `UPDATE Productos 
      SET Nombre = ?, Descripcion = ?, Precio = ?, PrecioOferta = ?, Stock = ?, ImagenURL = ?, IdCategoria = ?, Activo = ?, FechaCaducidad = ?
      WHERE IdProducto = ?`,
      [Nombre, Descripcion, Precio, PrecioOferta, Stock, ImagenURL, IdCategoria, Activo, fechaCaducidadValue, id]
    );

    res.json({ mensaje: "Producto actualizado" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ mensaje: "Error al actualizar producto" });
  }
};

// ❌ Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM Productos WHERE IdProducto = ?", [id]);
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ mensaje: "Error al eliminar producto" });
  }
};

module.exports = {
  obtenerProductosAdmin,
  registrarProducto,
  actualizarProducto,
  eliminarProducto
};
