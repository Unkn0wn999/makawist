const pool = require('../Db/connection');

exports.listarPromociones = async (req, res) => {
  try {
    const [promos] = await pool.query("SELECT * FROM Promociones ORDER BY IdPromocion DESC");
    res.json(promos);
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error);
    res.status(500).json({ mensaje: "Error al obtener promociones" });
  }
};

exports.crearPromocion = async (req, res) => {
  try {
    const { Nombre, Codigo, Descuento, FechaInicio, FechaFin, Activo } = req.body;
    await pool.query(
      "INSERT INTO Promociones (Nombre, Codigo, Descuento, FechaInicio, FechaFin, Activo) VALUES (?, ?, ?, ?, ?, ?)",
      [Nombre, Codigo, Descuento, FechaInicio, FechaFin, Activo]
    );
    res.status(201).json({ mensaje: "Promoción creada exitosamente" });
  } catch (error) {
    console.error("❌ Error al registrar promoción:", error);
    res.status(500).json({ mensaje: "Error al registrar promoción" });
  }
};

exports.actualizarPromocion = async (req, res) => {
  try {
    const id = req.params.id;
    const { Nombre, Codigo, Descuento, FechaInicio, FechaFin, Activo } = req.body;

    await pool.query(
      "UPDATE Promociones SET Nombre=?, Codigo=?, Descuento=?, FechaInicio=?, FechaFin=?, Activo=? WHERE IdPromocion=?",
      [Nombre, Codigo, Descuento, FechaInicio, FechaFin, Activo, id]
    );
    res.status(200).json({ mensaje: "Promoción actualizada exitosamente" });
  } catch (error) {
    console.error("❌ Error al actualizar promoción:", error);
    res.status(500).json({ mensaje: "Error al actualizar promoción" });
  }
};

exports.eliminarPromocion = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM Promociones WHERE IdPromocion = ?", [id]);
    res.status(200).json({ mensaje: "Promoción eliminada exitosamente" });
  } catch (error) {
    console.error("❌ Error al eliminar promoción:", error);
    res.status(500).json({ mensaje: "Error al eliminar promoción" });
  }
};
