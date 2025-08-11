const pool = require("../Db/connection");

// 📦 PARA CLIENTES (catálogo)
const obtenerProductos = async (req, res) => {
  try {
    // Verificar si hay filtro por categoría
    const idCategoria = req.query.categoria;
    
    let query = `
      SELECT 
        p.IdProducto, p.Nombre, p.Descripcion, p.Precio, p.PrecioOferta,
        p.Stock, p.ImagenURL, c.Nombre AS NombreCategoria, p.IdCategoria
      FROM Productos p
      JOIN Categorias c ON p.IdCategoria = c.IdCategoria
      WHERE p.Activo = 1
    `;
    
    // Añadir filtro por categoría si se especifica
    const params = [];
    if (idCategoria) {
      query += ` AND p.IdCategoria = ?`;
      params.push(idCategoria);
    }
    
    const [productosRaw] = await pool.query(query, params);

    // 🔁 Convertimos los nombres de campos a camelCase para el frontend
    const productos = productosRaw.map(p => {
      // Creamos el objeto base del producto
      const producto = {
        idProducto: p.IdProducto,
        nombre: p.Nombre,
        descripcion: p.Descripcion,
        precio: p.Precio,
        stock: p.Stock,
        imagen: `/Imagenes/Productos/${p.ImagenURL}`, // ✅ Ruta absoluta para frontend
        categoria: p.NombreCategoria,
        idCategoria: p.IdCategoria // Añadimos el ID de categoría para el filtrado en frontend
      };
      
      // Solo añadimos precioOferta si existe y es mayor que 0
      if (p.PrecioOferta && p.PrecioOferta > 0 && p.PrecioOferta < p.Precio) {
        producto.precioOferta = p.PrecioOferta;
      }
      
      return producto;
    });

    // Asegurarse de que siempre enviamos un array, incluso si no hay productos
    res.json(productos || []);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// 📋 PARA DASHBOARD
const listarProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.IdProducto, p.Nombre, p.Descripcion, p.precio, p.precio_oferta AS PrecioOferta, 
        p.Stock, p.ImagenURL, p.IdCategoria,
        p.Activo, p.FechaCaducidad, p.FechaCreacion, 
        c.Nombre AS NombreCategoria
      FROM Productos p
      JOIN Categorias c ON p.IdCategoria = c.IdCategoria
    `);
    res.json(productos); // ⚠️ Aquí se mantienen los campos tal cual para uso en dashboard (administrador)
  } catch (error) {
    console.error("❌ Error al listar productos:", error);
    res.status(500).json({ mensaje: "Error al listar productos" });
  }
};

// 🆕 Registrar producto
const registrarProducto = async (req, res) => {
  try {
    const {
      Nombre, Descripcion, precio, PrecioOferta,
      Stock, ImagenURL, IdCategoria, FechaCaducidad
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO Productos 
      (Nombre, Descripcion, precio, precio_oferta, Stock, ImagenURL, IdCategoria, FechaCaducidad, Activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [Nombre, Descripcion, precio, PrecioOferta, Stock, ImagenURL, IdCategoria, FechaCaducidad]);

    res.json({ mensaje: "Producto registrado correctamente", id: result.insertId });
  } catch (error) {
    console.error("❌ Error al registrar producto:", error);
    res.status(500).json({ mensaje: "Error al registrar producto" });
  }
};

// 📝 Actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Nombre, Descripcion, precio, PrecioOferta,
      Stock, ImagenURL, IdCategoria, FechaCaducidad, Activo
    } = req.body;

    await pool.query(`
      UPDATE Productos SET 
        Nombre = ?, Descripcion = ?, precio = ?, precio_oferta = ?,
        Stock = ?, ImagenURL = ?, IdCategoria = ?, FechaCaducidad = ?, Activo = ?
      WHERE IdProducto = ?
    `, [Nombre, Descripcion, precio, PrecioOferta, Stock, ImagenURL, IdCategoria, FechaCaducidad, Activo, id]);

    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ mensaje: "Error al actualizar producto" });
  }
};

// 🗑️ Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Productos WHERE IdProducto = ?", [id]);
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ mensaje: "Error al eliminar producto" });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        p.IdProducto, p.Nombre, p.Descripcion, p.Precio, p.PrecioOferta,
        p.Stock, p.ImagenURL, c.Nombre AS NombreCategoria, p.IdCategoria
      FROM Productos p
      JOIN Categorias c ON p.IdCategoria = c.IdCategoria
      WHERE p.IdProducto = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const p = rows[0];
    // Creamos el objeto base del producto
    const producto = {
      idProducto: p.IdProducto,
      nombre: p.Nombre,
      descripcion: p.Descripcion,
      precio: p.Precio,
      stock: p.Stock,
      imagen: `/Imagenes/Productos/${p.ImagenURL}`,
      categoria: p.NombreCategoria,
      idCategoria: p.IdCategoria // Añadimos el ID de categoría para el filtrado en frontend
    };
    
    // Solo añadimos precioOferta si existe y es mayor que 0
    if (p.PrecioOferta && p.PrecioOferta > 0 && p.PrecioOferta < p.Precio) {
      producto.precioOferta = p.PrecioOferta;
    }

    res.json(producto);
  } catch (err) {
    console.error("❌ Error al obtener producto:", err);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};




// 🆕 Obtener productos nuevos (los últimos agregados)
const obtenerProductosNuevos = async (req, res) => {
  try {
    console.log('📦 Obteniendo productos nuevos...');
    // Obtenemos los productos más recientes (limitado a 3)
    const [productosRaw] = await pool.query(`
      SELECT 
        p.IdProducto, p.Nombre, p.Descripcion, p.Precio, p.PrecioOferta,
        p.Stock, p.ImagenURL, c.Nombre AS NombreCategoria, p.IdCategoria, p.FechaCreacion
      FROM Productos p
      JOIN Categorias c ON p.IdCategoria = c.IdCategoria
      WHERE p.Activo = 1
      ORDER BY p.IdProducto DESC
      LIMIT 3
    `);

    // 🔁 Convertimos los nombres de campos a camelCase para el frontend
    const productos = productosRaw.map(p => {
      // Creamos el objeto base del producto
      const producto = {
        idProducto: p.IdProducto,
        nombre: p.Nombre,
        descripcion: p.Descripcion,
        precio: p.Precio,
        stock: p.Stock,
        imagen: `/Imagenes/Productos/${p.ImagenURL}`, // ✅ Ruta absoluta para frontend
        categoria: p.NombreCategoria,
        idCategoria: p.IdCategoria,
        fechaCreacion: p.FechaCreacion
      };
      
      // Solo añadimos precioOferta si existe y es mayor que 0
      if (p.PrecioOferta && p.PrecioOferta > 0 && p.PrecioOferta < p.Precio) {
        producto.precioOferta = p.PrecioOferta;
      }
      
      return producto;
    });

    // Asegurarse de que siempre enviamos un array, incluso si no hay productos
    res.json(productos || []);
  } catch (error) {
    console.error("❌ Error al obtener productos nuevos:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

module.exports = {
  obtenerProductos,
  listarProductos,
  registrarProducto,
  actualizarProducto,
  obtenerProductoPorId,
  eliminarProducto,
  obtenerProductosNuevos
};
