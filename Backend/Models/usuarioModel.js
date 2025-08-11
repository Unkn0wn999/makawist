// Backend/Models/usuarioModel.js
const pool = require('../Db/connection');

const UsuarioModel = {
  validarLogin: async (correo) => {
    try {
      const [rows] = await pool.query("CALL sp_ValidarLogin(?)", [correo]);

      // Validar que el procedimiento devuelva algo
      if (!rows || !rows[0] || rows[0].length === 0) {
        return null;
      }

      return rows[0][0]; // Retorna el usuario encontrado
    } catch (error) {
      console.error("Error en validarLogin:", error);
      throw error;
    }
  },

  registrar: async (usuario) => {
    try {
      const {
        Nombres,
        Apellidos,
        TipoDocumento,
        NumeroDocumento,
        Correo,
        Contraseña,
        Rol
      } = usuario;

      await pool.query("CALL sp_RegistrarUsuario(?, ?, ?, ?, ?, ?, ?)", [
        Nombres,
        Apellidos,
        TipoDocumento,
        NumeroDocumento,
        Correo,
        Contraseña,
        Rol
      ]);
    } catch (error) {
      console.error("Error en registrar usuario (usuarioModel.js):", error);
      throw error;
    }
  }
};

module.exports = UsuarioModel;
