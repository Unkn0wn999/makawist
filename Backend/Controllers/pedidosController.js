const pool = require("../Db/connection");
const { v4: uuidv4 } = require('uuid');

const listarPedidos = async (req, res) => {
  // Obtener el ID del usuario desde el token (puede ser IdUsuario o id dependiendo de la implementación)
  const idUsuario = req.usuario?.IdUsuario || req.usuario?.id;

  if (!idUsuario) {
    return res.status(400).json({ 
      exito: false, 
      mensaje: 'No se pudo identificar al usuario' 
    });
  }

  try {
    const [result] = await pool.query(
      "SELECT IdPedido, FechaPedido, Total, Estado FROM Pedidos WHERE IdUsuario = ? ORDER BY FechaPedido DESC",
      [idUsuario]
    );

    res.json({
      exito: true,
      pedidos: result || []
    });
  } catch (err) {
    console.error("❌ Error al listar pedidos:", err);
    res.status(500).json({ 
      exito: false, 
      mensaje: "Error al obtener pedidos", 
      error: err.message 
    });
  }
};

/**
 * Crear un nuevo pedido
 */
const crearPedido = async (req, res) => {
  try {
    const { cliente, productos, metodoPago, detallesPago, total } = req.body;
    // Obtener el ID del usuario desde el token (puede ser IdUsuario o id dependiendo de la implementación)
    const idUsuario = req.usuario?.IdUsuario || req.usuario?.id;
    
    // Validar datos requeridos
    if (!cliente || !productos || !metodoPago || !total) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'Faltan datos requeridos para el pedido' 
      });
    }
    
    // Generar número de pedido único
    const numeroPedido = `ORD-${Date.now().toString().slice(-6)}`;
    const fechaPedido = new Date();
    
    // Iniciar una transacción para asegurar la integridad de los datos
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Verificar si el usuario tiene una dirección de envío
      const [direcciones] = await connection.query(
        "SELECT IdDireccion FROM DireccionesEnvio WHERE IdUsuario = ? LIMIT 1",
        [idUsuario]
      );
      
      let idDireccion;
      
      if (direcciones.length === 0) {
        // Si no tiene dirección, crear una nueva con los datos del cliente
        const [resultDireccion] = await connection.query(
          "INSERT INTO DireccionesEnvio (IdUsuario, Direccion, Ciudad, Departamento, CodigoPostal, Referencia) VALUES (?, ?, ?, ?, ?, ?)",
          [idUsuario, cliente.direccion, cliente.ciudad || '', cliente.departamento || '', cliente.codigoPostal || '', cliente.referencia || '']
        );
        idDireccion = resultDireccion.insertId;
      } else {
        idDireccion = direcciones[0].IdDireccion;
      }
      
      // Insertar el pedido
      const [resultPedido] = await connection.query(
        "INSERT INTO Pedidos (IdUsuario, IdDireccion, FechaPedido, Estado, Total, MetodoPago) VALUES (?, ?, ?, ?, ?, ?)",
        [idUsuario, idDireccion, fechaPedido, 'pendiente', total, metodoPago]
      );
      
      const idPedido = resultPedido.insertId;
      
      // Insertar los detalles del pedido
      for (const producto of productos) {
        const idProducto = producto.IdProducto || producto.idProducto;
        const cantidad = producto.Cantidad || producto.cantidad || 1;
        const precioUnitario = producto.precioUnitario || producto.Precio || producto.precio || 0;
        const descuento = producto.Descuento || producto.descuento || 0;
        
        console.log('Producto a insertar:', { idProducto, cantidad, precioUnitario, descuento });
        
        await connection.query(
          "INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, PrecioUnitario, Descuento) VALUES (?, ?, ?, ?, ?)",
          [idPedido, idProducto, cantidad, precioUnitario, descuento]
        );
      }
      
      // Si tenemos el ID del usuario, eliminar los productos del carrito que fueron comprados
      if (idUsuario) {
        try {
          // Obtener los IDs de los productos comprados
          const productosIds = productos.map(producto => {
            return producto.IdProducto || producto.idProducto;
          }).filter(id => id); // Filtrar cualquier ID undefined o null
          
          if (productosIds.length > 0) {
            // Eliminar estos productos del carrito del usuario
            if (productosIds.length === 1) {
              await connection.query(
                "DELETE FROM Carrito WHERE IdUsuario = ? AND IdProducto = ?",
                [idUsuario, productosIds[0]]
              );
            } else {
              const placeholders = productosIds.map(() => '?').join(',');
              await connection.query(
                `DELETE FROM Carrito WHERE IdUsuario = ? AND IdProducto IN (${placeholders})`,
                [idUsuario, ...productosIds]
              );
            }
            
            console.log(`✅ Productos eliminados del carrito después de la compra para el usuario ${idUsuario}`);
          }
        } catch (carritoError) {
          console.error("❌ Error al limpiar el carrito después de la compra:", carritoError);
          // No interrumpimos el flujo principal si hay un error al limpiar el carrito
        }
      }
      
      // Confirmar la transacción
      await connection.commit();
      
      // Responder con éxito
      res.status(201).json({
        exito: true,
        mensaje: 'Pedido creado exitosamente',
        pedido: {
          id: idPedido,
          numeroPedido,
          fecha: fechaPedido,
          cliente,
          metodoPago,
          total,
          estado: 'Pendiente'
        }
      });
    } catch (transactionError) {
      // Si hay un error en la transacción, hacer rollback
      await connection.rollback();
      throw transactionError; // Re-lanzar el error para que lo capture el catch exterior
    } finally {
      // Liberar la conexión en cualquier caso
      connection.release();
    }
    
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al procesar el pedido', 
      error: error.message 
    });
  }
};

