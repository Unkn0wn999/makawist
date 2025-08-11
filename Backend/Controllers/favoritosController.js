const pool = require("../Db/connection");

const listarFavoritos = async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    const [rows] = await pool.query(`
      SELECT 
        f.IdProducto AS id,
        p.Nombre AS nombre,
        p.precio,
        p.ImagenURL
      FROM Favoritos f
      JOIN Productos p ON f.IdProducto = p.IdProducto
      WHERE f.IdUsuario = ?
    `, [idUsuario]);

    const favoritos = rows.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      imagen: `/Imagenes/Productos/${p.ImagenURL}`
    }));

    res.json(favoritos);
  } catch (error) {
    console.error("❌ Error al listar favoritos:", error);
    res.status(500).json({ mensaje: "Error al obtener favoritos" });
  }
};


const agregarFavorito = async (req, res) => {
  try {
    const idUsuario = req.usuario.id;
    const { IdProducto } = req.body;

    await pool.query(`INSERT IGNORE INTO Favoritos (IdUsuario, IdProducto) VALUES (?, ?)`, [idUsuario, IdProducto]);
    res.status(201).json({ mensaje: "Agregado a favoritos" });
  } catch (error) {
    console.error("❌ Error al agregar favorito:", error);
    res.status(500).json({ mensaje: "Error al agregar favorito" });
  }
};

const eliminarFavorito = async (req, res) => {
  try {
    const idUsuario = req.usuario.id;
    const { IdProducto } = req.body;

    await pool.query(`DELETE FROM Favoritos WHERE IdUsuario = ? AND IdProducto = ?`, [idUsuario, IdProducto]);
    res.json({ mensaje: "Eliminado de favoritos" });
  } catch (error) {
    console.error("❌ Error al eliminar favorito:", error);
    res.status(500).json({ mensaje: "Error al eliminar favorito" });
  }
};

module.exports = {
  listarFavoritos,
  agregarFavorito,
  eliminarFavorito,
};
