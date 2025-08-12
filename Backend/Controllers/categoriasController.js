const pool = require("../Db/connection");

const obtenerCategorias = async (req, res) => {
  try {
    const [categoriasRaw] = await pool.query(
      "SELECT IdCategoria, Nombre FROM Categorias WHERE Activo = 1"
    );
    
    // Convertir a camelCase para el frontend
    const categorias = categoriasRaw.map(cat => ({
      idCategoria: cat.IdCategoria,
      nombre: cat.Nombre
    }));
    
    // Asegurarse de que siempre enviamos un array, incluso si no hay categorías
    res.json(categorias || []);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};


const registrarCategoria = async (req, res) => {
  try {
    const { Nombre } = req.body;
    if (!Nombre) return res.status(400).json({ mensaje: "Nombre requerido" });

    await pool.query("INSERT INTO Categorias (Nombre, Activo) VALUES (?, 1)", [Nombre]);
    res.status(201).json({ mensaje: "Categoría registrada" });
  } catch (error) {
    console.error("❌ Error al registrar categoría:", error);
    res.status(500).json({ mensaje: "Error al registrar" });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const id = req.params.id;
    const { Nombre, Activo } = req.body;
    await pool.query("UPDATE Categorias SET Nombre = ?, Activo = ? WHERE IdCategoria = ?", [Nombre, Activo, id]);
    res.json({ mensaje: "Categoría actualizada" });
  } catch (error) {
    console.error("❌ Error al actualizar categoría:", error);
    res.status(500).json({ mensaje: "Error al actualizar" });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM Categorias WHERE IdCategoria = ?", [id]);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
    res.status(500).json({ mensaje: "Error al eliminar" });
  }
};

const obtenerCategoriaPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query("SELECT Nombre FROM Categorias WHERE IdCategoria = ? AND Activo = 1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    // Convertir a camelCase para el frontend
    res.json({
      nombre: rows[0].Nombre
    });
  } catch (error) {
    console.error("❌ Error al obtener categoría:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const contarCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM categorias");
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al contar categorías' });
  }
};




module.exports = {
  obtenerCategorias,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerCategoriaPorId,
  contarCategorias
};
