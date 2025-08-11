// Variables globales
let carrito = [];
let direccionesGuardadas = [];
let tarjetasGuardadas = [];
let pasoActual = 1;
let datosCliente = {};
let detallesPago = {};
let descuentoAplicado = 0;
let codigoPromoAplicado = null;
let direccionSeleccionada = null;
let tarjetaSeleccionada = null;


// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la barra de progreso
    actualizarBarraProgreso(1);

    // Cargar datos del carrito
    cargarDatosCarrito();

    // Cargar direcciones guardadas
    cargarDireccionesGuardadas();

    // Cargar tarjetas guardadas
    cargarTarjetasGuardadas();

    // Configurar opciones de entrega
    configurarOpcionesEntrega();

    // Configurar opciones de pago
    configurarOpcionesPago();

    // Configurar botón de aplicar código promocional
    document.getElementById('aplicar-promo').addEventListener('click', aplicarCodigoPromocional);


    // Configurar botón de descargar comprobante
    document.getElementById('descargar-comprobante').addEventListener('click', generarComprobantePDF);

    // Configurar botón de ver pedidos
    document.getElementById('ver-pedidos').addEventListener('click', () => {
        window.location.href = 'cuenta.html?tab=pedidos';
    });

    // Configurar botones de nueva dirección y tarjeta
    document.getElementById('btn-nueva-direccion').addEventListener('click', mostrarFormularioDireccion);
    document.getElementById('btn-nueva-tarjeta').addEventListener('click', mostrarFormularioTarjeta);

    // Configurar los sliders de pago
    configurarSlidersPago();

    // Configurar formateo automático para campos de tarjeta
    configurarCamposTarjeta();


});

// Función para actualizar la barra de progreso
function actualizarBarraProgreso(paso) {
    // Actualizar el ancho de la barra de progreso
    const porcentaje = (paso - 1) * 33.33;
    document.getElementById('progress-fill').style.width = `${porcentaje}%`;

    // Actualizar las clases de los pasos
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index + 1 < paso) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === paso) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// Función para avanzar al siguiente paso
function avanzarPaso(paso) {
    // Validar el paso actual antes de avanzar
    if (!validarPasoActual(pasoActual)) {
        return;
    }

    // Ocultar el paso actual
    document.getElementById(`step-${pasoActual}`).classList.remove('active');

    // Mostrar el nuevo paso
    document.getElementById(`step-${paso}`).classList.add('active');

    // Actualizar la barra de progreso
    actualizarBarraProgreso(paso);

    // Actualizar el paso actual
    pasoActual = paso;

    // Si es el último paso, mostrar la confirmación
    if (paso === 4) {
        mostrarConfirmacion();
    }
}

// Función para retroceder al paso anterior
function retrocederPaso(paso) {
    // Ocultar el paso actual
    document.getElementById(`step-${pasoActual}`).classList.remove('active');

    // Mostrar el paso anterior
    document.getElementById(`step-${paso}`).classList.add('active');

    // Actualizar la barra de progreso
    actualizarBarraProgreso(paso);

    // Actualizar el paso actual
    pasoActual = paso;
}

