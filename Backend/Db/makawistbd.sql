CREATE DATABASE makawistbd;
USE makawistbd;

CREATE TABLE Usuarios (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) NOT NULL UNIQUE,
    Contraseña VARCHAR(255) NOT NULL,
    TipoDocumento VARCHAR(10),
    NumeroDocumento VARCHAR(20),
    Rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
    FechaRegistro DATETIME DEFAULT NOW(),
    Activo TINYINT(1) DEFAULT 1,
    CHECK (TipoDocumento IN ('DNI', 'RUC', 'CE')),
    CHECK (Rol IN ('admin', 'cliente'))
);

CREATE TABLE password_resets (
  IdReset INT AUTO_INCREMENT PRIMARY KEY,
  IdUsuario INT NOT NULL,
  Token VARCHAR(64) NOT NULL,
  ExpiraEn DATETIME NOT NULL,
  INDEX(Token),
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE Categorias (
    IdCategoria INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Activo TINYINT(1) DEFAULT 1
);

CREATE TABLE Productos (
    IdProducto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(500),
    Precio DECIMAL(10,2) NOT NULL,
    PrecioOferta DECIMAL(10,2),
    Stock INT NOT NULL DEFAULT 0,
    ImagenURL VARCHAR(255),
    IdCategoria INT NOT NULL,
    FechaCaducidad DATE,
    Activo TINYINT(1) DEFAULT 1,
    FechaCreacion DATETIME DEFAULT NOW(),
    FOREIGN KEY (IdCategoria) REFERENCES Categorias(IdCategoria)
);

CREATE TABLE DireccionesEnvio (
    IdDireccion INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    Direccion VARCHAR(255) NOT NULL,
    Ciudad VARCHAR(100),
    Departamento VARCHAR(100),
    CodigoPostal VARCHAR(20),
    Referencia VARCHAR(255),
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

CREATE TABLE Pedidos (
    IdPedido INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    IdDireccion INT NOT NULL,
    FechaPedido DATETIME DEFAULT NOW(),
    Estado VARCHAR(50) DEFAULT 'pendiente',
    Total DECIMAL(10,2) NOT NULL,
    MetodoPago VARCHAR(50),
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdDireccion) REFERENCES DireccionesEnvio(IdDireccion),
    CHECK (Estado IN ('pendiente', 'enviado', 'entregado', 'cancelado')),
    CHECK (MetodoPago IN ('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin'))
);

CREATE TABLE DetallePedido (
    IdDetallePedido INT AUTO_INCREMENT PRIMARY KEY,
    IdPedido INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Descuento DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (IdPedido) REFERENCES Pedidos(IdPedido),
    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
);

CREATE TABLE MetodosPago (
  IdMetodo INT AUTO_INCREMENT PRIMARY KEY,
  IdUsuario INT NOT NULL,
  TitularTarjeta VARCHAR(100) NOT NULL,
  NumeroTarjeta VARCHAR(20) NOT NULL,
  FechaExpiracion VARCHAR(7) NOT NULL,
  Cvv VARCHAR(4) NOT NULL,
  TipoTarjeta ENUM('Visa', 'Mastercard', 'Otra') DEFAULT 'Otra',
  FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);


CREATE TABLE Carrito (
    IdItem INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT DEFAULT 1,
    FechaAgregado DATETIME DEFAULT NOW(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
    UNIQUE (IdUsuario, IdProducto)
);

CREATE TABLE Comprobantes (
    IdComprobante INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(20) NOT NULL,
    Serie VARCHAR(5) NOT NULL,
    Numero INT NOT NULL,
    IdPedido INT NOT NULL,
    FechaEmision DATETIME DEFAULT NOW(),
    SubTotal DECIMAL(10,2) NOT NULL,
    IGV DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Emitido',
    FOREIGN KEY (IdPedido) REFERENCES Pedidos(IdPedido),
    UNIQUE (Tipo, Serie, Numero),
    CHECK (Tipo IN ('Boleta', 'Factura')),
    CHECK (Estado IN ('Emitido', 'Anulado'))
);

CREATE TABLE Ventas (
    IdVenta INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATETIME DEFAULT NOW(),
    IdCliente INT,
    Vendedor VARCHAR(50) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    SubTotal DECIMAL(10,2) NOT NULL,
    DescuentoTotal DECIMAL(10,2) DEFAULT 0,
    Impuestos DECIMAL(10,2) NOT NULL,
    MetodoPago VARCHAR(50),
    Estado VARCHAR(20) DEFAULT 'completada',
    IdComprobante INT,
    FOREIGN KEY (IdCliente) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdComprobante) REFERENCES Comprobantes(IdComprobante),
    CHECK (MetodoPago IN ('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin')),
    CHECK (Estado IN ('completada', 'cancelada', 'devolucion'))
);

CREATE TABLE DetalleVenta (
    IdDetalle INT AUTO_INCREMENT PRIMARY KEY,
    IdVenta INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Descuento DECIMAL(10,2) DEFAULT 0,
    PrecioFinal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (IdVenta) REFERENCES Ventas(IdVenta) ON DELETE CASCADE,
    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
);

CREATE TABLE CuponesDescuento (
    IdCupon INT AUTO_INCREMENT PRIMARY KEY,
    Codigo VARCHAR(20) NOT NULL UNIQUE,
    DescuentoPorcentaje DECIMAL(5,2),
    DescuentoMonto DECIMAL(10,2),
    FechaInicio DATE,
    FechaFin DATE,
    Activo TINYINT(1) DEFAULT 1
);

CREATE TABLE ReseñasProductos (
    IdReseña INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    IdProducto INT NOT NULL,
    Calificacion INT CHECK (Calificacion BETWEEN 1 AND 5),
    Comentario VARCHAR(500),
    Fecha DATETIME DEFAULT NOW(),
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
    UNIQUE (IdUsuario, IdProducto)
);

CREATE TABLE Favoritos (
  IdFavorito INT AUTO_INCREMENT PRIMARY KEY,
  IdUsuario INT NOT NULL,
  IdProducto INT NOT NULL,
  FechaAgregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
  FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
  UNIQUE (IdUsuario, IdProducto) -- evita duplicados
);

CREATE TABLE Promociones (
  IdPromocion INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Codigo VARCHAR(50) NOT NULL,
  Descuento DECIMAL(5,2) NOT NULL,
  FechaInicio DATE NOT NULL,
  FechaFin DATE NOT NULL,
  Activo TINYINT(1) DEFAULT 1
);


CREATE VIEW Vista_ProductosMasVendidos AS
SELECT 
    p.IdProducto,
    p.Nombre,
    p.Descripcion,
    p.ImagenURL,
    SUM(dv.Cantidad) AS TotalVendido
FROM DetalleVenta dv
JOIN Productos p ON dv.IdProducto = p.IdProducto
WHERE p.Activo = 1
GROUP BY p.IdProducto
ORDER BY TotalVendido DESC;



DELIMITER //

CREATE PROCEDURE sp_RegistrarUsuario(
  IN _nombres VARCHAR(100),
  IN _apellidos VARCHAR(100),
  IN _tipoDocumento VARCHAR(10),
  IN _numeroDocumento VARCHAR(20),
  IN _correo VARCHAR(100),
  IN _contraseña VARCHAR(255),
  IN _rol VARCHAR(20)
)
BEGIN
  INSERT INTO Usuarios (
    Nombres, Apellidos, TipoDocumento, NumeroDocumento, Correo, Contraseña, Rol
  )
  VALUES (
    _nombres, _apellidos, _tipoDocumento, _numeroDocumento, _correo, _contraseña, _rol
  );
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_ValidarLogin(IN _correo VARCHAR(100))
BEGIN
  SELECT IdUsuario, Correo, Contraseña, Rol, Activo
  FROM Usuarios
  WHERE Correo = _correo;
END;
//

CREATE PROCEDURE sp_ActualizarContraseña(
  IN _idUsuario INT,
  IN _nuevaContraseña VARCHAR(255)
)
BEGIN
  UPDATE Usuarios
  SET Contraseña = _nuevaContraseña
  WHERE IdUsuario = _idUsuario;
END;
//

CREATE PROCEDURE sp_ObtenerProductosActivos()
BEGIN
  SELECT * FROM Productos
  WHERE Activo = 1 AND Stock > 0;
END;
//

CREATE PROCEDURE sp_ActualizarStockProducto(
  IN _idProducto INT,
  IN _cantidad INT
)
BEGIN
  UPDATE Productos
  SET Stock = Stock - _cantidad
  WHERE IdProducto = _idProducto;
END;
//

CREATE PROCEDURE sp_AgregarAlCarrito(
  IN _idUsuario INT,
  IN _idProducto INT,
  IN _cantidad INT
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM Carrito
    WHERE IdUsuario = _idUsuario AND IdProducto = _idProducto
  ) THEN
    UPDATE Carrito
    SET Cantidad = Cantidad + _cantidad
    WHERE IdUsuario = _idUsuario AND IdProducto = _idProducto;
  ELSE
    INSERT INTO Carrito (IdUsuario, IdProducto, Cantidad)
    VALUES (_idUsuario, _idProducto, _cantidad);
  END IF;
END;
//

CREATE PROCEDURE sp_VerCarrito(IN _idUsuario INT)
BEGIN
  SELECT c.IdItem, p.Nombre, c.Cantidad, p.Precio, p.PrecioOferta
  FROM Carrito c
  JOIN Productos p ON c.IdProducto = p.IdProducto
  WHERE c.IdUsuario = _idUsuario;
END;
//

CREATE PROCEDURE sp_RegistrarPedido(
  IN _idUsuario INT,
  IN _idDireccion INT,
  IN _metodoPago VARCHAR(50),
  IN _total DECIMAL(10,2)
)
BEGIN
  DECLARE _idPedido INT;
  
  INSERT INTO Pedidos (IdUsuario, IdDireccion, MetodoPago, Total)
  VALUES (_idUsuario, _idDireccion, _metodoPago, _total);
  
  SET _idPedido = LAST_INSERT_ID();
  
  INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, PrecioUnitario)
  SELECT _idPedido, IdProducto, Cantidad, Precio
  FROM Carrito c JOIN Productos p ON c.IdProducto = p.IdProducto
  WHERE c.IdUsuario = _idUsuario;
  
  DELETE FROM Carrito WHERE IdUsuario = _idUsuario;
