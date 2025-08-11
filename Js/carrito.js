window.addEventListener("DOMContentLoaded", () => {
  cargarCarrito();
  
  // Configurar el botón de continuar compra una sola vez
  const btnContinuar = document.getElementById("continuar-compra");
  if (btnContinuar) {
    btnContinuar.addEventListener("click", function() {
      // Guardar productos seleccionados en localStorage
      localStorage.setItem("productosSeleccionados", JSON.stringify(productosSeleccionados));
      window.location.href = "checkout.html";
    });
  }
  
  // Configurar el botón de vaciar carrito
  const btnVaciarCarrito = document.querySelector(".btn-vaciar-carrito");
  if (btnVaciarCarrito) {
    btnVaciarCarrito.addEventListener("click", function() {
      vaciarCarrito();
    });
  }
});

// Almacenar los productos seleccionados
let productosSeleccionados = [];

// 📦 Cargar productos del carrito
async function cargarCarrito() {
  const contenedor = document.getElementById("carrito-container");
  const totalSpan = document.getElementById("total-carrito");
  const token = localStorage.getItem("token");

  if (!token) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <i class="bi bi-cart-x"></i>
        <p>Inicia sesión para ver tu carrito.</p>
        <button class="btn btn-seguir-comprando" id="btn-iniciar-sesion">Iniciar sesión</button>
      </div>
    `;
    totalSpan.textContent = "0.00";
    
    // Agregar evento para abrir el popup de login
    document.getElementById("btn-iniciar-sesion").addEventListener("click", function() {
      const loginPopupOverlay = document.getElementById("loginPopupOverlay");
      if (loginPopupOverlay) {
        loginPopupOverlay.style.display = "flex";
      }
    });
    
    return;
  }

  try {
    const res = await fetch("/api/carrito", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const productos = await res.json();

    if (!res.ok || !Array.isArray(productos) || productos.length === 0) {
      mostrarCarritoVacio();
      return;
    }

    contenedor.innerHTML = "";
    let total = 0;
    let descuento = 0;
    
    // Inicializar todos los productos como seleccionados si es la primera carga
    if (productosSeleccionados.length === 0) {
      productosSeleccionados = productos.map(p => p.IdProducto);
    }

    // Añadir botón para seleccionar/deseleccionar todos
    const selectAllContainer = document.createElement("div");
    selectAllContainer.className = "mb-3 d-flex align-items-center";
    selectAllContainer.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="selectAll" ${productosSeleccionados.length === productos.length ? 'checked' : ''}>
        <label class="form-check-label" for="selectAll">Seleccionar todos</label>
      </div>
    `;
    contenedor.appendChild(selectAllContainer);
    
    // Configurar evento para seleccionar/deseleccionar todos
    document.getElementById("selectAll").addEventListener("change", function() {
      if (this.checked) {
        productosSeleccionados = productos.map(p => p.IdProducto);
      } else {
        productosSeleccionados = [];
      }
      cargarCarrito(); // Recargar para actualizar checkboxes y totales
    });

    productos.forEach(p => {
      const subtotal = parseFloat(p.Precio) * p.Cantidad;
      // Solo sumar al total si está seleccionado
      if (productosSeleccionados.includes(p.IdProducto)) {
        total += subtotal;
      }

      const item = document.createElement("div");
      item.className = "carrito-item";
      item.innerHTML = `
        <div class="form-check me-3">
          <input class="form-check-input producto-checkbox" type="checkbox" value="${p.IdProducto}" 
            id="check-${p.IdProducto}" ${productosSeleccionados.includes(p.IdProducto) ? 'checked' : ''}>
        </div>
        <div class="item-imagen">
          <img src="/Imagenes/Productos/${p.ImagenURL}" alt="${p.Nombre}">
        </div>
        <div class="item-detalles">
          <div class="item-nombre">${p.Nombre}</div>
          <div class="item-precio">S/ ${parseFloat(p.Precio).toFixed(2)}</div>
          <div class="item-cantidad">
            <div class="cantidad-control">
              <button class="btn-cantidad" onclick="actualizarCantidad(${p.IdProducto}, Math.max(1, ${p.Cantidad} - 1))">-</button>
              <input type="text" class="input-cantidad" value="${p.Cantidad}" 
                onchange="actualizarCantidad(${p.IdProducto}, this.value)">
              <button class="btn-cantidad" onclick="actualizarCantidad(${p.IdProducto}, ${p.Cantidad} + 1)">+</button>
            </div>
          </div>
        </div>
        <div class="item-subtotal">S/ ${subtotal.toFixed(2)}</div>
        <div class="item-acciones">
          <button class="btn-eliminar" onclick="eliminarDelCarrito(${p.IdProducto})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;

      contenedor.appendChild(item);
      
      // Añadir evento para el checkbox de este producto
      document.getElementById(`check-${p.IdProducto}`).addEventListener("change", function() {
        if (this.checked) {
          if (!productosSeleccionados.includes(p.IdProducto)) {
            productosSeleccionados.push(p.IdProducto);
          }
        } else {
          productosSeleccionados = productosSeleccionados.filter(id => id !== p.IdProducto);
        }
        actualizarTotalesSeleccionados();
      });
    });

    actualizarTotales(total, descuento);
  } catch (err) {
    console.error("❌ Error al cargar el carrito:", err);
    mostrarCarritoVacio("Error al cargar el carrito.");
  }
}

// Función para actualizar los totales basados en productos seleccionados
function actualizarTotalesSeleccionados() {
  const token = localStorage.getItem("token");
  if (!token) return;
  
  fetch("/api/carrito", {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => res.json())
  .then(productos => {
    if (!Array.isArray(productos)) return;
    
    let total = 0;
    let descuento = 0;
    
    productos.forEach(p => {
      if (productosSeleccionados.includes(p.IdProducto)) {
        total += parseFloat(p.Precio) * p.Cantidad;
      }
    });
    
    actualizarTotales(total, descuento);
    
    // Actualizar estado del checkbox "Seleccionar todos"
    const selectAllCheckbox = document.getElementById("selectAll");
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = productosSeleccionados.length === productos.length;
    }
  })
  .catch(error => {
    console.error("Error al actualizar totales:", error);
  });
}

// 🔄 Actualizar cantidad del producto
async function actualizarCantidad(idProducto, cantidad) {
  const token = localStorage.getItem("token");

  try {
    await fetch(`/api/carrito/${idProducto}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cantidad }),
    });

    mostrarToast("Cantidad actualizada", "success");
    cargarCarrito(); // Refresca carrito
  } catch {
    mostrarToast("Error al actualizar cantidad", "error");
  }
}