// Función para validar el paso actual
function validarPasoActual(paso) {
    switch (paso) {
        case 1:
            // Validar que haya productos en el carrito
            if (carrito.length === 0) {
                mostrarToast('No hay productos en el carrito', 'error');
                return false;
            }
            return true;

        case 2:
            // Validar datos de envío
            if (document.getElementById('opcion-direccion').checked) {
                // Si hay una dirección seleccionada, usar esa
                if (direccionSeleccionada) {
                    datosCliente = {
                        nombre: direccionSeleccionada.nombre + ' ' + direccionSeleccionada.apellido,
                        telefono: direccionSeleccionada.telefono,
                        email: direccionSeleccionada.email,
                        direccion: direccionSeleccionada.direccion,
                        ciudad: direccionSeleccionada.ciudad,
                        departamento: direccionSeleccionada.departamento,
                        codigoPostal: direccionSeleccionada.codigoPostal,
                        referencia: direccionSeleccionada.referencia,
                        tipoEntrega: 'domicilio'
                    };
                    return true;
                }

                const direccionElem = document.getElementById('direccion');
                const ciudadElem = document.getElementById('ciudad');
                const departamentoElem = document.getElementById('departamento-select');

                const codigoPostalElem = document.getElementById('codigoPostal');

                const direccion = direccionElem ? direccionElem.value.trim() : '';
                const ciudad = ciudadElem ? ciudadElem.value.trim() : '';
                const departamento = departamentoElem ? departamentoElem.value.trim() : '';
                const codigoPostal = codigoPostalElem ? codigoPostalElem.value.trim() : '';

                if (!direccion || !ciudad || !departamento || !codigoPostal) {
                    mostrarToast('Por favor completa todos los campos obligatorios', 'error');
                    return false;
                }


                // Validar formato de dirección
                if (typeof window.validaciones !== 'undefined') {
                    // Validar dirección (debe tener al menos 5 caracteres)
                    if (direccion.length < 5) {
                        mostrarToast('La dirección debe tener al menos 5 caracteres', 'error');
                        return false;
                    }

                    // Validar código postal (debe tener 5 dígitos)
                    if (!/^\d{5}$/.test(codigoPostal)) {
                        mostrarToast('El código postal debe tener 5 dígitos', 'error');
                        return false;
                    }
                }

                // Guardar los datos del cliente
                datosCliente = {
                    direccion,
                    ciudad,
                    departamento,
                    codigoPostal,
                    referencia: document.getElementById('referencia').value.trim(),
                    tipoEntrega: 'domicilio'
                };

                // Guardar la dirección si se seleccionó la opción
                if (document.getElementById('guardarDireccion').checked) {
                    guardarDireccion({
                        direccion,
                        ciudad,
                        departamento,
                        codigoPostal,
                        referencia: document.getElementById('referencia').value.trim()
                    });
                }
            } else {
                // Recoger en tienda
                datosCliente = {
                    nombre: 'Recoger en tienda',
                    direccion: 'Makawi Store - Chiclayo, Av. Balta 1400',
                    ciudad: 'Chiclayo',
                    departamento: 'Chiclayo',
                    tipoEntrega: 'tienda'
                };
            }
            return true;

        case 3:
            // Validar método de pago
            const metodoTarjeta = document.getElementById('metodo-tarjeta');
            const metodoYape = document.getElementById('metodo-yape');
            const metodoPlin = document.getElementById('metodo-plin');

            // Calcular el total del carrito
            let totalCarrito = 0;
            carrito.forEach(producto => {
                totalCarrito += producto.Precio * producto.Cantidad;
            });

            if (metodoTarjeta.checked) {
                // Si hay una tarjeta seleccionada, usar esa
                if (tarjetaSeleccionada) {
                    detallesPago = {
                        tipo: 'tarjeta',
                        tarjeta: tarjetaSeleccionada,
                        monto: totalCarrito
                    };
                    return true;
                }

                // Validar formulario de tarjeta
                const nombreTarjeta = document.getElementById('nombreTarjeta').value.trim();
                const numeroTarjeta = document.getElementById('numeroTarjeta').value.trim();
                const fechaExpiracion = document.getElementById('fechaExpiracion').value.trim();
                const cvv = document.getElementById('cvv').value.trim();

                if (!nombreTarjeta || !numeroTarjeta || !fechaExpiracion || !cvv) {
                    mostrarToast('Por favor completa todos los campos de la tarjeta', 'error');
                    return false;
                }

                // Validar número de tarjeta (formato básico)
                if (numeroTarjeta.replace(/\s/g, '').length < 13 || numeroTarjeta.replace(/\s/g, '').length > 19) {
                    mostrarToast('Número de tarjeta inválido', 'error');
                    return false;
                }

                // Validar fecha de expiración
                if (!/^\d{2}\/\d{2}$/.test(fechaExpiracion)) {
                    mostrarToast('Formato de fecha inválido (MM/AA)', 'error');
                    return false;
                }

                // Validar CVV
                if (cvv.length < 3 || cvv.length > 4) {
                    mostrarToast('CVV inválido', 'error');
                    return false;
                }

                detallesPago = {
                    tipo: 'tarjeta',
                    nombre: nombreTarjeta,
                    numero: numeroTarjeta,
                    fechaExpiracion,
                    cvv,
                    monto: totalCarrito
                };

                // Guardar tarjeta si se seleccionó la opción
                if (document.getElementById('guardarTarjeta').checked) {
                    guardarTarjeta({
                        nombre: nombreTarjeta,
                        numero: numeroTarjeta,
                        fechaExpiracion,
                        tipo: detectarTipoTarjeta(numeroTarjeta)
                    });
                }
            } else if (metodoYape.checked) {
                detallesPago = {
                    tipo: 'yape',
                    numero: '932204477',
                    nombre: 'Makawi Store',
                    monto: totalCarrito
                };
            } else if (metodoPlin.checked) {
                detallesPago = {
                    tipo: 'plin',
                    numero: '932204477',
                    nombre: 'Makawi Store',
                    monto: totalCarrito
                };
            } else {
                mostrarToast('Por favor selecciona un método de pago', 'error');
                return false;
            }

            // Ya no hay pagos mixtos porque se eliminaron los sliders
            detallesPago.pagosMixtos = null;

            return true;

        default:
            return true;
    }
}

async function cargarDatosCarrito() {
    const token = localStorage.getItem('token');
    const productosSeleccionados = JSON.parse(localStorage.getItem('productosSeleccionados') || '[]');

    try {
        // Intentar cargar desde la API
        if (token) {
            const response = await fetch('/api/carrito', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const productos = await response.json();

                // Si no hay productos seleccionados, usar todos los del carrito
                if (productosSeleccionados.length === 0) {
                    carrito = productos;
                } else {
                    // Filtrar solo los productos seleccionados
                    carrito = productos.filter(p => productosSeleccionados.includes(p.IdProducto));
                }

                if (carrito.length === 0) {
                    mostrarCarritoVacio();
                    return;
                }

                // Mostrar los productos en el carrito
                mostrarProductosCarrito();

                // Actualizar el resumen de compra
                actualizarResumenCompra();
            } else {
                // Si falla la API, intentar cargar desde localStorage
                cargarDatosLocalStorage();
            }
        } else {
            // Si no hay token, intentar cargar desde localStorage
            cargarDatosLocalStorage();
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        cargarDatosLocalStorage();
    }
}

// Cargar datos del carrito desde localStorage
function cargarDatosLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    const productosSeleccionados = JSON.parse(localStorage.getItem('productosSeleccionados') || '[]');

    if (carritoGuardado) {
        try {
            const todosProductos = JSON.parse(carritoGuardado);

            // Si no hay productos seleccionados, usar todos los del carrito
            if (productosSeleccionados.length === 0) {
                carrito = todosProductos;
            } else {
                // Filtrar solo los productos seleccionados
                carrito = todosProductos.filter(p => productosSeleccionados.includes(p.IdProducto));
            }

            if (carrito.length === 0) {
                mostrarCarritoVacio();
                return;
            }

            // Mostrar los productos en el carrito
            mostrarProductosCarrito();

            // Actualizar el resumen de compra
            actualizarResumenCompra();
        } catch (error) {
            console.error('Error al parsear carrito del localStorage:', error);
            mostrarCarritoVacio();
        }
    } else {
        mostrarCarritoVacio();
    }
}