END;
//

CREATE PROCEDURE sp_ActualizarEstadoPedido(
  IN _idPedido INT,
  IN _nuevoEstado VARCHAR(50)
)
BEGIN
  UPDATE Pedidos
  SET Estado = _nuevoEstado
  WHERE IdPedido = _idPedido;
END;
//

CREATE PROCEDURE sp_GenerarComprobante(
  IN _tipo VARCHAR(20),
  IN _serie VARCHAR(5),
  IN _numero INT,
  IN _idPedido INT,
  IN _subTotal DECIMAL(10,2),
  IN _igv DECIMAL(10,2),
  IN _total DECIMAL(10,2)
)
BEGIN
  INSERT INTO Comprobantes (Tipo, Serie, Numero, IdPedido, SubTotal, IGV, Total)
  VALUES (_tipo, _serie, _numero, _idPedido, _subTotal, _igv, _total);
END;
//

CREATE PROCEDURE sp_AgregarReseñaProducto(
  IN _idUsuario INT,
  IN _idProducto INT,
  IN _calificacion INT,
  IN _comentario VARCHAR(500)
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM DetallePedido dp
    JOIN Pedidos p ON dp.IdPedido = p.IdPedido
    WHERE p.IdUsuario = _idUsuario
      AND dp.IdProducto = _idProducto
      AND p.Estado = 'entregado'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM ReseñasProductos
      WHERE IdUsuario = _idUsuario AND IdProducto = _idProducto
    ) THEN
      INSERT INTO ReseñasProductos (IdUsuario, IdProducto, Calificacion, Comentario)
      VALUES (_idUsuario, _idProducto, _calificacion, _comentario);
    ELSE
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya dejaste una reseña para este producto.';
    END IF;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo puedes dejar reseña si compraste y recibiste este producto.';
  END IF;
