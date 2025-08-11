const jwt = require("jsonwebtoken");

// ⚠️ IMPORTANTE: Este middleware está siendo reemplazado por authMiddleware.js
// Se mantiene temporalmente para compatibilidad, pero se recomienda usar authMiddleware.js
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Objeto completo decodificado del token
    req.usuarioId = decoded.id; // Para mantener compatibilidad con código existente
    next();
  } catch (err) {
    console.error('❌ Error al verificar token:', err);
    res.status(403).json({ mensaje: "Token inválido" });
  }
};
