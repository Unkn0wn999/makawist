const pool = require('../Db/connection');

const Cupon = {
  obtenerActivos: async () => {
    const sql = `
      SELECT * FROM CuponesDescuento
      WHERE Activo = 1
        AND FechaInicio <= CURDATE()
        AND FechaFin >= CURDATE()
      ORDER BY FechaInicio DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  obtenerTodos: async () => {
    const sql = `SELECT * FROM CuponesDescuento ORDER BY FechaInicio DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  obtenerPorCodigo: async (codigo) => {
    const sql = `
      SELECT * FROM CuponesDescuento
      WHERE Codigo = ? AND Activo = 1
        AND FechaInicio <= CURDATE()
        AND FechaFin >= CURDATE()
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [codigo]);
    return rows[0];
  },

  crear: async (cupon) => {
    const sql = `
      INSERT INTO CuponesDescuento
      (Nombre, Codigo, Descuento, FechaInicio, FechaFin, Activo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cupon.Nombre,
      cupon.Codigo,
      cupon.Descuento || 0,
      cupon.FechaInicio,
      cupon.FechaFin,
      cupon.Activo
    ];
    const [result] = await pool.query(sql, values);
    return result.insertId;
  },

  actualizar: async (id, cupon) => {
    const sql = `
      UPDATE CuponesDescuento SET
        Nombre = ?,
        Codigo = ?,
        Descuento = ?,
        FechaInicio = ?,
        FechaFin = ?,
        Activo = ?
      WHERE IdPromocion = ?
    `;
    const values = [
      cupon.Nombre,
      cupon.Codigo,
      cupon.Descuento || 0,
      cupon.FechaInicio,
      cupon.FechaFin,
      cupon.Activo,
      id
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows;
  },

  eliminar: async (id) => {
    const sql = `DELETE FROM CuponesDescuento WHERE IdPromocion = ?`;
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows;
  }
};

module.exports = Cupon;