END;
//

CREATE PROCEDURE sp_ValidarCupon(IN _codigo VARCHAR(20))
BEGIN
  SELECT * FROM CuponesDescuento
  WHERE Codigo = _codigo
    AND Activo = 1
    AND NOW() BETWEEN FechaInicio AND FechaFin;
END;
//

CREATE PROCEDURE sp_ListarProductosPorCategoria(IN _idCategoria INT)
BEGIN
  SELECT * FROM Productos
  WHERE Activo = 1
    AND Stock > 0
    AND IdCategoria = _idCategoria;
END;
//

CREATE PROCEDURE sp_RegistrarVenta(
  IN _idPedido INT,
  IN _vendedor VARCHAR(50),
  IN _metodoPago VARCHAR(50)
)
BEGIN
  DECLARE _total DECIMAL(10,2);
  DECLARE _subTotal DECIMAL(10,2);
  DECLARE _impuestos DECIMAL(10,2);
  DECLARE _idCliente INT;
  DECLARE _idVenta INT;

  SELECT Total, IdUsuario INTO _total, _idCliente
  FROM Pedidos WHERE IdPedido = _idPedido;

  SET _subTotal = _total / 1.18;
  SET _impuestos = _total - _subTotal;

  INSERT INTO Ventas (Fecha, IdCliente, Vendedor, Total, SubTotal, Impuestos, MetodoPago)
  VALUES (NOW(), _idCliente, _vendedor, _total, _subTotal, _impuestos, _metodoPago);

  SET _idVenta = LAST_INSERT_ID();

  INSERT INTO DetalleVenta (IdVenta, IdProducto, Cantidad, PrecioUnitario, Descuento, PrecioFinal)
  SELECT _idVenta, IdProducto, Cantidad, PrecioUnitario, Descuento,
         (PrecioUnitario - Descuento) * Cantidad
  FROM DetallePedido
  WHERE IdPedido = _idPedido;