// Función para mostrar mensaje de carrito vacío
function mostrarCarritoVacio() {
    document.getElementById('cart-items').innerHTML = `
        <div class="empty-cart text-center py-5">
            <i class="bi bi-cart-x" style="font-size: 3rem;"></i>
            <h3 class="mt-3">Tu carrito está vacío</h3>
            <p>No hay productos seleccionados para comprar.</p>
            <a href="carrito.html" class="btn btn-primary mt-3">
                <i class="bi bi-arrow-left"></i> Volver al carrito
            </a>
        </div>
    `;

    // Ocultar botones de navegación
    const botonesNavegacion = document.querySelector('#step-1 .d-flex.justify-content-between');
    if (botonesNavegacion) {
        botonesNavegacion.style.display = 'none';
    }

    // Actualizar el resumen de compra
    document.getElementById('summary-products').innerHTML = `
        <div class="text-center py-4">
            <p>No hay productos en el carrito</p>
        </div>
    `;
    document.getElementById('subtotal').textContent = 'S/ 0.00';
    document.getElementById('total').textContent = 'S/ 0.00';
}

// Función para mostrar los productos en el carrito
function mostrarProductosCarrito() {
    const cartItemsContainer = document.getElementById('cart-items');
    const summaryProductsContainer = document.getElementById('summary-products');

    // Limpiar los contenedores
    cartItemsContainer.innerHTML = '';
    summaryProductsContainer.innerHTML = '';

    // Mostrar los productos en el carrito
    carrito.forEach(producto => {
        const subtotal = producto.Precio * producto.Cantidad;

        // Construir la ruta de la imagen con fallback
        let imagenPath = 'Imagenes/no-disponible.png';
        if (producto.ImagenURL) {
            if (producto.ImagenURL.startsWith('http')) {
                imagenPath = producto.ImagenURL;
            } else if (producto.ImagenURL.startsWith('/')) {
                imagenPath = producto.ImagenURL.substring(1);
            } else if (producto.ImagenURL.startsWith('Imagenes/')) {
                imagenPath = producto.ImagenURL;
            } else if (producto.ImagenURL.includes('Productos/')) {
                imagenPath = producto.ImagenURL;
            } else {
                imagenPath = `Imagenes/Productos/${producto.ImagenURL}`;
            }
        }

        // Añadir al contenedor principal
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="item-image">
                    <img src="${imagenPath}" alt="${producto.Nombre}" 
                         onerror="this.onerror=null; this.src='Imagenes/no-disponible.png';">
                </div>
                <div class="item-details">
                    <h5 class="item-name">${producto.Nombre}</h5>
                    <div class="item-price">S/ ${parseFloat(producto.Precio).toFixed(2)}</div>
                    <div class="item-quantity">Cantidad: ${producto.Cantidad}</div>
                </div>
                <div class="item-subtotal">S/ ${subtotal.toFixed(2)}</div>
            </div>
        `;

        // Añadir al resumen de compra
        summaryProductsContainer.innerHTML += `
            <div class="summary-product">
                <div class="product-info">
                    <div class="product-name">${producto.Nombre}</div>
                    <div class="product-quantity">x${producto.Cantidad}</div>
                </div>
                <div class="product-price">S/ ${subtotal.toFixed(2)}</div>
            </div>
        `;
    });
}

async function validarCodigoPromocional(codigo) {
    if (codigo === 'WELCOME20') {
        const yaUsado = localStorage.getItem('WELCOME20_USADO');
        if (yaUsado === 'true') {
            return { valido: false, mensaje: 'El cupón WELCOME20 ya fue usado anteriormente.' };
        }
        return { valido: true, descuento: 20, tipo: 'porcentaje', especial: 'WELCOME20' };
    }

    try {
        const response = await fetch('/api/cupones/validar?codigo=' + codigo);
        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data && data.valido) {
            return {
                valido: true,
                descuento: data.descuento,
                tipo: data.tipo // 'porcentaje' o 'fijo'
            };
        } else {
            return { valido: false, mensaje: 'Código inválido o expirado.' };
        }
    } catch (error) {
        return { valido: false, mensaje: 'Error al validar el cupón. Intenta nuevamente.' };
    }
}

function obtenerCostoEnvioPorDepartamento(departamento) {
    if (!departamento) return 20; // Costo default si no hay info

    const dep = departamento.trim().toLowerCase();

    const costos = {
        'amazonas': 20,
        'ancash': 20,
        'apurímac': 20,
        'arequipa': 15,
        'ayacucho': 20,
        'cajamarca': 20,
        'callao': 10,
        'cusco': 20,
        'huancavelica': 20,
        'huánuco': 20,
        'ica': 20,
        'junín': 20,
        'la libertad': 20,
        'lambayeque': 5,
        'lima': 10,
        'loreto': 20,
        'madre de dios': 20,
        'moquegua': 20,
        'pasco': 20,
        'piura': 20,
        'puno': 20,
        'san martin': 20,
        'tacna': 20,
        'tumbes': 20,
        'ucayali': 20
    };

    return costos[dep] !== undefined ? costos[dep] : 20; // 20 soles por defecto si no está en la lista
}


// Función para actualizar el resumen de compra
function actualizarResumenCompra() {
    let subtotal = 0;
    carrito.forEach(producto => {
        subtotal += producto.Precio * producto.Cantidad;
    });

    let envio = 0;
    if (datosCliente.tipoEntrega === 'tienda') {
        envio = 0;
    } else {
        // Aquí asumimos que datosCliente.departamento tiene el nombre del departamento en texto
        envio = obtenerCostoEnvioPorDepartamento(datosCliente.departamento);
    }

    const total = subtotal + envio - descuentoAplicado;

    document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('envio').textContent = `S/ ${envio.toFixed(2)}`;
    document.getElementById('descuento').textContent = `-S/ ${descuentoAplicado.toFixed(2)}`;
    document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;
}




// Función para cargar direcciones guardadas
async function cargarDireccionesGuardadas() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('saved-addresses-container');

    if (!token) {
        container.innerHTML = '<p>Inicia sesión para ver tus direcciones guardadas</p>';
        return;
    }

    try {
        const response = await fetch('/api/direcciones', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const direcciones = await response.json();
            direccionesGuardadas = direcciones;

            if (!Array.isArray(direcciones) || direcciones.length === 0) {
                container.innerHTML = '<p>No tienes direcciones guardadas</p>';
                return;
            }

            // Mostrar las direcciones guardadas
            container.innerHTML = '';
            direcciones.forEach(direccion => {
                // Normalizar los datos de la dirección
                const direccionNormalizada = {
                    id: direccion.IdDireccion || direccion.id,
                    nombre: direccion.Nombre || direccion.nombre || '',
                    apellido: direccion.Apellido || direccion.apellido || '',
                    telefono: direccion.Telefono || direccion.telefono || '',
                    email: direccion.Email || direccion.email || '',
                    direccion: direccion.Direccion || direccion.direccion || '',
                    ciudad: direccion.Ciudad || direccion.ciudad || '',
                    departamento: direccion.Departamento || direccion.departamento || direccion.Departamento || '',
                    codigoPostal: direccion.CodigoPostal || direccion.codigoPostal || '',
                    referencia: direccion.Referencia || direccion.referencia || ''
                };

                container.innerHTML += `
                    <div class="address-card" data-id="${direccionNormalizada.id}">
                        <div class="address-info">
                            <h5>${direccionNormalizada.nombre} ${direccionNormalizada.apellido}</h5>
                            <p>${direccionNormalizada.direccion}</p>
                            <p>${direccionNormalizada.departamento}, ${direccionNormalizada.ciudad}</p>
                            <p>Tel: ${direccionNormalizada.telefono}</p>
                        </div>
                        <div class="address-check">
                            <i class="bi bi-check-circle-fill"></i>
                        </div>
                    </div>
                `;
            });

            // Agregar event listeners para seleccionar direcciones
            document.querySelectorAll('.address-card').forEach(card => {
                card.addEventListener('click', function () {
                    // Remover selección anterior
                    document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));

                    // Seleccionar esta dirección
                    this.classList.add('selected');

                    // Obtener datos de la dirección
                    const direccionId = this.dataset.id;
                    const direccionOriginal = direccionesGuardadas.find(d =>
                        (d.IdDireccion || d.id) == direccionId
                    );

                    if (direccionOriginal) {
                        direccionSeleccionada = {
                            id: direccionOriginal.IdDireccion || direccionOriginal.id,
                            nombre: direccionOriginal.Nombre || direccionOriginal.nombre || '',
                            apellido: direccionOriginal.Apellido || direccionOriginal.apellido || '',
                            telefono: direccionOriginal.Telefono || direccionOriginal.telefono || '',
                            email: direccionOriginal.Email || direccionOriginal.email || '',
                            direccion: direccionOriginal.Direccion || direccionOriginal.direccion || '',
                            ciudad: direccionOriginal.Ciudad || direccionOriginal.ciudad || '',
                            departamento: direccionOriginal.Departamento || direccionOriginal.departamento || direccionOriginal.Departamento || '',
                            codigoPostal: direccionOriginal.CodigoPostal || direccionOriginal.codigoPostal || '',
                            referencia: direccionOriginal.Referencia || direccionOriginal.referencia || ''
                        };
                    }

                    // Ocultar formulario de nueva dirección
                    document.getElementById('formulario-direccion').style.display = 'none';
                });
            });
        } else {
            container.innerHTML = '<p>Error al cargar direcciones</p>';
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
        container.innerHTML = '<p>Error al cargar direcciones</p>';
    }
}

// Función para guardar nueva dirección
async function guardarDireccion(direccion) {
    const token = localStorage.getItem('token');

    if (!token) {
        mostrarToast('Debes iniciar sesión para guardar direcciones', 'warning');
        return;
    }

    try {
        // Normalizar los datos antes de enviar
        const direccionNormalizada = {
            Nombre: direccion.nombre,
            Apellido: direccion.apellido,
            Telefono: direccion.telefono,
            Email: direccion.email,
            Direccion: direccion.direccion,
            Ciudad: direccion.ciudad,
            Departamento: direccion.departamento,
            CodigoPostal: direccion.codigoPostal,
            Referencia: direccion.referencia
        };

        const response = await fetch('/api/direcciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(direccionNormalizada)
        });

        if (response.ok) {
            mostrarToast('Dirección guardada correctamente', 'success');
            // Recargar direcciones
            cargarDireccionesGuardadas();
        } else {
            const errorData = await response.json();
            mostrarToast(errorData.mensaje || 'Error al guardar la dirección', 'error');
        }
    } catch (error) {
        console.error('Error al guardar dirección:', error);
        mostrarToast('Error al guardar la dirección', 'error');
    }
}

// Función para cargar tarjetas guardadas
async function cargarTarjetasGuardadas() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('saved-cards-container');

    if (!token) {
        container.innerHTML = '<p>Inicia sesión para ver tus tarjetas guardadas</p>';
        return;
    }

    try {
        const response = await fetch('/api/tarjetas', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const tarjetas = await response.json();
            tarjetasGuardadas = tarjetas;

            if (!Array.isArray(tarjetas) || tarjetas.length === 0) {
                container.innerHTML = '<p>No tienes tarjetas guardadas</p>';
                return;
            }

            // Mostrar las tarjetas guardadas
            container.innerHTML = '';
            tarjetas.forEach(tarjeta => {
                // Normalizar los datos de la tarjeta
                const tarjetaNormalizada = {
                    id: tarjeta.IdTarjeta || tarjeta.id,
                    nombre: tarjeta.TitularTarjeta || tarjeta.nombre || '',
                    numero: tarjeta.NumeroTarjeta || tarjeta.numero || '',
                    fechaExpiracion: tarjeta.FechaExpiracion || tarjeta.fechaExpiracion || '',
                    tipo: tarjeta.TipoTarjeta || tarjeta.tipo || 'unknown'
                };

                const numeroOculto = '**** **** **** ' + tarjetaNormalizada.numero.slice(-4);
                const tipoClase = tarjetaNormalizada.tipo.toLowerCase();

                container.innerHTML += `
                    <div class="card-item ${tipoClase}" data-id="${tarjetaNormalizada.id}">
                        <div class="card-logo">
                            <img src="Imagenes/Iconos/${tipoClase}.svg" alt="${tarjetaNormalizada.tipo}" 
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="card-info">
                            <h5>${tarjetaNormalizada.nombre}</h5>
                            <p class="card-number">${numeroOculto}</p>
                            <p>Expira: ${tarjetaNormalizada.fechaExpiracion}</p>
                        </div>
                        <div class="card-check">
                            <i class="bi bi-check-circle-fill"></i>
                        </div>
                    </div>
                `;
            });

            // Agregar event listeners para seleccionar tarjetas
            document.querySelectorAll('.card-item').forEach(card => {
                card.addEventListener('click', function () {
                    // Remover selección anterior
                    document.querySelectorAll('.card-item').forEach(c => c.classList.remove('selected'));

                    // Seleccionar esta tarjeta
                    this.classList.add('selected');

                    // Obtener datos de la tarjeta
                    const tarjetaId = this.dataset.id;
                    const tarjetaOriginal = tarjetasGuardadas.find(t =>
                        (t.IdTarjeta || t.id) == tarjetaId
                    );

                    if (tarjetaOriginal) {
                        tarjetaSeleccionada = {
                            id: tarjetaOriginal.IdTarjeta || tarjetaOriginal.id,
                            nombre: tarjetaOriginal.TitularTarjeta || tarjetaOriginal.nombre || '',
                            numero: tarjetaOriginal.NumeroTarjeta || tarjetaOriginal.numero || '',
                            fechaExpiracion: tarjetaOriginal.FechaExpiracion || tarjetaOriginal.fechaExpiracion || '',
                            tipo: tarjetaOriginal.TipoTarjeta || tarjetaOriginal.tipo || 'unknown'
                        };
                    }

                    // Ocultar formulario de nueva tarjeta
                    document.getElementById('formulario-tarjeta').style.display = 'none';
                });
            });
        } else {
            container.innerHTML = '<p>Error al cargar tarjetas</p>';
        }
    } catch (error) {
        console.error('Error al cargar tarjetas:', error);
        container.innerHTML = '<p>Error al cargar tarjetas</p>';
    }
}

// Función para guardar nueva tarjeta
async function guardarTarjeta(tarjeta) {
    const token = localStorage.getItem('token');

    if (!token) {
        mostrarToast('Debes iniciar sesión para guardar tarjetas', 'warning');
        return;
    }

    try {
        // Normalizar los datos antes de enviar
        const tarjetaNormalizada = {
            TitularTarjeta: tarjeta.nombre,
            NumeroTarjeta: tarjeta.numero,
            FechaExpiracion: tarjeta.fechaExpiracion,
            TipoTarjeta: tarjeta.tipo
        };

        const response = await fetch('/api/tarjetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(tarjetaNormalizada)
        });

        if (response.ok) {
            mostrarToast('Tarjeta guardada correctamente', 'success');
            // Recargar tarjetas
            cargarTarjetasGuardadas();
        } else {
            const errorData = await response.json();
            mostrarToast(errorData.mensaje || 'Error al guardar la tarjeta', 'error');
        }
    } catch (error) {
        console.error('Error al guardar tarjeta:', error);
        mostrarToast('Error al guardar la tarjeta', 'error');
    }
}

// Función para detectar tipo de tarjeta
function detectarTipoTarjeta(numero) {
    const num = numero.replace(/\s/g, '');

    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6/.test(num)) return 'discover';

    return 'unknown';
}

// Función para actualizar icono de tarjeta
function actualizarIconoTarjeta(tipo) {
    const icono = document.getElementById('iconoTarjeta');
    if (icono) {
        icono.className = `bi bi-credit-card-${tipo}`;
    }
}

// Función para mostrar formulario de dirección
function mostrarFormularioDireccion() {
    document.getElementById('formulario-direccion').style.display = 'block';
    // Limpiar selección de direcciones guardadas
    document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
    direccionSeleccionada = null;
}

// Función para mostrar formulario de tarjeta
function mostrarFormularioTarjeta() {
    document.getElementById('formulario-tarjeta').style.display = 'block';
    // Limpiar selección de tarjetas guardadas
    document.querySelectorAll('.card-item').forEach(c => c.classList.remove('selected'));
    tarjetaSeleccionada = null;
}

function configurarOpcionesEntrega() {
    const opcionDireccion = document.getElementById('opcion-direccion');
    const opcionTienda = document.getElementById('opcion-tienda');
    const direccionesGuardadasContainer = document.getElementById('direcciones-guardadas');
    const formularioDireccion = document.getElementById('formulario-direccion');
    const tiendaPickup = document.getElementById('tienda-pickup');

    opcionDireccion.addEventListener('change', function () {
        if (this.checked) {
            direccionesGuardadasContainer.style.display = 'block';
            formularioDireccion.style.display = 'block';
            tiendaPickup.style.display = 'none';

            // Si hay direcciones guardadas y una seleccionada, ocultar el formulario
            if (document.querySelector('.address-card.selected')) {
                formularioDireccion.style.display = 'none';
            }

            // Actualizar costo de envío
            document.getElementById('envio').textContent = 'S/ 15.00';
            actualizarResumenCompra();
        }
    });

    opcionTienda.addEventListener('change', function () {
        if (this.checked) {
            direccionesGuardadasContainer.style.display = 'none';
            formularioDireccion.style.display = 'none';
            tiendaPickup.style.display = 'block';

            // Actualizar datos de cliente
            datosCliente.tipoEntrega = 'tienda';

            // Actualizar costo de envío (gratis)
            document.getElementById('envio').textContent = 'S/ 0.00';
            actualizarResumenCompra();
        }
    });
}

// Función para configurar opciones de pago
function configurarOpcionesPago() {
    const metodoTarjeta = document.getElementById('metodo-tarjeta');
    const metodoYape = document.getElementById('metodo-yape');
    const metodoPlin = document.getElementById('metodo-plin');
    const tarjetasGuardadasContainer = document.getElementById('tarjetas-guardadas');
    const formularioTarjeta = document.getElementById('formulario-tarjeta');
    const pagoYape = document.getElementById('pago-yape');
    const pagoPlin = document.getElementById('pago-plin');

    metodoTarjeta.addEventListener('change', function () {
        if (this.checked) {
            tarjetasGuardadasContainer.style.display = 'block';
            formularioTarjeta.style.display = 'block';
            pagoYape.style.display = 'none';
            pagoPlin.style.display = 'none';

            // Si hay tarjetas guardadas y una seleccionada, ocultar el formulario
            if (document.querySelector('.card-item.selected')) {
                formularioTarjeta.style.display = 'none';
            }
        }
    });

    metodoYape.addEventListener('change', function () {
        if (this.checked) {
            tarjetasGuardadasContainer.style.display = 'none';
            formularioTarjeta.style.display = 'none';
            pagoYape.style.display = 'block';
            pagoPlin.style.display = 'none';
        }
    });

    metodoPlin.addEventListener('change', function () {
        if (this.checked) {
            tarjetasGuardadasContainer.style.display = 'none';
            formularioTarjeta.style.display = 'none';
            pagoYape.style.display = 'none';
            pagoPlin.style.display = 'block';
        }
    });
}

// Función para aplicar código promocional
async function aplicarCodigoPromocional() {
    const codigoInput = document.getElementById('codigo-promo');
    const codigo = codigoInput.value.trim().toUpperCase();

    if (!codigo) {
        mostrarToast('Ingresa un código promocional', 'warning');
        return;
    }

    if (codigoPromoAplicado === codigo) {
        mostrarToast('Este código ya fue aplicado.', 'info');
        return;
    }

    const resultado = await validarCodigoPromocional(codigo);

    if (!resultado.valido) {
        mostrarToast(resultado.mensaje, 'error');
        return;
    }

    // Aplicar descuento
    // Aplicar descuento sobre el total incluyendo el envío
    let subtotal = 0;
    carrito.forEach(producto => {
        subtotal += producto.Precio * producto.Cantidad;
    });

    const envio = datosCliente.tipoEntrega === 'tienda' ? 0 : 15;
    const totalConEnvio = subtotal + envio;

    if (resultado.tipo === 'porcentaje') {
        descuentoAplicado = (totalConEnvio * resultado.descuento) / 100;
    } else {
        descuentoAplicado = resultado.descuento;
    }


    codigoPromoAplicado = codigo;

    if (resultado.especial === 'WELCOME20') {
        localStorage.setItem('WELCOME20_USADO', 'true');
    }

    actualizarResumenCompra();
    mostrarToast(`Código aplicado: ${codigo}`, 'success');
}




// Función para configurar los métodos de pago
function configurarSlidersPago() {
    // Calcular total del carrito
    let total = 0;
    carrito.forEach(producto => {
        total += producto.Precio * producto.Cantidad;
    });

    // Ya no necesitamos configurar sliders, pero mantenemos la función para compatibilidad
}

// Función para configurar el formateo automático de los campos de tarjeta
function configurarCamposTarjeta() {
    const numeroTarjetaInput = document.getElementById('numeroTarjeta');
    const fechaExpiracionInput = document.getElementById('fechaExpiracion');
    const cvvInput = document.getElementById('cvv');
    const tipoTarjetaIcon = document.createElement('div');

    // Añadir el icono del tipo de tarjeta después del campo de número
    tipoTarjetaIcon.className = 'card-type-icon';
    tipoTarjetaIcon.innerHTML = '<i class="bi bi-credit-card"></i>';
    if (numeroTarjetaInput) {
        numeroTarjetaInput.parentNode.appendChild(tipoTarjetaIcon);
    }

    // Formatear número de tarjeta y detectar tipo
    if (numeroTarjetaInput) {
        numeroTarjetaInput.addEventListener('input', function (e) {
            // Obtener el valor actual y la posición del cursor
            const cursorPos = this.selectionStart;
            const valorOriginal = this.value;

            // Eliminar espacios y caracteres no numéricos
            let valor = valorOriginal.replace(/\D/g, '');

            // Limitar a 19 dígitos (16 + posibles espacios)
            valor = valor.substring(0, 19);

            // Formatear con espacios cada 4 dígitos
            const valorFormateado = window.validaciones.formatearNumeroTarjeta(valor);

            // Actualizar el valor del campo
            this.value = valorFormateado;

            // Ajustar la posición del cursor si se añadió un espacio
            const espaciosAntesOriginal = (valorOriginal.substring(0, cursorPos).match(/ /g) || []).length;
            const espaciosAntesNuevo = (valorFormateado.substring(0, cursorPos).match(/ /g) || []).length;
            const ajuste = espaciosAntesNuevo - espaciosAntesOriginal;
            this.setSelectionRange(cursorPos + ajuste, cursorPos + ajuste);

            // Detectar y mostrar el tipo de tarjeta
            const tipoTarjeta = window.validaciones.detectarTipoTarjeta(valor);
            actualizarIconoTarjeta(tipoTarjeta, tipoTarjetaIcon);
        });
    }

    // Formatear fecha de expiración (MM/YY)
    if (fechaExpiracionInput) {
        fechaExpiracionInput.addEventListener('input', function (e) {
            // Obtener el valor actual y la posición del cursor
            const cursorPos = this.selectionStart;
            const valorOriginal = this.value;

            // Formatear la fecha
            const valorFormateado = window.validaciones.formatearFechaExpiracion(valorOriginal);

            // Actualizar el valor del campo
            this.value = valorFormateado;

            // Ajustar la posición del cursor si se añadió una barra
            if (valorOriginal.length === 2 && valorFormateado.length === 3) {
                this.setSelectionRange(3, 3);
            } else {
                this.setSelectionRange(cursorPos, cursorPos);
            }
        });
    }

    // Limitar CVV a 3-4 dígitos numéricos
    if (cvvInput) {
        cvvInput.addEventListener('input', function (e) {
            // Eliminar caracteres no numéricos
            let valor = this.value.replace(/\D/g, '');

            // Limitar a 4 dígitos (para American Express) o 3 para otras tarjetas
            const tipoTarjeta = window.validaciones.detectarTipoTarjeta(numeroTarjetaInput.value);
            const maxLength = (tipoTarjeta === 'amex') ? 4 : 3;
            valor = valor.substring(0, maxLength);

            // Actualizar el valor del campo
            this.value = valor;
        });
    }
}

// Función para actualizar el icono del tipo de tarjeta
function actualizarIconoTarjeta(tipo, iconoElement) {
    let iconoHTML = '<i class="bi bi-credit-card"></i>';

    switch (tipo) {
        case 'visa':
            iconoHTML = '<img src="Imagenes/Iconos/visa.svg" alt="Visa" height="20">';
            break;
        case 'mastercard':
            iconoHTML = '<img src="Imagenes/Iconos/mastercard.svg" alt="Mastercard" height="20">';
            break;
        case 'amex':
            iconoHTML = '<img src="Imagenes/Iconos/amex.svg" alt="American Express" height="20">';
            break;
        case 'discover':
            iconoHTML = '<img src="Imagenes/Iconos/discover.svg" alt="Discover" height="20">';
            break;
        case 'diners':
            iconoHTML = '<img src="Imagenes/Iconos/diners.svg" alt="Diners Club" height="20">';
            break;
        case 'jcb':
            iconoHTML = '<img src="Imagenes/Iconos/jcb.svg" alt="JCB" height="20">';
            break;
    }

    iconoElement.innerHTML = iconoHTML;
}

// Función para mostrar la confirmación de compra
function mostrarConfirmacion() {
    // Generar número de pedido aleatorio
    const numeroPedido = `MKW-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;

    // Obtener fecha actual formateada
    const fecha = new Date();
    const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

    // Calcular total
    let subtotal = 0;
    carrito.forEach(producto => {
        subtotal += producto.Precio * producto.Cantidad;
    });

    const envio = datosCliente.tipoEntrega === 'tienda' ? 0 : 15;
    const total = subtotal + envio - descuentoAplicado;

    // Actualizar información en la pantalla de confirmación
    document.getElementById('numero-pedido').textContent = numeroPedido;
    document.getElementById('fecha-pedido').textContent = fechaFormateada;
    document.getElementById('total-pedido').textContent = `S/ ${total.toFixed(2)}`;

    // Mostrar detalles del método de pago
    let metodoPagoTexto = '';

    // Ya no hay pagos mixtos, solo un método de pago
    metodoPagoTexto = detallesPago.tipo.charAt(0).toUpperCase() + detallesPago.tipo.slice(1);
    document.getElementById('metodo-pago').textContent = metodoPagoTexto;

    // Guardar información del pedido para el comprobante
    const pedido = {
        id: numeroPedido,  // Añadir id para evitar undefined
        numero: numeroPedido,
        fecha: fechaFormateada,
        cliente: datosCliente.nombre,
        direccion: datosCliente.direccion,
        ciudad: `${datosCliente.departamento}, ${datosCliente.ciudad}`,
        metodoPago: metodoPagoTexto,
        productos: carrito,
        subtotal: subtotal.toFixed(2),
        envio: envio.toFixed(2),
        descuento: descuentoAplicado.toFixed(2),
        total: total.toFixed(2),
        estado: 'Completado'
    };

    localStorage.setItem('ultimoPedido', JSON.stringify(pedido));

    // Guardar en historial de compras
    guardarCompraEnHistorial(pedido);

    // Vaciar carrito
    vaciarCarrito();
}

async function guardarCompraEnHistorial(pedido) {
    const token = localStorage.getItem('token');

    if (!token) {
        let historialCompras = JSON.parse(localStorage.getItem('historialCompras') || '[]');
        historialCompras.push(pedido);
        localStorage.setItem('historialCompras', JSON.stringify(historialCompras));
        return;
    }

    try {
        const datosParaAPI = {
            IdPedido: pedido.IdPedido || pedido.id || `MKW-${Date.now().toString().slice(-8)}`,
            IdUsuario: pedido.IdUsuario,
            IdDireccion: pedido.IdDireccion,
            FechaPedido: pedido.FechaPedido || new Date().toISOString(),
            Estado: pedido.Estado || 'Pendiente',
            total: parseFloat(pedido.total),
            MetodoPago: pedido.MetodoPago || pedido.metodoPago,

            detalles: pedido.productos.map(p => ({
                IdDetallePedido: p.IdDetallePedido || null,
                IdPedido: pedido.IdPedido,
                IdProducto: p.id,
                Cantidad: p.cantidad,
                PrecioUnitario: p.precio,
                Descuento: p.descuento || 0
            }))
        };

        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(datosParaAPI)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al guardar el pedido en la API: ${errorData.message || JSON.stringify(errorData)}`);
        }
    } catch (error) {
        console.error('Error al guardar compra en API:', error);

        let historialCompras = JSON.parse(localStorage.getItem('historialCompras') || '[]');
        historialCompras.push(pedido);
        localStorage.setItem('historialCompras', JSON.stringify(historialCompras));
    }
}


// Función para vaciar el carrito
async function vaciarCarrito() {
    const token = localStorage.getItem('token');

    try {
        if (token) {
            // Llamada a la API para vaciar el carrito
            await fetch('/api/carrito/vaciar/todo', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        // Limpiar localStorage
        localStorage.removeItem('productosSeleccionados');

        // Actualizar contador del carrito
        if (typeof window.actualizarContadorCarrito === 'function') {
            window.actualizarContadorCarrito();
        }
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
    }
}

// Función para generar el comprobante en PDF
function generarComprobantePDF() {
    // Obtener datos del pedido
    const pedidoJSON = localStorage.getItem('ultimoPedido');
    if (!pedidoJSON) {
        mostrarToast('No se encontró información del pedido', 'error');
        return;
    }

    const pedido = JSON.parse(pedidoJSON);

    // Crear nuevo documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colores de la marca
    const hotpink = [255, 105, 180];
    const hotpinkLight = [255, 182, 219];

    // Añadir encabezado con logo y título
    doc.setFillColor(hotpink[0], hotpink[1], hotpink[2]);
    doc.rect(0, 0, 210, 30, 'F');

    // Título del comprobante
    doc.setTextColor(255, 255, 255); // Texto blanco
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MAKAWI STORE', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('COMPROBANTE DE COMPRA', 105, 23, { align: 'center' });

    // Resetear color de texto
    doc.setTextColor(0, 0, 0);

    // Información del pedido en un cuadro
    doc.setFillColor(245, 245, 245); // Fondo gris claro
    doc.roundedRect(15, 35, 180, 60, 3, 3, 'F');

    // Título de la sección
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(hotpink[0] / 255, hotpink[1] / 255, hotpink[2] / 255);
    doc.text('INFORMACIÓN DEL PEDIDO', 20, 45);

    // Detalles del pedido
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Columna izquierda
    doc.text(`Número de pedido: ${pedido.numero}`, 20, 55);
    doc.text(`Fecha: ${pedido.fecha}`, 20, 65);
    doc.text(`Método de pago: ${pedido.metodoPago}`, 20, 75);

    // Columna derecha
    doc.text(`Cliente: ${pedido.cliente || 'Cliente'}`, 110, 55);
    doc.text(`Dirección: ${pedido.direccion}`, 110, 65);
    doc.text(`Ciudad: ${pedido.ciudad}`, 110, 75);

    // Estado del pedido
    doc.setFillColor(hotpink[0], hotpink[1], hotpink[2]);
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(150, 85, 45, 10, 2, 2, 'F');
    doc.setFontSize(10);
    doc.text('COMPLETADO', 172.5, 91.5, { align: 'center' });

    // Tabla de productos
    const headers = [['Producto', 'Precio', 'Cantidad', 'Subtotal']];
    const data = pedido.productos.map(p => [
        p.Nombre,
        `S/ ${parseFloat(p.Precio).toFixed(2)}`,
        p.Cantidad,
        `S/ ${(p.Precio * p.Cantidad).toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 105,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: {
            fillColor: hotpink,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        alternateRowStyles: {
            fillColor: [255, 240, 245]
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 15, right: 15 }
    });

    // Totales en un cuadro
    const finalY = doc.lastAutoTable.finalY + 10;

    // Cuadro para los totales
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(105, finalY, 90, 50, 3, 3, 'F');

    // Líneas de totales
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('Subtotal:', 115, finalY + 10);
    doc.text(`S/ ${pedido.subtotal}`, 185, finalY + 10, { align: 'right' });

    doc.text('Envío:', 115, finalY + 20);
    doc.text(`S/ ${pedido.envio}`, 185, finalY + 20, { align: 'right' });

    doc.text('Descuento:', 115, finalY + 30);
    doc.text(`-S/ ${pedido.descuento}`, 185, finalY + 30, { align: 'right' });

    // Línea divisoria
    doc.setDrawColor(hotpink[0], hotpink[1], hotpink[2]);
    doc.setLineWidth(0.5);
    doc.line(115, finalY + 35, 185, finalY + 35);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(hotpink[0] / 255, hotpink[1] / 255, hotpink[2] / 255);
    doc.setFontSize(13);
    doc.text('TOTAL:', 115, finalY + 45);
    doc.text(`S/ ${pedido.total}`, 185, finalY + 45, { align: 'right' });

    // Pie de página
    doc.setFillColor(hotpink[0], hotpink[1], hotpink[2]);
    doc.rect(0, 277, 210, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Gracias por tu compra en Makawi Store', 105, 285, { align: 'center' });
    doc.text('www.makawistore.com | contacto@makawistore.com | +51 932 204 477', 105, 292, { align: 'center' });

    // Guardar el PDF
    doc.save(`comprobante_${pedido.numero}.pdf`);
}

const btnAplicarPromo = document.getElementById('aplicar-promo');
if (btnAplicarPromo) {
    btnAplicarPromo.addEventListener('click', aplicarCodigoPromocional);
}