// 🗑 Eliminar producto del carrito
async function eliminarDelCarrito(idProducto) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`/api/carrito/${idProducto}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      mostrarToast("Producto eliminado del carrito", "success");
      cargarCarrito();

      // Usar la función global actualizarContadorCarrito desde layout-loader.js
      if (typeof window.actualizarContadorCarrito === "function") {
        window.actualizarContadorCarrito(); // 🔢 actualiza badge
      }
    } else {
      mostrarToast("No se pudo eliminar el producto", "error");
    }
  } catch {
    mostrarToast("Error al eliminar producto", "error");
  }
}

// 📊 Mostrar resumen de totales
function actualizarTotales(total, descuento) {
  document.getElementById("subtotal").textContent = total.toFixed(2);
  document.getElementById("descuento").textContent = descuento.toFixed(2);
  document.getElementById("total-carrito").textContent = (total - descuento).toFixed(2);
}

// 🛒 Si el carrito está vacío o hay error
function mostrarCarritoVacio(mensaje = "Tu carrito está vacío.") {
  document.getElementById("carrito-container").innerHTML = `
    <div class="carrito-vacio">
      <i class="bi bi-cart-x"></i>
      <p>${mensaje}</p>
      <a href="productos.html" class="btn btn-seguir-comprando">Ir a comprar</a>
    </div>
  `;
  document.getElementById("subtotal").textContent = "0.00";
  document.getElementById("descuento").textContent = "0.00";
  document.getElementById("total-carrito").textContent = "0.00";
}

// 🗑️ Vaciar todo el carrito
async function vaciarCarrito() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    mostrarToast("Debes iniciar sesión para realizar esta acción", "error");
    return;
  }
  
  // Crear y mostrar el popup de confirmación
  const confirmPopup = document.createElement("div");
  confirmPopup.className = "toast-container position-fixed top-50 start-50 translate-middle";
  confirmPopup.style.zIndex = "9999";
  confirmPopup.innerHTML = `
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-warning text-dark">
        <strong class="me-auto">Confirmar acción</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        <p>¿Estás seguro que deseas vaciar todo el carrito?</p>
        <div class="mt-2 pt-2 border-top d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" id="btn-cancelar">Cancelar</button>
          <button type="button" class="btn btn-danger" id="btn-confirmar">Vaciar carrito</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmPopup);
  
  // Manejar los botones del popup
  return new Promise((resolve) => {
    document.getElementById("btn-cancelar").addEventListener("click", () => {
      document.body.removeChild(confirmPopup);
      resolve(false);
    });
    
    document.querySelector(".btn-close").addEventListener("click", () => {
      document.body.removeChild(confirmPopup);
      resolve(false);
    });
    
    document.getElementById("btn-confirmar").addEventListener("click", async () => {
      document.body.removeChild(confirmPopup);
      
      try {
        const res = await fetch("/api/carrito/vaciar/todo", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          mostrarToast("Carrito vaciado correctamente", "success");
          cargarCarrito();

          // Usar la función global actualizarContadorCarrito desde layout-loader.js
          if (typeof window.actualizarContadorCarrito === "function") {
            window.actualizarContadorCarrito(); // 🔢 actualiza badge
          }
        } else {
          mostrarToast("No se pudo vaciar el carrito", "error");
        }
      } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        mostrarToast("Error al vaciar el carrito", "error");
      }
      
      resolve(true);
    });
  });
}