END;
//

CREATE PROCEDURE sp_EliminarProducto(IN _idProducto INT)
BEGIN
  UPDATE Productos SET Activo = 0 WHERE IdProducto = _idProducto;
END;
//

CREATE PROCEDURE sp_EliminarDelCarrito(
  IN _idUsuario INT,
  IN _idProducto INT
)
BEGIN
  DELETE FROM Carrito
  WHERE IdUsuario = _idUsuario AND IdProducto = _idProducto;
END;
//

CREATE PROCEDURE sp_ObtenerHistorialPedidos(IN _idUsuario INT)
BEGIN
  SELECT IdPedido, FechaPedido, Estado, Total, MetodoPago
  FROM Pedidos
  WHERE IdUsuario = _idUsuario
  ORDER BY FechaPedido DESC;
END;
//

CREATE PROCEDURE sp_DesactivarCupon(IN _idCupon INT)
BEGIN
  UPDATE CuponesDescuento
  SET Activo = 0
  WHERE IdCupon = _idCupon;
END;
//

CREATE PROCEDURE sp_ListarPedidos()
BEGIN
  SELECT p.IdPedido, u.Nombres, u.Apellidos, p.FechaPedido, p.Estado, p.Total, p.MetodoPago
  FROM Pedidos p
  JOIN Usuarios u ON p.IdUsuario = u.IdUsuario
  ORDER BY p.FechaPedido DESC;
END;
//

CREATE PROCEDURE sp_ListarVentas()
BEGIN
  SELECT v.IdVenta, v.Fecha, u.Nombres, u.Apellidos, v.Total, v.MetodoPago, v.Estado
  FROM Ventas v
  LEFT JOIN Usuarios u ON v.IdCliente = u.IdUsuario
  ORDER BY v.Fecha DESC;
END;
//

CREATE PROCEDURE sp_ListarCuponesActivos()
BEGIN
  SELECT * FROM CuponesDescuento
  WHERE Activo = 1
    AND NOW() BETWEEN FechaInicio AND FechaFin;
END;
//
	
DELIMITER ;

CREATE VIEW Vista_ProductosNuevos AS
SELECT 
  IdProducto,
  Nombre,
  Descripcion,
  Precio,
  PrecioOferta,
  ImagenURL,
  FechaCreacion
FROM Productos
WHERE Activo = 1
ORDER BY FechaCreacion DESC
LIMIT 10;


