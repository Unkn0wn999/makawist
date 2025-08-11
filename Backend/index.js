// ⚠️ IMPORTANTE: Este archivo está siendo reemplazado por server.js
// Se mantiene temporalmente para compatibilidad, pero se recomienda usar server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const categoriasRoutes = require("./Routes/categoriasRoutes");

// Configurar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para registrar todas las solicitudes HTTP
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Middleware para capturar la respuesta
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`🔄 Respuesta para ${req.method} ${req.url}:`, typeof body === 'string' ? body.substring(0, 100) : '[No es string]');
    return originalSend.call(this, body);
  };
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..'))); // frontend raíz
app.use('/Imagenes', express.static(path.join(__dirname, '..', 'Imagenes')));
app.use('/Admin', express.static(path.join(__dirname, '..', 'Admin')));

// Rutas API
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/productos', require('./Routes/productosRoutes'));
app.use('/api/categorias', require('./Routes/categoriasRoutes'));
app.use('/api/usuarios', require('./Routes/usuariosRoutes'));
app.use('/api/metodos-pago', require('./Routes/metodosPagoRoutes'));
app.use('/api/tarjetas', require('./Routes/tarjetasRoutes'));
app.use('/api/dashboard', require('./Routes/dashboardRoutes'));

const carritoRoutes = require('./Routes/carritoRoutes');
app.use('/api/carrito', carritoRoutes);


const favoritosRoutes = require("./Routes/favoritosRoutes");
app.use("/api/favoritos", favoritosRoutes);
// Importar rutas de pedidos
const pedidosRoutes = require('./Routes/pedidosRoutes');
// Registrar rutas de pedidos
app.use('/api/pedidos', pedidosRoutes);
// app.use("/api/detalles-pedido", require("./Routes/detallesPedidoRoutes"));

const direccionesRoutes = require('./Routes/direccionesRoutes');
app.use("/api/direcciones", direccionesRoutes);


app.use("/api/admin/categorias", require("./Routes/adminCategoriasRoutes"));

const statsRoutes = require('./Routes/statsRoutes'); // asegúrate que la ruta esté bien
app.use('/api', statsRoutes); // Así tus endpoints serán accesibles como /api/usuarios/total, etc.

// ✅ Vista del dashboard: Categorías
app.get('/admin/categorias', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Admin', 'secciones', 'categorias.html'));
});

app.use('/Admin', express.static(path.join(__dirname, '../Admin')));

app.use("/api/admin/productos", require("./Routes/adminProductosRoutes"));

app.get('/admin/productos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Admin', 'secciones', 'productos.html'));
});


const adminPromocionesRoutes = require('./Routes/adminPromocionesRoutes');
app.use('/api/admin/promociones', adminPromocionesRoutes);


// Vistas públicas (no API)
app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'productos.html'));
});

app.get('/promociones', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'recompensas.html')); // promociones se ve como recompensas.html
});

const recompensasRoutes = require("./Routes/cuponesRoutes");
app.use("/api", recompensasRoutes);

// Rutas para reseñas de productos
const resenasRoutes = require("./Routes/resenasRoutes");
app.use("/api/resenas", resenasRoutes);

const cuponesRoutes = require('./Routes/cuponesRoutes');
app.use('/api/cupones', cuponesRoutes);


// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('❌ Error en middleware:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Manejo de errores global para ver problemas de conexión a la base de datos
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Registrar el error pero no cerrar el servidor
});

// Verificar conexión a la base de datos
const pool = require('./Db/connection');
pool.query('SELECT 1')
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente');
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err);
  });


// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
