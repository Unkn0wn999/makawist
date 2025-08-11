const pool = require("../Db/connection");

// Obtener todas las direcciones del usuario
exports.listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM DireccionesEnvio WHERE IdUsuario = ? ORDER BY IdDireccion DESC",
      [req.usuario.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al listar direcciones:", error);
    res.status(500).json({ mensaje: "Error al obtener direcciones" });
  }
};

// Agregar nueva dirección
exports.agregar = async (req, res) => {
  const { Direccion, Ciudad, Departamento, CodigoPostal, Referencia } = req.body;

  if (!Direccion) {
    return res.status(400).json({ mensaje: "El campo 'Direccion' es obligatorio." });
  }

  try {
    await pool.query(
      `INSERT INTO DireccionesEnvio (IdUsuario, Direccion, Ciudad, Departamento, CodigoPostal, Referencia) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, Direccion, Ciudad, Departamento, CodigoPostal, Referencia]
    );
    res.json({ mensaje: "Dirección registrada correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar dirección:", error);
    res.status(500).json({ mensaje: "Error al registrar dirección" });
  }
};

// Actualizar una dirección
exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { Direccion, Ciudad, Departamento, CodigoPostal, Referencia } = req.body;

  try {
    const [resultado] = await pool.query(
      `UPDATE DireccionesEnvio 
       SET Direccion = ?, Ciudad = ?, Departamento = ?, CodigoPostal = ?, Referencia = ?
       WHERE IdDireccion = ? AND IdUsuario = ?`,
      [Direccion, Ciudad, Departamento, CodigoPostal, Referencia, id, req.usuario.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Dirección no encontrada o no autorizada" });
    }

    res.json({ mensaje: "Dirección actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar dirección:", error);
    res.status(500).json({ mensaje: "Error al actualizar dirección" });
  }
};

// Eliminar una dirección
exports.eliminar = async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.query(
      "DELETE FROM DireccionesEnvio WHERE IdDireccion = ? AND IdUsuario = ?",
      [id, req.usuario.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Dirección no encontrada o no autorizada" });
    }

    res.json({ mensaje: "Dirección eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar dirección:", error);
    res.status(500).json({ mensaje: "Error al eliminar dirección" });
  }
};
