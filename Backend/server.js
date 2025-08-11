require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 📦 Importar rutas
const authRoutes = require('./Routes/authRoutes');
const productosRoutes = require('./Routes/productosRoutes'); // ✅ Catálogo
const pedidosRoutes = require('./Routes/pedidosRoutes'); // 🛒 Pedidos
const categoriasRoutes = require('./Routes/categoriasRoutes'); // 📁 Categorías
const carritoRoutes = require('./Routes/carritoRoutes'); // 🛒 Carrito
const favoritosRoutes = require('./Routes/favoritosRoutes'); // ❤️ Favoritos
const direccionesRoutes = require('./Routes/direccionesRoutes'); // 📍 Direcciones
const usuariosRoutes = require('./Routes/usuariosRoutes'); // 👤 Usuarios
const metodosPagoRoutes = require('./Routes/metodosPagoRoutes'); // 💳 Métodos de pago
const tarjetasRoutes = require('./Routes/tarjetasRoutes'); // 💳 Tarjetas
const dashboardRoutes = require('./Routes/dashboardRoutes'); // 📊 Dashboard
const adminCategoriasRoutes = require('./Routes/adminCategoriasRoutes'); // 📁 Admin Categorías
const adminProductosRoutes = require('./Routes/adminProductosRoutes'); // 📦 Admin Productos
const adminPromocionesRoutes = require('./Routes/adminPromocionesRoutes'); // 🏷️ Admin Promociones
const recompensasRoutes = require('./Routes/recompensasRoutes'); // 🎁 Recompensas
const resenasRoutes = require('./Routes/resenasRoutes'); // ⭐ Reseñas de productos

// 🛡️ Middlewares
app.use(cors());
app.use(express.json());

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, '..')));
console.log('📂 Sirviendo archivos estáticos desde:', path.join(__dirname, '..'));

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

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('❌ Error en middleware:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// 🔗 Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
// Registrar rutas de pedidos con más detalle de logs
console.log('🔄 Registrando rutas de pedidos...');
app.use('/api/pedidos', pedidosRoutes);
console.log('✅ Rutas de pedidos registradas');
app.use('/api/categorias', categoriasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/tarjetas', tarjetasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/categorias', adminCategoriasRoutes);
app.use('/api/admin/productos', adminProductosRoutes);
app.use('/api/admin/promociones', adminPromocionesRoutes);
app.use('/api', recompensasRoutes); // Ruta para recompensas

// La ruta específica para categorías ahora se maneja a través de categoriasRoutes

// Comentamos la ruta específica para carrito y usamos solo carritoRoutes
// para evitar conflictos de rutas

// Mantener la ruta original para otras operaciones
app.use('/api/carrito', carritoRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/direcciones', direccionesRoutes);
app.use('/api/resenas', resenasRoutes); // ⭐ Rutas para reseñas de productos

// Ruta para manejar la página principal
app.get('/', (req, res) => {
  console.log('🏠 Solicitud a la página principal');
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 🖼️ Archivos estáticos públicos
app.use('/Css', express.static(path.join(__dirname, '../Css')));
app.use('/Js', express.static(path.join(__dirname, '../Js')));
app.use('/Imagenes', express.static(path.join(__dirname, '../Imagenes'))); // ✅ NECESARIO para mostrar productos

// Servir archivos HTML desde el directorio raíz
app.use(express.static(path.join(__dirname, '..')));

// Rutas para vistas del panel de administración
app.get('/admin/categorias', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Admin', 'secciones', 'categorias.html'));
});

app.get('/admin/productos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Admin', 'secciones', 'productos.html'));
});

// Rutas para vistas públicas
app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'productos.html'));
});

app.get('/promociones', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'recompensas.html')); // promociones se ve como recompensas.html
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

// 📡 Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
