document.addEventListener("DOMContentLoaded", () => {
  configurarBuscador();
  cargarCategorias();

  const params = new URLSearchParams(window.location.search);
  const idCategoria = params.get('categoria');

  if (idCategoria) {
    mostrarNombreCategoria(idCategoria);
    cargarProductosPorCategoria(idCategoria);
  } else {
    cargarProductos();
  }
  
  // El contador del carrito se actualiza automáticamente desde layout-loader.js
  
  // Configurar los controles de cantidad en el modal
  configurarControlesCantidadModal();
});

// Configurar los controles de cantidad en el modal
function configurarControlesCantidadModal() {
  const btnDisminuir = document.getElementById('btn-disminuir');
  const btnAumentar = document.getElementById('btn-aumentar');
  const inputCantidad = document.getElementById('modal-cantidad');
  
  if (btnDisminuir && btnAumentar && inputCantidad) {
    btnDisminuir.addEventListener('click', () => {
      const valorActual = parseInt(inputCantidad.value);
      if (valorActual > 1) {
        inputCantidad.value = valorActual - 1;
      }
    });
    
    btnAumentar.addEventListener('click', () => {
      const valorActual = parseInt(inputCantidad.value);
      const max = parseInt(inputCantidad.getAttribute('max') || 10);
      if (valorActual < max) {
        inputCantidad.value = valorActual + 1;
      }
    });
  }
}

// La función actualizarContadorCarrito se ha eliminado ya que esta funcionalidad
// está implementada en layout-loader.js para evitar duplicación y posibles conflictos

// 🔄 Cargar todos los productos
function cargarProductos() {
  fetch("/api/productos")
    .then(res => res.json())
    .then(productos => mostrarProductos(productos))
    .catch(err => {
      console.error("Error al cargar productos:", err);
      mostrarToast("No se pudieron cargar los productos", "error");
    });
}

// 🔍 Buscador dinámico
function configurarBuscador() {
  const buscador = document.querySelector(".busqueda");
  if (!buscador) return;
  
  // Animación del icono de búsqueda
  let timeoutId;
  buscador.addEventListener("input", () => {
    const termino = buscador.value.toLowerCase();
    const productos = document.querySelectorAll(".producto-card");
    const busquedaIcon = document.querySelector('.busqueda-icon');
    
    // Animar el icono de búsqueda
    if (busquedaIcon) {
      busquedaIcon.classList.add('animate__animated', 'animate__pulse');
      
      // Eliminar la clase después de un tiempo para permitir que se repita
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        busquedaIcon.classList.remove('animate__animated', 'animate__pulse');
      }, 500);
    }

    // Filtrar productos
    productos.forEach(prod => {
      const nombre = prod.querySelector(".producto-nombre").textContent.toLowerCase();
      const descripcion = prod.querySelector(".producto-descripcion")?.textContent.toLowerCase() || "";
      prod.style.display = nombre.includes(termino) || descripcion.includes(termino) ? "" : "none";
    });
    
    // Mostrar mensaje si no hay resultados
    const hayResultados = Array.from(productos).some(prod => prod.style.display !== 'none');
    let mensajeNoResultados = document.querySelector('.no-resultados');
    
    if (!hayResultados && termino.length > 0) {
      if (!mensajeNoResultados) {
        mensajeNoResultados = document.createElement('div');
        mensajeNoResultados.className = 'no-resultados text-center py-5 animate__animated animate__fadeIn';
        mensajeNoResultados.innerHTML = `
          <i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i>
          <p class="mt-3">No se encontraron productos que coincidan con "${termino}"</p>
        `;
        document.getElementById('contenedor-productos').appendChild(mensajeNoResultados);
      } else {
        mensajeNoResultados.querySelector('p').textContent = `No se encontraron productos que coincidan con "${termino}"`;
      }
    } else if (mensajeNoResultados) {
      mensajeNoResultados.remove();
    }
  });
}

