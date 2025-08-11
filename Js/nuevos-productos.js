document.addEventListener("DOMContentLoaded", () => {
  cargarProductosNuevos();
  
  // Agregar event listeners para los botones de navegación
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-prev-nuevos') || e.target.closest('.btn-prev-nuevos')) {
      desplazarProductos('prev');
    } else if (e.target.matches('.btn-next-nuevos') || e.target.closest('.btn-next-nuevos')) {
      desplazarProductos('next');
    }
  });
});

// Implementar las funciones para agregar a favoritos y al carrito

/**
 * Agrega un producto a favoritos
 * @param {number} idProducto - ID del producto a agregar a favoritos
 */
function agregarAFavoritos(idProducto) {
  const token = localStorage.getItem("token");
  if (!token) {
    mostrarToast("Debes iniciar sesión para agregar a favoritos", "info");
    return;
  }

  fetch("/api/favoritos/agregar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ IdProducto: idProducto }),
  })
    .then(res => {
      if (res.status === 409) {
        mostrarToast("Ya está en favoritos", "info");
      } else if (res.ok) {
        mostrarToast("Agregado a favoritos", "success");
      } else if (res.status === 401) {
        mostrarToast("Sesión expirada. Inicia sesión nuevamente.", "error");
      } else {
        mostrarToast("Error al agregar a favoritos", "error");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      mostrarToast("Error del servidor", "error");
    });
}

/**
 * Agrega un producto al carrito
 * @param {number} idProducto - ID del producto a agregar al carrito
 */
async function agregarAlCarrito(idProducto) {
  const token = localStorage.getItem("token");
  if (!token) {
    mostrarToast("Debes iniciar sesión para agregar al carrito", "info");
    return;
  }

  try {
    // Obtener la cantidad (por defecto 1 en este caso)
    let cantidad = 1;

    // Primero verificar si el producto ya está en el carrito
    const resCarrito = await fetch("/api/carrito", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!resCarrito.ok) {
      throw new Error(`Error al obtener carrito: ${resCarrito.status}`);
    }
    
    const productosCarrito = await resCarrito.json();
    
    // Asegurarse de que productosCarrito sea un array
    if (!Array.isArray(productosCarrito)) {
      console.error("Error: productosCarrito no es un array", productosCarrito);
      // Si no es un array, simplemente agregamos el producto
      await agregarProductoDirectamente(idProducto, cantidad);
      return;
    }
    
    // Verificar si el producto ya existe en el carrito
    const productoExistente = productosCarrito.find(p => p.IdProducto === idProducto);
    
    if (productoExistente) {
      // El producto ya está en el carrito
      mostrarToast("Este producto ya está en tu carrito", "info");
      return;
    }
    
    // Si no existe, agregarlo al carrito
    const res = await fetch("/api/carrito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ idProducto, cantidad }),
    });

    if (res.ok) {
      mostrarToast("Agregado al carrito", "success");
      // Usar la función global actualizarContadorCarrito desde layout-loader.js
      if (typeof window.actualizarContadorCarrito === "function") {
        window.actualizarContadorCarrito();
      }
    } else {
      mostrarToast("Error al agregar al carrito", "error");
    }
  } catch (err) {
    console.error("Error:", err);
    mostrarToast("Error del servidor", "error");
  }
}

/**
 * Función auxiliar para agregar producto directamente sin verificar si ya existe
 * @param {number} idProducto - ID del producto a agregar
 * @param {number} cantidad - Cantidad a agregar
 * @returns {Promise<boolean>} - True si se agregó correctamente, false en caso contrario
 */
async function agregarProductoDirectamente(idProducto, cantidad) {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const res = await fetch("/api/carrito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ idProducto, cantidad }),
    });

    if (res.ok) {
      mostrarToast("Agregado al carrito", "success");
      // Actualizar contador
      if (typeof window.actualizarContadorCarrito === "function") {
        window.actualizarContadorCarrito();
      }
      return true;
    } else {
      mostrarToast("Error al agregar al carrito", "error");
      return false;
    }
  } catch (err) {
    console.error("Error al agregar producto directamente:", err);
    mostrarToast("Error del servidor", "error");
    return false;
  }
}

/**
 * Muestra un toast con un mensaje
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de toast (success, error, info, warning)
 */
function mostrarToast(mensaje, tipo = "info") {
  // Verificar si existe la función global mostrarToast en window pero que no sea esta misma función
  if (window.mostrarToast && window.mostrarToast !== mostrarToast) {
    window.mostrarToast(mensaje, tipo);
    return;
  }
  
  // Si no existe, implementamos una versión básica
  let toast = document.getElementById("toast-notification");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "toast-notificacion";
    toast.innerHTML = `<span id="mensaje-toast"></span>`;
    document.body.appendChild(toast);
  }
  
  toast.className = `toast-notificacion toast-${tipo} show`;
  const mensajeSpan = toast.querySelector("#mensaje-toast") || toast;
  mensajeSpan.textContent = mensaje;
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Exportar funciones al contexto global para que puedan ser utilizadas por los botones
window.agregarAFavoritos = agregarAFavoritos;
window.agregarAlCarrito = agregarAlCarrito;
window.desplazarProductos = desplazarProductos;

