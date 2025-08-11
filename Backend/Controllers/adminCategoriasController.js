const pool = require("../Db/connection");

// 🟢 Listar todas las categorías
const obtenerCategoriasAdmin = async (req, res) => {
  try {
    const [categorias] = await pool.query("SELECT IdCategoria, Nombre, Activo FROM Categorias");
    res.json(categorias);
  } catch (error) {
    console.error("❌ Error al obtener categorías admin:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// ➕ Registrar categoría
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

// ✏️ Editar categoría
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

// ❌ Eliminar categoría
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

module.exports = {
  obtenerCategoriasAdmin,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
