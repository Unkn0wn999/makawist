const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.DB_URL) {
  // Conexión usando URL completa (Railway)
  pool = mysql.createPool(process.env.DB_URL);
} else {
  // Conexión local tradicional
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'makawistbd',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Verificar conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos verificada');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error al verificar la conexión a la base de datos:', err);
  });

module.exports = pool;