/**
 * Obtener detalles de un pedido específico
 */
const obtenerPedido = async (req, res) => {
  try {
    const idPedido = req.params.id;
    
    // Consultar el pedido en la base de datos
    const [pedidos] = await pool.query(
      `SELECT p.*, d.Direccion, d.Ciudad, d.Departamento, d.CodigoPostal, d.Referencia, u.Nombre, u.Email 
       FROM Pedidos p 
       JOIN DireccionesEnvio d ON p.IdDireccion = d.IdDireccion 
       JOIN Usuarios u ON p.IdUsuario = u.IdUsuario 
       WHERE p.IdPedido = ?`,
      [idPedido]
    );
    
    if (pedidos.length === 0) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    const pedido = pedidos[0];
    
    // Obtener los detalles del pedido
    const [detalles] = await pool.query(
      `SELECT dp.*, p.Nombre, p.Descripcion, p.Imagen 
       FROM DetallePedido dp 
       JOIN Productos p ON dp.IdProducto = p.IdProducto 
       WHERE dp.IdPedido = ?`,
      [idPedido]
    );
    
    res.json({
      exito: true,
      pedido: {
        id: pedido.IdPedido,
        numeroPedido: pedido.NumeroPedido || `ORD-${pedido.IdPedido}`,
        fecha: pedido.FechaPedido,
        cliente: {
          nombre: pedido.Nombre,
          email: pedido.Email,
          direccion: pedido.Direccion,
          ciudad: pedido.Ciudad,
          departamento: pedido.Departamento,
          codigoPostal: pedido.CodigoPostal,
          referencia: pedido.Referencia
        },
        productos: detalles.map(detalle => ({
          id: detalle.IdProducto,
          nombre: detalle.Nombre,
          descripcion: detalle.Descripcion,
          imagen: detalle.Imagen,
          cantidad: detalle.Cantidad,
          precioUnitario: detalle.PrecioUnitario,
          descuento: detalle.Descuento,
          subtotal: (detalle.PrecioUnitario * detalle.Cantidad) - detalle.Descuento
        })),
        metodoPago: pedido.MetodoPago,
        total: pedido.Total,
        estado: pedido.Estado
      }
    });
    
  } catch (error) {
    console.error("❌ Error al obtener pedido:", error);
    res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al obtener el pedido', 
      error: error.message 
    });
  }
};

module.exports = { listarPedidos, crearPedido, obtenerPedido };