select * from Usuarios;
select * from Categorias;
select * from productos;
SELECT Activo FROM Usuarios WHERE Correo = 'admin1@makawi.storecix';
SELECT Correo, Contraseña FROM Usuarios WHERE Correo = 'admin1@makawi.storecix';


INSERT INTO Usuarios (Nombres, Apellidos, Correo, Contraseña, Rol)
VALUES ('Administrador', 'Makawi', 'admin1@makawi.storecix', '$2y$12$ggvdGVNgg6VjI2UuHqMZIepHeQjWs3xQUQS.8fzuayHbUeI3o5X4W', 'admin');

INSERT INTO Categorias (Nombre) VALUES ('Manicure');
INSERT INTO Productos (
  Nombre,
  Descripcion,
  Precio,
  PrecioOferta,
  Stock,
  ImagenURL,
  IDCategoria,
  Activo
) VALUES (
  'Esmalte Masglo 7ml',
  'Esmalte de uñas color intenso de larga duración. Presentación 7ml.',
  14.00,
  12.50,
  50,
  'Imagenes/Productos/masglo-7ml.jpeg',
  1, -- Reemplaza con el ID real de la categoría "Manicure"
  1
);

DESCRIBE Usuarios;
Select * from Usuarios;

ALTER TABLE Usuarios DROP COLUMN password;
ALTER TABLE Usuarios DROP COLUMN numero_documento;
ALTER TABLE Usuarios DROP COLUMN tipo_documento;
ALTER TABLE Usuarios DROP COLUMN fecha_registro;

select * from productos;

UPDATE Usuarios
SET Rol = 'admin'
WHERE Correo = 'sysadmin@makawi.pe';

SELECT 
  p.IdProducto, p.Nombre, p.Descripcion, p.Precio, p.PrecioOferta, 
  p.ImagenURL, c.Nombre AS Categoria
FROM Productos p
JOIN Categorias c ON p.IdCategoria = c.IdCategoria
WHERE p.Activo = 1;

DELETE FROM Usuarios WHERE IdUsuario = 2;

UPDATE productos
SET ImagenURL = 'lip-brush.jpeg'
WHERE IdProducto = 10;

select * from categorias;
select * from productos;
INSERT INTO Categorias (Nombre) VALUES ('Lasheo'), ('Accesorios');

INSERT INTO Productos (Nombre, ImagenURL, Precio, IdCategoria, Descripcion)
VALUES (
  'Lip Brush',
  'Imagenes/Productos/lip-brush.jpg',
  12.00,
  1	,
  'Aplicación precisa y suave para unos labios perfectamente definidos. Ideal para lápiz labial, gloss o tintes, su diseño compacto y cerdas de calidad aseguran un acabado profesional y duradero.'
);

SELECT * FROM Favoritos WHERE IdUsuario = 22;

update Productos
set IdCategoria = 3
where IdProducto = 7;

UPDATE Productos
SET ImagenURL = REPLACE(ImagenURL, 'Imagenes/Productos/', '');

UPDATE Productos SET Stock = 10 WHERE IdProducto = 3;
UPDATE Productos SET ImagenURL = 'esmaltes-vogue.jpg' WHERE IdProducto = 3;
UPDATE Productos SET ImagenURL = 'pestañas-megavolumen.png' WHERE IdProducto = 5;
UPDATE Productos SET ImagenURL = 'pinza-pw.png' WHERE IdProducto = 4;
UPDATE Productos SET ImagenURL = 'anillo-esmalte.jpg' WHERE IdProducto = 2;
UPDATE Productos SET ImagenURL = 'organizador-pestañas.png' WHERE IdProducto = 7;
UPDATE Productos SET ImagenURL = 'uñas-postizas.jpg' WHERE IdProducto = 9;


describe Usuarios;
describe ventas;
describe categorias;
describe productos;
describe favoritos;
describe carrito;
describe MetodosPago;
describe DireccionesEnvio;
describe promociones;

select * from usuarios;
select * from productos;
select * from categorias;
select * from MetodosPago;
select * from DireccionesEnvio;
select * from Pedidos;
select * from DetallePedido;
select * from Carrito;
select * from Comprobantes;
select * from Ventas;
select * from DetalleVenta;
select * from CuponesDescuento;
select * from ReseñasProductos;
select * from Favoritos;
select * from Promociones;




