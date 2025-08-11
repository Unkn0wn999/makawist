document.addEventListener('DOMContentLoaded', () => {
    // Obtener el ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');

    if (!productoId) {
        // Redirigir a la página de productos si no hay ID
        window.location.href = 'productos.html';
        return;
    }

    // Cargar los datos del producto
    cargarDetalleProducto(productoId);

    // Configurar los botones de cantidad
    configurarControlesCantidad();

    // Configurar el botón de agregar al carrito
    document.getElementById('btn-agregar-carrito').addEventListener('click', () => {
        agregarAlCarrito(productoId);
    });

    // Configurar el botón de favoritos
    document.getElementById('btn-favorito').addEventListener('click', (e) => {
        toggleFavorito(e.currentTarget, productoId);
    });
});

/**
 * Carga los detalles del producto desde la API
 * @param {string} productoId - ID del producto a cargar
 */
async function cargarDetalleProducto(productoId) {
    try {
        const response = await fetch(`/api/productos/${productoId}`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar el producto');
        }
        
        const producto = await response.json();
        mostrarDetalleProducto(producto);
        verificarEstadoFavorito(productoId);
        cargarResenas(productoId);
        verificarCompraProducto(productoId);
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        mostrarToast('Error al cargar el producto. Por favor, intente nuevamente.', 'error');
    }
}

/**
 * Muestra los detalles del producto en la página
 * @param {Object} producto - Datos del producto
 */
function mostrarDetalleProducto(producto) {
    // Actualizar el título de la página
    document.title = `${producto.nombre} - Makawi Store Cix`;
    
    // Actualizar el breadcrumb
    document.getElementById('categoria-breadcrumb').textContent = producto.categoria;
    document.getElementById('categoria-breadcrumb').href = `productos.html?categoria=${producto.categoria_id}`;
    document.getElementById('producto-breadcrumb').textContent = producto.nombre;
    
    // Actualizar la información principal
    document.getElementById('producto-nombre').textContent = producto.nombre;
    document.getElementById('producto-categoria').textContent = producto.categoria;
    
    // Actualizar precio
    const precioElement = document.getElementById('producto-precio');
    // Asegurarse de que los precios sean números
    const precio = parseFloat(producto.precio) || 0;
    const precioOferta = parseFloat(producto.precio_oferta) || 0;
    
    if (precioOferta && precioOferta < precio) {
        precioElement.innerHTML = `
            <span class="precio-original-detalle">S/ ${precio.toFixed(2)}</span>
            <span class="precio-oferta-detalle">S/ ${precioOferta.toFixed(2)}</span>
        `;
    } else {
        precioElement.textContent = `S/ ${precio.toFixed(2)}`;
    }
    
    // Actualizar stock
    const stockElement = document.getElementById('producto-stock');
    if (producto.stock > 0) {
        stockElement.innerHTML = `<span class="stock-disponible"><i class="bi bi-check-circle"></i> En stock (${producto.stock} disponibles)</span>`;
    } else {
        stockElement.innerHTML = `<span class="stock-agotado"><i class="bi bi-x-circle"></i> Agotado</span>`;
        document.getElementById('btn-agregar-carrito').disabled = true;
        document.getElementById('btn-agregar-carrito').textContent = 'Producto agotado';
    }
    
    // Actualizar descripción
    document.getElementById('producto-descripcion').textContent = producto.descripcion;
    document.getElementById('descripcion-detallada').innerHTML = producto.descripcion_detallada || producto.descripcion;
    
    // Cargar imágenes
    cargarImagenesProducto(producto);
    
    // Cargar características
    cargarCaracteristicas(producto);
}

/**
 * Carga las imágenes del producto
 * @param {Object} producto - Datos del producto
 */