// 📁 Cargar y mostrar categorías
function cargarCategorias() {
  fetch("/api/categorias")
    .then(res => res.json())
    .then(categorias => {
      const select = document.getElementById("select-categorias");
      if (!select) return;

      select.innerHTML = `
        <option value="0">Todas las categorías</option>
      `;

      // Verificar si categorias es un array
      if (!Array.isArray(categorias)) {
        console.log('Categorías recibidas:', categorias);
        return;
      }

      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.idCategoria;
        option.textContent = cat.nombre;
        select.appendChild(option);
      });
      
      // Añadir event listener para filtrar al cambiar la categoría
      select.addEventListener('change', function() {
        const categoriaSeleccionada = this.value;
        if (categoriaSeleccionada === "0") {
          cargarProductos();
        } else {
          cargarProductosPorCategoria(categoriaSeleccionada);
        }
      });

      // Aplicar animación al select cuando cambia
      select.addEventListener('change', function() {
        const iconContainer = document.querySelector('.categorias .icon-container');
        if (iconContainer) {
          iconContainer.classList.add('animate__animated', 'animate__heartBeat');
          setTimeout(() => {
            iconContainer.classList.remove('animate__animated', 'animate__heartBeat');
          }, 1000);
        }
      });
    })
    .catch(err => console.error("Error al cargar categorías:", err));
}


// 🔘 Filtro: Mostrar todos
function mostrarTodosLosProductos() {
  cargarProductos();
}

// 🔘 Filtro por categoría
function filtrarPorCategoria(idCategoria) {
  const productos = document.querySelectorAll(".producto-item");
  productos.forEach(prod => {
    const catId = prod.getAttribute("data-categoria-id");
    prod.style.display = (catId === idCategoria.toString()) ? "" : "none";
  });
}

// 🏷 Mostrar nombre de categoría (si se accede por query string)
async function mostrarNombreCategoria(idCategoria) {
  try {
    const res = await fetch(`/api/categorias/${idCategoria}`);
    const categoria = await res.json();
    
    // Verificar si la categoría es un objeto válido
    if (!categoria || typeof categoria !== 'object' || !categoria.nombre) {
      console.log('Categoría recibida:', categoria);
      return;
    }

    // Actualizar el selector de categorías
    const selectCategorias = document.getElementById('select-categorias');
    if (selectCategorias) {
      selectCategorias.value = idCategoria;
    }

    // Crear y mostrar el título de la categoría
    const titulo = document.createElement("h2");
    titulo.className = "titulo-categoria";
    titulo.textContent = `Productos en: ${categoria.nombre}`;

    // Insertar el título en la sección de productos
    const productosContainer = document.querySelector('.productos-container');
    const productosHeader = document.querySelector('.productos-header');
    
    // Eliminar título anterior si existe
    const tituloAnterior = document.querySelector('.titulo-categoria');
    if (tituloAnterior) {
      tituloAnterior.remove();
    }
    
    if (productosHeader) {
      productosHeader.prepend(titulo);
    } else if (productosContainer) {
      productosContainer.prepend(titulo);
    }
  } catch (error) {
    console.error('❌ Error al obtener nombre de la categoría:', error);
    mostrarToast("No se pudo obtener la categoría", "error");
  }
}

// 🔄 Cargar productos filtrados por categoría
async function cargarProductosPorCategoria(idCategoria) {
  try {
    const res = await fetch(`/api/productos?categoria=${idCategoria}`);
    const productos = await res.json();
    
    // Verificar si productos es un array
    if (!Array.isArray(productos)) {
      console.log('Productos por categoría recibidos:', productos);
      mostrarProductos([]);
      return;
    }
    
    mostrarProductos(productos);
  } catch (error) {
    console.error("❌ Error al cargar productos por categoría:", error);
    mostrarToast("No se pudieron cargar los productos", "error");
  }
}

// 📦 Mostrar productos en la grid
function mostrarProductos(productos) {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;
  
  contenedor.innerHTML = "";

  // Verificar si productos es un array
  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    console.log('Productos recibidos:', productos);
    contenedor.innerHTML = `
      <div class="no-productos text-center py-5">
        <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #ccc;"></i>
        <p class="mt-3">No se encontraron productos</p>
      </div>
    `;
    return;
  }

  productos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto-card");
    div.setAttribute("data-categoria-id", producto.idCategoria || "");
    
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
      <div class="producto-img-container" onclick="verDetalles(${producto.idProducto}, true)" style="cursor: pointer;">
        ${stockBadge}
        <img class="producto-img" src="${producto.imagen || '/Imagenes/no-disponible.png'}" alt="${producto.nombre}" />
      </div>
      <div class="producto-info">
        <h5 class="producto-nombre" onclick="verDetalles(${producto.idProducto}, true)" style="cursor: pointer;">${producto.nombre}</h5>
        <div class="producto-precio">${precioMostrar}</div>
        
        <div class="producto-acciones">
          <button class="btn btn-producto btn-detalles" onclick="verDetalles(${producto.idProducto})">Ver detalles</button>
          <div>
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
    contenedor.appendChild(div);
  });
}

