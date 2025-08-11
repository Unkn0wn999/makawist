// Redirigir si no hay sesión
if (!localStorage.getItem("token")) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritos-container");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/api/favoritos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const favoritos = await res.json();

    if (!res.ok || !Array.isArray(favoritos)) {
      container.innerHTML = `<tr><td colspan="4" class="text-center py-4">No se pudieron cargar tus favoritos.</td></tr>`;
      return;
    }

    if (favoritos.length === 0) {
      container.innerHTML = `<tr><td colspan="4" class="text-center py-4">Aún no tienes productos en favoritos.</td></tr>`;
      return;
    }

    favoritos.forEach(producto => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid rounded" style="max-height: 60px; max-width: 60px; object-fit: cover;">
        </td>
        <td>
          <h6 class="mb-0">${producto.nombre}</h6>
        </td>
        <td>
          <span class="fw-bold">S/ ${Number(producto.precio).toFixed(2)}</span>
        </td>
        <td>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" onclick="quitarFavorito(${producto.id})">
              <i class="bi bi-heart-fill"></i> Quitar
            </button>
            <a href="detalle.html?id=${producto.id}" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-eye-fill"></i> Ver
            </a>
            <button class="btn btn-outline-success btn-sm" onclick="agregarAlCarrito(${producto.id})">
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </td>
      `;
      container.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error al cargar favoritos:", err);
    container.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Error cargando favoritos.</td></tr>`;}
  }
);

async function quitarFavorito(idProducto) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/favoritos/eliminar`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ IdProducto: idProducto }),
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("Error al quitar de favoritos");
    }
  } catch {
    alert("Error del servidor");
  }
}

// Función para agregar al carrito desde favoritos
async function agregarAlCarrito(idProducto) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para agregar al carrito");
    return;
  }

  try {
    // Primero verificar si el producto ya está en el carrito
    const resCarrito = await fetch("/api/carrito", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const productosCarrito = await resCarrito.json();
    
    // Verificar si el producto ya existe en el carrito
    const productoExistente = productosCarrito.find(p => p.IdProducto === idProducto);
    
    if (productoExistente) {
      // El producto ya está en el carrito
      alert("Este producto ya está en tu carrito");
      return;
    }
    
    // Si no existe, agregarlo al carrito
    const res = await fetch("/api/carrito", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ idProducto, cantidad: 1 }),
    });

    if (res.ok) {
      alert("Producto agregado al carrito");
      // Actualizar contador del carrito
      if (typeof window.actualizarContadorCarrito === "function") {
        window.actualizarContadorCarrito();
      }
    } else {
      alert("Error al agregar al carrito");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error del servidor");
  }
}