function cargarImagenesProducto(producto) {
    const imagenPrincipal = document.getElementById('imagen-principal');
    const miniaturasContainer = document.getElementById('miniaturas-container');
    
    // Limpiar contenedor de miniaturas
    miniaturasContainer.innerHTML = '';
    
    // Imagen por defecto en caso de error
    const imagenPorDefecto = '/Imagenes/no-disponible.png';
    
    try {
        // Verificar si el producto tiene una imagen principal
        if (producto.imagen && producto.imagen.trim() !== '') {
            // Establecer la imagen principal
            imagenPrincipal.src = '/Imagenes/Productos/' + producto.imagen;
            imagenPrincipal.alt = producto.nombre || 'Producto';
            
            // Manejar error de carga de imagen
            imagenPrincipal.onerror = function() {
                console.error('Error al cargar la imagen principal:', producto.imagen);
                this.src = imagenPorDefecto;
                this.alt = 'Imagen no disponible';
            };
            
            // Si hay un array de imágenes adicionales, crear miniaturas
            if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
                // Filtrar imágenes vacías o nulas
                const imagenesFiltradas = producto.imagenes.filter(img => img && img.trim() !== '');
                
                // Añadir la imagen principal como primera miniatura
                const imagenesMostrar = [producto.imagen, ...imagenesFiltradas];
                
                // Crear miniaturas
                imagenesMostrar.forEach((imagen, index) => {
                    const miniatura = document.createElement('img');
                    miniatura.src = '/Imagenes/Productos/' + imagen;
                    miniatura.alt = `${producto.nombre || 'Producto'} - Imagen ${index + 1}`;
                    miniatura.classList.add('producto-miniatura');
                    if (index === 0) miniatura.classList.add('active');
                    
                    // Manejar error de carga de miniatura
                    miniatura.onerror = function() {
                        this.src = imagenPorDefecto;
                        this.alt = 'Miniatura no disponible';
                    };
                    
                    miniatura.addEventListener('click', () => {
                        // Cambiar imagen principal
                        imagenPrincipal.src = '/Imagenes/Productos/' + imagen;
                        imagenPrincipal.onerror = function() {
                            this.src = imagenPorDefecto;
                            this.alt = 'Imagen no disponible';
                        };
                        
                        // Actualizar clase activa
                        document.querySelectorAll('.producto-miniatura').forEach(m => m.classList.remove('active'));
                        miniatura.classList.add('active');
                    });
                    
                    miniaturasContainer.appendChild(miniatura);
                });
                
                return; // Salir de la función si se cargaron imágenes correctamente
            }
        }
        
        // Si llegamos aquí, no hay imágenes válidas
        console.warn('No se encontraron imágenes válidas para el producto:', producto);
        imagenPrincipal.src = imagenPorDefecto;
        imagenPrincipal.alt = 'Imagen no disponible';
        
    } catch (error) {
        console.error('Error al cargar imágenes:', error);
        imagenPrincipal.src = imagenPorDefecto;
        imagenPrincipal.alt = 'Imagen no disponible';
    }
}

/**
 * Carga las características del producto
 * @param {Object} producto - Datos del producto
 */
function cargarCaracteristicas(producto) {
    const caracteristicasContainer = document.getElementById('caracteristicas-container');
    caracteristicasContainer.innerHTML = '';
    
    // Si el producto tiene características
    if (producto.caracteristicas && producto.caracteristicas.length > 0) {
        producto.caracteristicas.forEach(caracteristica => {
            const item = document.createElement('div');
            item.classList.add('caracteristica-item');
            item.innerHTML = `
                <i class="bi bi-check-circle-fill"></i>
                <span>${caracteristica}</span>
            `;
            caracteristicasContainer.appendChild(item);
        });
    } else {
        // Características por defecto basadas en la descripción
        const caracteristicasDefault = [
            'Producto original',
            'Garantía de calidad',
            'Envío a todo el país'
        ];
        
        caracteristicasDefault.forEach(caracteristica => {
            const item = document.createElement('div');
            item.classList.add('caracteristica-item');
            item.innerHTML = `
                <i class="bi bi-check-circle-fill"></i>
                <span>${caracteristica}</span>
            `;
            caracteristicasContainer.appendChild(item);
        });
    }
}

