const pool = require("../Db/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 🔐 PERFIL DE USUARIO (CLIENTE)
const obtenerPerfil = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded); // Para depuración

    const [result] = await pool.query(
      `SELECT Nombres, Apellidos, Correo, TipoDocumento, NumeroDocumento, FechaRegistro 
       FROM Usuarios WHERE IdUsuario = ?`,
      [decoded.userId || decoded.id]
    );

    if (result.length === 0)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    console.log('Datos del usuario encontrados:', result[0]); // Para depuración
    res.json(result[0]);
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ mensaje: "Error al obtener perfil" });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado en actualizarPerfil:', decoded); // Para depuración
    const { Nombres, Apellidos, Correo } = req.body;
    console.log('Datos recibidos para actualizar:', req.body); // Para depuración

    await pool.query(
      `UPDATE Usuarios SET Nombres = ?, Apellidos = ?, Correo = ? WHERE IdUsuario = ?`,
      [Nombres, Apellidos, Correo, decoded.userId || decoded.id]
    );

    res.json({ mensaje: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ mensaje: "Error al actualizar perfil" });
  }
};

const cambiarClave = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado en cambiarClave:', decoded); // Para depuración
    const { actual, nueva } = req.body;
    console.log('Datos recibidos para cambiar clave:', { actual: '***', nueva: '***' }); // Para depuración

    const [usuarios] = await pool.query("SELECT Contraseña FROM Usuarios WHERE IdUsuario = ?", [decoded.userId || decoded.id]);
    if (usuarios.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const contraseñaActualHash = usuarios[0].Contraseña;

    const coincide = await bcrypt.compare(actual, contraseñaActualHash);
    if (!coincide) return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });

    // ✅ Validar que la nueva no sea igual a la actual
    const mismaClave = await bcrypt.compare(nueva, contraseñaActualHash);
    if (mismaClave) {
      return res.status(400).json({ mensaje: "La nueva contraseña no puede ser igual a la actual" });
    }

    const hashNueva = await bcrypt.hash(nueva, 10);
    await pool.query("UPDATE Usuarios SET Contraseña = ? WHERE IdUsuario = ?", [hashNueva, decoded.userId || decoded.id]);

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al cambiar clave:", error);
    res.status(500).json({ mensaje: "Error al cambiar contraseña" });
  }
};


// 📊 DASHBOARD: ADMINISTRACIÓN
const listarUsuarios = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT IdUsuario, Nombres, Apellidos, Correo, TipoDocumento, NumeroDocumento, Rol, FechaRegistro, Activo
       FROM Usuarios ORDER BY FechaRegistro DESC`
    );
    res.json(result);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Usuarios WHERE IdUsuario = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({ mensaje: "Error al obtener usuario" });
  }
};

const registrarUsuario = async (req, res) => {
  try {
    const { Nombres, Apellidos, Correo, TipoDocumento, NumeroDocumento, Rol, Contraseña } = req.body;

    if (!Nombres || !Apellidos || !Correo || !Rol || !Contraseña) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    if (TipoDocumento === "DNI" && (!NumeroDocumento || NumeroDocumento.length !== 8)) {
      return res.status(400).json({ mensaje: "DNI debe tener 8 dígitos" });
    }

    if (TipoDocumento === "RUC" && (!NumeroDocumento || NumeroDocumento.length !== 11)) {
      return res.status(400).json({ mensaje: "RUC debe tener 11 dígitos" });
    }

    if (TipoDocumento === "CE" && (!NumeroDocumento || NumeroDocumento.length < 8)) {
      return res.status(400).json({ mensaje: "Carnet de Extranjería inválido" });
    }

    const [existente] = await pool.query("SELECT IdUsuario FROM Usuarios WHERE Correo = ?", [Correo]);
    if (existente.length > 0) {
      return res.status(409).json({ mensaje: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(Contraseña, 10);

    await pool.query(
      `INSERT INTO Usuarios (Nombres, Apellidos, Correo, TipoDocumento, NumeroDocumento, Rol, Contraseña, Activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [Nombres, Apellidos, Correo, TipoDocumento, NumeroDocumento, Rol, hash]
    );

    res.status(201).json({ mensaje: "Usuario creado correctamente" });
  } catch (error) {
  console.error("❌ Error al registrar usuario:", error);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ mensaje: "El correo ya está registrado", code: "ER_DUP_ENTRY" });
  }

  res.status(500).json({ mensaje: "Error al registrar usuario" });
}
};

const actualizarUsuario = async (req, res) => {
  try {
    const { Nombres, Apellidos, Correo, Rol, Activo, TipoDocumento, NumeroDocumento } = req.body;

    if (!Nombres || !Apellidos || !Correo || !Rol) {
      return res.status(400).json({ mensaje: "Campos requeridos faltantes" });
    }

    await pool.query(
      `UPDATE Usuarios 
       SET Nombres = ?, Apellidos = ?, Correo = ?, Rol = ?, Activo = ?, TipoDocumento = ?, NumeroDocumento = ?
       WHERE IdUsuario = ?`,
      [Nombres, Apellidos, Correo, Rol, Activo ?? 1, TipoDocumento, NumeroDocumento, req.params.id]
    );

    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    await pool.query("DELETE FROM Usuarios WHERE IdUsuario = ?", [req.params.id]);
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ mensaje: "Error al eliminar usuario" });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    await pool.query("UPDATE Usuarios SET Activo = ? WHERE IdUsuario = ?", [activo, id]);

    res.json({ mensaje: "Estado de usuario actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al cambiar estado de usuario:", error);
    res.status(500).json({ mensaje: "Error al cambiar estado de usuario" });
  }
};

// ✅ EXPORTAR TODO
module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarClave,
  listarUsuarios,
  obtenerUsuario,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario
};