// 🔍 Ver detalles del producto
function verDetalles(idProducto, verPaginaCompleta = false) {
  // Si se solicita ver la página completa, redirigir
  if (verPaginaCompleta) {
    window.location.href = `detalle.html?id=${idProducto}`;
    return;
  }
  
  // Mostrar el modal con los detalles del producto
  fetch(`/api/productos/${idProducto}`)
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el producto');
      return response.json();
    })
    .then(producto => {
      // Configurar el modal con los datos del producto
      document.getElementById('detalleNombre').textContent = producto.nombre;
      document.getElementById('detalleCategoria').textContent = producto.categoria;
      document.getElementById('detalleDescripcion').textContent = producto.descripcion;
      
      // Configurar la imagen
      document.getElementById('detalleImagen').src = producto.imagen || '/Imagenes/no-disponible.png';
      
      // Configurar el precio
      const precioElement = document.getElementById('detallePrecio');
      if (producto.precioOferta && producto.precioOferta < producto.precio) {
        precioElement.innerHTML = `
          <span class="precio-original">S/ ${producto.precio}</span>
          <span class="precio-oferta">S/ ${producto.precioOferta}</span>
        `;
      } else {
        precioElement.textContent = `S/ ${producto.precio}`;
      }
      
      // Configurar el botón de ver página completa
      const btnVerPaginaCompleta = document.getElementById('btnVerPaginaCompleta');
      btnVerPaginaCompleta.href = `detalle.html?id=${idProducto}`;
      
      // Configurar el stock
       const stockElement = document.getElementById('detalleStock');
       const inputCantidad = document.getElementById('modal-cantidad');
       
       if (producto.stock > 0) {
         stockElement.innerHTML = `<span class="text-success"><i class="bi bi-check-circle"></i> En stock (${producto.stock} disponibles)</span>`;
         document.getElementById('btnAgregarDesdeModal').disabled = false;
         document.getElementById('btnAgregarDesdeModal').innerHTML = '<i class="bi bi-cart-plus me-2"></i> Agregar al carrito';
         
         // Establecer el máximo según el stock disponible
         inputCantidad.setAttribute('max', producto.stock);
       } else {
         stockElement.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle"></i> Agotado</span>`;
         document.getElementById('btnAgregarDesdeModal').disabled = true;
         document.getElementById('btnAgregarDesdeModal').innerHTML = 'Producto agotado';
         
         // Deshabilitar el input de cantidad
         inputCantidad.disabled = true;
       }
       
       // Resetear la cantidad
       inputCantidad.value = 1;
       inputCantidad.disabled = producto.stock <= 0;
      
      // Configurar el botón de agregar al carrito
      const btnAgregar = document.getElementById('btnAgregarDesdeModal');
      btnAgregar.onclick = () => {
        const cantidad = parseInt(document.getElementById('modal-cantidad').value);
        agregarAlCarrito(producto.idProducto, cantidad);
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('detalleProductoModal'));
        modal.hide();
      };
      

      
      // Mostrar el modal
      const modal = new bootstrap.Modal(document.getElementById('detalleProductoModal'));
      modal.show();
    })
    .catch(error => {
      console.error('Error al cargar el producto:', error);
      mostrarToast('Error al cargar el producto', 'error');
    });
}

// Función auxiliar para agregar producto directamente sin verificar si ya existe
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

// 🛒 Agregar al carrito
async function agregarAlCarrito(idProducto) {
  const token = localStorage.getItem("token");
  if (!token) {
    mostrarToast("Debes iniciar sesión para agregar al carrito", "info");
    return;
  }

  try {
    // Obtener la cantidad si se está agregando desde el modal
    let cantidad = 1;
    const inputCantidad = document.getElementById('modal-cantidad');
    if (inputCantidad && !isNaN(parseInt(inputCantidad.value))) {
      cantidad = parseInt(inputCantidad.value);
    }

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
      // Cerrar modal si está abierto
      const modalElement = document.getElementById('detalleProductoModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
    } else {
      mostrarToast("Error al agregar al carrito", "error");
    }
  } catch (err) {
    console.error("Error:", err);
    mostrarToast("Error del servidor", "error");
  }
}

// ❤️ Agregar a favoritos
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

// Esta función ya está definida arriba como async function

// 🌐 Exportar funciones al contexto global
window.agregarAFavoritos = agregarAFavoritos;
window.agregarAlCarrito = agregarAlCarrito;
window.verDetalles = verDetalles;