/**
 * Configura los controles de cantidad
 */
function configurarControlesCantidad() {
    const btnRestar = document.getElementById('btn-restar');
    const btnSumar = document.getElementById('btn-sumar');
    const inputCantidad = document.getElementById('cantidad');
    
    btnRestar.addEventListener('click', () => {
        const valorActual = parseInt(inputCantidad.value);
        if (valorActual > 1) {
            inputCantidad.value = valorActual - 1;
        }
    });
    
    btnSumar.addEventListener('click', () => {
        const valorActual = parseInt(inputCantidad.value);
        const max = parseInt(inputCantidad.getAttribute('max'));
        if (valorActual < max) {
            inputCantidad.value = valorActual + 1;
        }
    });
    
    // Validar entrada manual
    inputCantidad.addEventListener('change', () => {
        let valor = parseInt(inputCantidad.value);
        const min = parseInt(inputCantidad.getAttribute('min'));
        const max = parseInt(inputCantidad.getAttribute('max'));
        
        if (isNaN(valor) || valor < min) {
            inputCantidad.value = min;
        } else if (valor > max) {
            inputCantidad.value = max;
        }
    });
}

/**
 * Agrega el producto al carrito
 * @param {string} productoId - ID del producto
 */
async function agregarAlCarrito(productoId) {
    try {
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
            // Mostrar modal de inicio de sesión
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        
        const cantidad = parseInt(document.getElementById('cantidad').value);
        
        // Verificar si el producto ya está en el carrito
        const responseVerificar = await fetch('/api/carrito/verificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ producto_id: productoId })
        });
        
        const resultadoVerificar = await responseVerificar.json();
        
        if (resultadoVerificar.existe) {
            // El producto ya está en el carrito
            mostrarToast('info', 'Este producto ya está en tu carrito. Puedes modificar la cantidad desde allí.');
            return;
        }
        
        // Agregar al carrito
        const response = await fetch('/api/carrito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                idProducto: productoId,
                cantidad: cantidad
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al agregar al carrito');
        }
        
        const resultado = await response.json();
        
        // Actualizar contador del carrito
        if (typeof window.actualizarContadorCarrito === "function") {
            window.actualizarContadorCarrito();
        }
        
        // Mostrar mensaje de éxito
        mostrarToast('success', 'Producto agregado al carrito correctamente');
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarToast('error', 'Error al agregar al carrito. Por favor, intente nuevamente.');
    }
}

// La función actualizarContadorCarrito ahora se usa desde layout-loader.js

/**
 * Alterna el estado de favorito de un producto
 * @param {HTMLElement} btnElement - Elemento del botón de favorito
 * @param {string} productoId - ID del producto
 */
async function toggleFavorito(btnElement, productoId) {
    try {
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
            // Mostrar modal de inicio de sesión
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        
        // Determinar la acción (agregar o quitar)
        const esFavorito = btnElement.classList.contains('active');
        const accion = esFavorito ? 'eliminar' : 'agregar';
        
        // Llamar a la API
        const response = await fetch(`/api/favoritos/${accion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ IdProducto: productoId })
        });
        
        if (!response.ok) {
            throw new Error(`Error al ${accion} favorito`);
        }
        
        // Actualizar la UI
        btnElement.classList.toggle('active');
        
        // Mostrar mensaje
        const mensaje = esFavorito 
            ? 'Producto eliminado de favoritos' 
            : 'Producto agregado a favoritos';
        mostrarToast(mensaje, 'success');
        
    } catch (error) {
        console.error('Error al gestionar favorito:', error);
        mostrarToast('Error al gestionar favorito. Por favor, intente nuevamente.', 'error');
    }
}

/**
 * Verifica si el producto está en favoritos
 * @param {string} productoId - ID del producto
 */
async function verificarEstadoFavorito(productoId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Verificar si el producto está en favoritos consultando la lista completa
        const response = await fetch(`/api/favoritos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) return;
        
        const favoritos = await response.json();
        
        // Buscar si el producto actual está en la lista de favoritos
        const esFavorito = favoritos.some(fav => fav.producto_id == productoId);
        
        // Actualizar el botón de favoritos según el estado
        const btnFavorito = document.getElementById('btn-favorito');
        if (esFavorito) {
            btnFavorito.classList.add('active');
            btnFavorito.setAttribute('data-favorito', 'true');
        } else {
            btnFavorito.classList.remove('active');
            btnFavorito.setAttribute('data-favorito', 'false');
        }
    } catch (error) {
        console.error('Error al verificar favorito:', error);
    }
}

