const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  const token = authHeader.split(" ")[1]; // ⚠️ Aquí extraemos solo el token

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos; // el objeto decodificado del token
    req.usuarioId = datos.id; // Para mantener compatibilidad con código existente
    next();
  } catch (err) {
    console.error('❌ Error al verificar token:', err);
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
}

module.exports = { verificarToken };
