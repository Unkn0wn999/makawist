# Instrucciones para la Base de Datos

## Tabla DireccionesEnvio

Se ha detectado que la tabla `DireccionesEnvio` no está presente en tu base de datos, lo que causa errores al cargar los pedidos en la sección "Mis compras".

### Pasos para crear la tabla:

1. Abre tu gestor de base de datos MySQL (phpMyAdmin, MySQL Workbench, etc.)
2. Selecciona la base de datos `makawistbd`
3. Ejecuta el script SQL que se encuentra en el archivo `direcciones_envio.sql`

```sql
-- Script para crear la tabla DireccionesEnvio

USE makawistbd;

-- Verificar si la tabla ya existe y eliminarla si es necesario
DROP TABLE IF EXISTS DireccionesEnvio;

-- Crear la tabla DireccionesEnvio
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

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO DireccionesEnvio (IdUsuario, Direccion, Ciudad, Departamento, CodigoPostal, Referencia)
VALUES 
(1, 'Av. Principal 123', 'Chiclayo', 'Lambayeque', '14001', 'Cerca al parque principal'),
(1, 'Jr. Las Flores 456', 'Chiclayo', 'Lambayeque', '14002', 'Frente al mercado');
```

### Nota importante:

Asegúrate de que el usuario con `IdUsuario = 1` exista en tu tabla `Usuarios` antes de ejecutar los INSERT. Si no existe, puedes modificar el valor de `IdUsuario` en los INSERT para que coincida con un usuario existente en tu base de datos.