// La función cargarProductosRelacionados ha sido eliminada ya que no se utilizará

/**
 * Carga las reseñas del producto
 * @param {string} productoId - ID del producto
 */
async function cargarResenas(productoId) {
    try {
        // Usar la ruta correcta para obtener reseñas
        const response = await fetch(`/api/resenas/productos/${productoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Si el endpoint no existe o devuelve 404, mostrar mensaje de que no hay reseñas
        if (response.status === 404) {
            const container = document.getElementById('resenas-container');
            container.innerHTML = '<p class="text-center">Este producto aún no tiene reseñas.</p>';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Error al cargar reseñas');
        }
        
        const resenas = await response.json();
        const container = document.getElementById('resenas-container');
        container.innerHTML = '';
        
        if (!resenas || resenas.length === 0) {
            container.innerHTML = '<p class="text-center">Este producto aún no tiene reseñas.</p>';
            return;
        }
        
        // Mostrar reseñas
        resenas.forEach(resena => {
            const resenaElement = document.createElement('div');
            resenaElement.classList.add('resena');
            
            // Generar estrellas
            let estrellas = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= resena.calificacion) {
                    estrellas += '<i class="bi bi-star-fill"></i>';
                } else {
                    estrellas += '<i class="bi bi-star"></i>';
                }
            }
            
            // Formatear fecha - usar fecha o fecha_creacion según esté disponible
            const fecha = new Date(resena.fecha_creacion || resena.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            
            // Usar nombre_usuario o usuario_nombre según esté disponible
            const nombreUsuario = resena.nombre_usuario || resena.usuario_nombre || 'Usuario';
            
            resenaElement.innerHTML = `
                <div class="resena-header">
                    <div class="resena-usuario">${nombreUsuario}</div>
                    <div class="resena-fecha">${fechaFormateada}</div>
                </div>
                <div class="resena-estrellas">${estrellas}</div>
                <div class="resena-texto">${resena.comentario}</div>
            `;
            
            container.appendChild(resenaElement);
        });
    } catch (error) {
        console.error('Error al cargar reseñas:', error);
        document.getElementById('resenas-container').innerHTML = 
            '<p class="text-center">No se pudieron cargar las reseñas.</p>';
    }
}

/**
 * Verifica si el usuario ha comprado el producto para permitir reseñas
 * @param {string} productoId - ID del producto
 */
async function verificarCompraProducto(productoId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            mostrarMensajeInicioSesionResenas();
            return;
        }
        
        // Usar la ruta correcta para verificar si el usuario ha comprado el producto
        const response = await fetch(`/api/resenas/verificar-compra/${productoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Si el endpoint no existe o hay un error, mostrar mensaje genérico
        if (response.status === 404 || !response.ok) {
            const container = document.getElementById('form-resena-container');
            container.innerHTML = `
                <div class="mensaje-compra-requerida">
                    <i class="bi bi-info-circle-fill"></i>
                    <span>Solo los usuarios que han comprado este producto pueden dejar reseñas.</span>
                </div>
            `;
            return;
        }
        
        const resultado = await response.json();
        const container = document.getElementById('form-resena-container');
        
        // Verificar si el producto está en alguno de los pedidos del usuario
        const comprado = resultado.comprado;
        const yaComento = resultado.yaComento;
        
        if (comprado) {
            // El usuario ha comprado el producto, mostrar formulario de reseña
            mostrarFormularioResena(productoId, container, yaComento);
        } else {
            // El usuario no ha comprado el producto
            container.innerHTML = `
                <div class="mensaje-compra-requerida">
                    <i class="bi bi-info-circle-fill"></i>
                    <span>Solo los usuarios que han comprado este producto pueden dejar reseñas.</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al verificar compra:', error);
        document.getElementById('form-resena-container').innerHTML = 
            '<p class="text-center text-danger">Error al verificar si has comprado este producto.</p>';
    }
}

/**
 * Muestra mensaje para iniciar sesión para ver reseñas
 */
function mostrarMensajeInicioSesionResenas() {
    const container = document.getElementById('form-resena-container');
    container.innerHTML = `
        <div class="mensaje-compra-requerida">
            <i class="bi bi-info-circle-fill"></i>
            <span>Inicia sesión para ver si puedes dejar una reseña de este producto.</span>
        </div>
        <button class="btn btn-primary mt-3" onclick="mostrarLogin()">Iniciar sesión</button>
    `;
}

/**
 * Muestra el formulario para agregar reseña
 * @param {string} productoId - ID del producto
 * @param {HTMLElement} container - Contenedor del formulario
 * @param {boolean} yaComento - Indica si el usuario ya comentó
 */
function mostrarFormularioResena(productoId, container, yaComento) {
    if (yaComento) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-check-circle-fill"></i>
                <span>Ya has dejado una reseña para este producto. ¡Gracias por tu opinión!</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="form-resena">
            <h4>Deja tu reseña</h4>
            <form id="form-nueva-resena">
                <div class="estrellas-rating">
                    <input type="radio" id="star5" name="calificacion" value="5" />
                    <label for="star5" title="5 estrellas"><i class="bi bi-star-fill"></i></label>
                    <input type="radio" id="star4" name="calificacion" value="4" />
                    <label for="star4" title="4 estrellas"><i class="bi bi-star-fill"></i></label>
                    <input type="radio" id="star3" name="calificacion" value="3" checked />
                    <label for="star3" title="3 estrellas"><i class="bi bi-star-fill"></i></label>
                    <input type="radio" id="star2" name="calificacion" value="2" />
                    <label for="star2" title="2 estrellas"><i class="bi bi-star-fill"></i></label>
                    <input type="radio" id="star1" name="calificacion" value="1" />
                    <label for="star1" title="1 estrella"><i class="bi bi-star-fill"></i></label>
                </div>
                <div class="mb-3">
                    <label for="comentario" class="form-label">Tu opinión sobre este producto</label>
                    <textarea class="form-control" id="comentario" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Enviar reseña</button>
            </form>
        </div>
    `;
    
    // Configurar envío del formulario
    document.getElementById('form-nueva-resena').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarResena(productoId);
    });
}

/**
 * Envía una nueva reseña
 * @param {string} productoId - ID del producto
 */
async function enviarResena(productoId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const calificacion = document.querySelector('input[name="calificacion"]:checked').value;
        const comentario = document.getElementById('comentario').value.trim();
        
        if (!comentario) {
            mostrarToast('Por favor, escribe un comentario para tu reseña.', 'warning');
            return;
        }
        
        const response = await fetch(`/api/resenas/productos/${productoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                calificacion: parseInt(calificacion),
                comentario: comentario
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al enviar reseña');
        }
        
        // Mostrar mensaje de éxito
        mostrarToast('Tu reseña ha sido enviada correctamente. ¡Gracias por tu opinión!', 'success');
        
        // Recargar reseñas y actualizar formulario
        cargarResenas(productoId);
        verificarCompraProducto(productoId);
        
    } catch (error) {
        console.error('Error al enviar reseña:', error);
        mostrarToast(error.message || 'Error al enviar reseña. Por favor, intente nuevamente.', 'error');
    }
}

/**
 * Muestra el modal de inicio de sesión
 */
function mostrarLogin() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}