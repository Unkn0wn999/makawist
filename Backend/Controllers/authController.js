require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../Db/connection");

// Configuración del transporter para enviar correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generar JWT
function generarToken(usuario) {
  console.log('Generando token para usuario:', { IdUsuario: usuario.IdUsuario, Rol: usuario.Rol, Nombres: usuario.Nombres });
  return jwt.sign(
    { userId: usuario.IdUsuario, id: usuario.IdUsuario, rol: usuario.Rol, nombre: usuario.Nombres },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

// Verificar y decodificar token
function verificarToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// LOGIN
const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    console.log("📥 Datos recibidos:", { correo, password });

    const [resultado] = await pool.query(
      "SELECT IdUsuario, Nombres, Rol, Contraseña, Activo FROM Usuarios WHERE Correo = ?",
      [correo]
    );

    const usuario = resultado[0];

    if (!usuario || usuario.Activo !== 1) {
      return res.status(401).json({ mensaje: "Usuario inactivo o no encontrado" });
    }

    const passwordValido = await bcrypt.compare(password, usuario.Contraseña);

    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    const token = generarToken(usuario);
    console.log("✅ Login exitoso");

    res.json({
      token,
      nombre: usuario.Nombres,
      rol: usuario.Rol
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ mensaje: "Error del servidor", error: error.message });
  }
};

// REGISTER
const register = async (req, res) => {
  const { nombres, apellidos, tipoDocumento, numeroDocumento, correo, password } = req.body;

  try {
    const [usuarios] = await pool.query("SELECT IdUsuario FROM Usuarios WHERE Correo = ?", [correo]);
    if (usuarios.length > 0) {
      return res.status(409).json({ mensaje: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO Usuarios 
      (Nombres, Apellidos, TipoDocumento, NumeroDocumento, Correo, Contraseña, Rol, Activo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, tipoDocumento, numeroDocumento, correo, hash, "cliente", 1]
    );

    const [usuarioRes] = await pool.query(
      "SELECT IdUsuario, Nombres, Rol FROM Usuarios WHERE Correo = ?", [correo]
    );

    const usuario = usuarioRes[0];
    const token = generarToken(usuario);

    res.status(201).json({
      mensaje: "Usuario registrado con éxito",
      token,
      nombre: usuario.Nombres,
      rol: usuario.Rol
    });

  } catch (error) {
    console.error("❌ Error en register:", error);
    res.status(500).json({ mensaje: "Error al registrar el usuario", error: error.message });
  }
};

// FORGOT PASSWORD - Solicitar recuperación
const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    // Verificar si el correo existe
    const [usuarios] = await pool.query("SELECT IdUsuario FROM Usuarios WHERE Correo = ?", [correo]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: "No existe una cuenta con este correo electrónico" });
    }

    const usuario = usuarios[0];
    
    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + 1); // Token válido por 1 hora
    
    // Eliminar tokens anteriores para este usuario
    await pool.query("DELETE FROM password_resets WHERE IdUsuario = ?", [usuario.IdUsuario]);
    
    // Guardar el token en la base de datos
    await pool.query(
      "INSERT INTO password_resets (IdUsuario, Token, ExpiraEn) VALUES (?, ?, ?)",
      [usuario.IdUsuario, token, expiraEn]
    );
    
    // Enviar correo con el enlace de recuperación
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/reset-password.html?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Recuperación de contraseña - Makawi Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF69B4;">Recuperación de contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #FF69B4; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a></p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo de Makawi Store</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ mensaje: "Se ha enviado un enlace de recuperación a tu correo electrónico" });
    
  } catch (error) {
    console.error("❌ Error en forgotPassword:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud", error: error.message });
  }
};

// RESET PASSWORD - Restablecer contraseña
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  try {
    // Verificar si el token existe y no ha expirado
    const [resets] = await pool.query(
      "SELECT IdUsuario, ExpiraEn FROM password_resets WHERE Token = ?", 
      [token]
    );
    
    if (resets.length === 0) {
      return res.status(400).json({ mensaje: "El enlace de recuperación es inválido o ha expirado" });
    }
    
    const reset = resets[0];
    const now = new Date();
    
    if (now > new Date(reset.ExpiraEn)) {
      // Eliminar token expirado
      await pool.query("DELETE FROM password_resets WHERE Token = ?", [token]);
      return res.status(400).json({ mensaje: "El enlace de recuperación ha expirado" });
    }
    
    // Actualizar contraseña
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE Usuarios SET Contraseña = ? WHERE IdUsuario = ?",
      [hash, reset.IdUsuario]
    );
    
    // Eliminar token usado
    await pool.query("DELETE FROM password_resets WHERE Token = ?", [token]);
    
    res.json({ mensaje: "Contraseña actualizada con éxito" });
    
  } catch (error) {
    console.error("❌ Error en resetPassword:", error);
    res.status(500).json({ mensaje: "Error al restablecer la contraseña", error: error.message });
  }
};

// REFRESH TOKEN - Renovar token
const refreshToken = async (req, res) => {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: "Token no proporcionado" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verificar y decodificar el token
    const decoded = verificarToken(token);
    if (!decoded) {
      return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
    
    // Obtener información del usuario desde la base de datos
    const [usuarios] = await pool.query(
      "SELECT IdUsuario, Nombres, Rol, Activo FROM Usuarios WHERE IdUsuario = ?",
      [decoded.id]
    );
    
    if (usuarios.length === 0 || usuarios[0].Activo !== 1) {
      return res.status(401).json({ mensaje: "Usuario inactivo o no encontrado" });
    }
    
    const usuario = usuarios[0];
    
    // Generar un nuevo token
    const nuevoToken = generarToken(usuario);
    
    // Enviar el nuevo token
    res.json({
      token: nuevoToken,
      nombre: usuario.Nombres,
      rol: usuario.Rol
    });
    
  } catch (error) {
    console.error("❌ Error en refreshToken:", error);
    res.status(500).json({ mensaje: "Error del servidor", error: error.message });
  }
};

module.exports = { login, register, forgotPassword, resetPassword, refreshToken };