// Cargar productos nuevos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarProductosNuevos);

/**
 * Desplaza el carrusel de productos nuevos
 * @param {string} direccion - Dirección del desplazamiento ('prev' o 'next')
 */
function desplazarProductos(direccion) {
  const productosWrapper = document.querySelector('.productos-wrapper');
  if (!productosWrapper) return;
  
  // Calculamos el ancho de un producto más el gap
  const productoCard = productosWrapper.querySelector('.producto-card');
  if (!productoCard) return;
  
  // Ancho de un producto + gap (20px definido en CSS)
  const cardWidth = productoCard.offsetWidth + 20;
  
  // Desplazamos el equivalente a un producto
  if (direccion === 'prev') {
    productosWrapper.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  } else {
    productosWrapper.scrollBy({ left: cardWidth, behavior: 'smooth' });
  }
}

/**
 * Carga los productos más nuevos para mostrarlos en la sección "Lo más nuevo" del index
 */
async function cargarProductosNuevos() {
  try {
    // Obtenemos los productos nuevos desde la API específica
    const res = await fetch("/api/productos/nuevos-productos");
    if (!res.ok) throw new Error("Error al cargar productos nuevos");
    
    const productos = await res.json();
    
    // Verificamos que productos sea un array
    if (!Array.isArray(productos)) {
      console.error('Productos nuevos recibidos no es un array:', productos);
      return;
    }
    
    // Mostramos los productos en la sección "Lo más nuevo"
    mostrarProductosNuevos(productos);
    
  } catch (error) {
    console.error("❌ Error al cargar productos nuevos:", error);
  }
}

/**
 * Muestra los productos nuevos en la sección correspondiente
 * @param {Array} productos - Array de productos a mostrar
 */
function mostrarProductosNuevos(productos) {
  const contenedor = document.getElementById("productos-nuevos");
  if (!contenedor) return;
  
  // Limpiamos el contenedor y agregamos la clase para el carrusel
  contenedor.innerHTML = "";
  contenedor.classList.add("productos-carrusel");
  
  // Si no hay productos, mostramos un mensaje
  if (productos.length === 0) {
    contenedor.innerHTML = `
      <div class="no-productos text-center py-5">
        <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #ccc;"></i>
        <p class="mt-3">No se encontraron productos nuevos</p>
      </div>
    `;
    return;
  }
  
  // Creamos el contenedor del carrusel con los botones de navegación
  const carruselContainer = document.createElement("div");
  carruselContainer.classList.add("carrusel-container");
  
  // Botón anterior
  const btnPrev = document.createElement("button");
  btnPrev.classList.add("btn-carrusel", "btn-prev-nuevos");
  btnPrev.innerHTML = `<i class="bi bi-chevron-left"></i>`;
  carruselContainer.appendChild(btnPrev);
  
  // Contenedor de productos
  const productosWrapper = document.createElement("div");
  productosWrapper.classList.add("productos-wrapper");
  
  // Mostramos cada producto
  productos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto-card");
    
    // Verificar si hay precio de oferta
    const precioMostrar = producto.precioOferta && producto.precioOferta < producto.precio ? 
      `<span class="precio-original">S/ ${producto.precio}</span> <span class="precio-oferta">S/ ${producto.precioOferta}</span>` : 
      `S/ ${producto.precio}`;
    
    // Verificar stock y mostrar badge si es necesario
    const stockBadge = producto.stock <= 0 ? 
      `<div class="producto-badge bg-danger">Agotado</div>` : 
      (producto.precioOferta && producto.precioOferta < producto.precio ? 
        `<div class="producto-badge">Oferta</div>` : '');

    div.innerHTML = `
      <div class="producto-img-container">
        ${stockBadge}
        <img class="producto-img" src="${producto.imagen || '/Imagenes/no-disponible.png'}" alt="${producto.nombre}" />
      </div>
      <div class="producto-info">
        <h5 class="producto-nombre">${producto.nombre}</h5>
        <div class="producto-precio">${precioMostrar}</div>
        
        <div class="producto-acciones">
          <div class="botones-centrados">
            <button class="btn-favorito" onclick="agregarAFavoritos(${producto.idProducto})" ${producto.stock <= 0 ? 'disabled' : ''}>
              <i class="bi bi-heart"></i>
            </button>
            <button class="btn btn-producto btn-agregar" onclick="agregarAlCarrito(${producto.idProducto})" ${producto.stock <= 0 ? 'disabled' : ''}>
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    productosWrapper.appendChild(div);
  });
  
  carruselContainer.appendChild(productosWrapper);
  
  // Botón siguiente
  const btnNext = document.createElement("button");
  btnNext.classList.add("btn-carrusel", "btn-next-nuevos");
  btnNext.innerHTML = `<i class="bi bi-chevron-right"></i>`;
  carruselContainer.appendChild(btnNext);
  
  // Agregamos el carrusel al contenedor principal
  contenedor.appendChild(carruselContainer);
  
  // Añadimos los event listeners a los botones de navegación
  btnPrev.addEventListener('click', () => desplazarProductos('prev'));
  btnNext.addEventListener('click', () => desplazarProductos('next'));
}