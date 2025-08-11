console.log("📦 productos admin cargado");

cargarProductos();
cargarCategorias();

document.getElementById("formEditarProducto").addEventListener("submit", async e => {
  e.preventDefault();
  await guardarEdicionProducto();
});

document.getElementById("formAgregarProducto").addEventListener("submit", async e => {
  e.preventDefault();
  await registrarNuevoProducto();
});

async function cargarProductos() {
  const tbody = document.querySelector("#tabla-productos tbody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/productos");
    const productos = await res.json();

    tbody.innerHTML = "";

    if (!productos.length) {
      tbody.innerHTML = `<tr><td colspan="9">No hay productos registrados.</td></tr>`;
      return;
    }

    productos.forEach(p => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.IdProducto}</td>
        <td>${p.Nombre}</td>  
        <td>${p.NombreCategoria ? p.NombreCategoria : `(ID: ${p.IdCategoria})`}</td>
        <td>${p.Stock}</td>
        <td>
          ${
            p.PrecioOferta && parseFloat(p.PrecioOferta) > 0
              ? `<span class="text-muted text-decoration-line-through">S/. ${parseFloat(p.Precio).toFixed(2)}</span><br>
                 <span class="text-danger fw-bold">S/. ${parseFloat(p.PrecioOferta).toFixed(2)}</span>`
              : `<span>S/. ${parseFloat(p.Precio).toFixed(2)}</span>`
          }
        </td>
        <td>
          <span class="badge bg-${p.Activo ? "success" : "danger"}">${p.Activo ? "Activo" : "Inactivo"}</span>
        </td>
        <td>${p.FechaCreacion ? new Date(p.FechaCreacion).toLocaleDateString() : "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick='abrirEditarProducto(${JSON.stringify(p)})'>
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-warning me-1" onclick='cambiarEstadoProducto(${JSON.stringify(p)})'>
            <i class="bi ${p.Activo ? "bi-eye-slash" : "bi-eye"}"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${p.IdProducto})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
    tbody.innerHTML = `<tr><td colspan="9">Error al cargar productos.</td></tr>`;
  }
}

function abrirEditarProducto(p) {
  document.getElementById("editIdProducto").value = p.IdProducto;
  document.getElementById("editNombre").value = p.Nombre;
  document.getElementById("editDescripcion").value = p.Descripcion || "";
  document.getElementById("editPrecio").value = parseFloat(p.Precio).toFixed(2);
  document.getElementById("editPrecioOferta").value = p.PrecioOferta ? parseFloat(p.PrecioOferta).toFixed(2) : "";
  document.getElementById("editStock").value = p.Stock;
  document.getElementById("editImagenURL").value = p.Imagen || p.ImagenURL || "";
  document.getElementById("editCategoria").value = p.IdCategoria || "";
  document.getElementById("editActivo").value = p.Activo;
  new bootstrap.Modal(document.getElementById("modalEditarProducto")).show();
}

async function guardarEdicionProducto() {
  const id = document.getElementById("editIdProducto").value;

  try {
    const formData = new FormData();

    // Convertir a float y formatear con dos decimales
    const precio = parseFloat(document.getElementById("editPrecio").value);
    const precioOfertaRaw = document.getElementById("editPrecioOferta").value;
    const precioOferta = precioOfertaRaw ? parseFloat(precioOfertaRaw) : 0;

    formData.append('Nombre', document.getElementById("editNombre").value.trim());
    formData.append('Descripcion', document.getElementById("editDescripcion").value.trim());
    formData.append('Precio', precio.toFixed(2));
    formData.append('PrecioOferta', precioOferta > 0 ? precioOferta.toFixed(2) : 0);
    formData.append('Stock', document.getElementById("editStock").value);
    formData.append('IdCategoria', document.getElementById("editCategoria").value);
    formData.append('Activo', document.getElementById("editActivo").value);
    formData.append('FechaCaducidad', '');

    const currentImageUrl = document.getElementById("editImagenURL").value.trim();
    if (currentImageUrl) {
      formData.append('ImagenURL', currentImageUrl);
    }

    const fileInput = document.getElementById("editImagenFile");
    if (fileInput && fileInput.files.length > 0) {
      formData.append('imagen', fileInput.files[0]);
    }

    const res = await fetch(`/api/admin/productos/${id}`, {
      method: "PUT",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || "Error al actualizar producto");
    }

    bootstrap.Modal.getInstance(document.getElementById("modalEditarProducto")).hide();
    mostrarToastInferior("✅ Producto actualizado correctamente");
    cargarProductos();
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err);
    mostrarToastSuperior("❌ Error al actualizar producto");
  }
}

async function registrarNuevoProducto() {
  try {
    const formData = new FormData();

    const precio = parseFloat(document.getElementById("nuevoPrecio").value);
    const precioOfertaRaw = document.getElementById("nuevoPrecioOferta").value;
    const precioOferta = precioOfertaRaw ? parseFloat(precioOfertaRaw) : 0;

    formData.append('Nombre', document.getElementById("nuevoNombre").value.trim());
    formData.append('Descripcion', document.getElementById("nuevoDescripcion").value.trim());
    formData.append('Precio', precio.toFixed(2));
    formData.append('PrecioOferta', precioOferta > 0 ? precioOferta.toFixed(2) : 0);
    formData.append('Stock', document.getElementById("nuevoStock").value);
    formData.append('IdCategoria', document.getElementById("nuevoCategoria").value);
    formData.append('FechaCaducidad', '');

    const fileInput = document.getElementById("nuevoImagenFile");
    if (fileInput && fileInput.files.length > 0) {
      formData.append('imagen', fileInput.files[0]);
    }

    const res = await fetch("/api/admin/productos", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || "Error al registrar");
    }

    bootstrap.Modal.getInstance(document.getElementById("modalAgregarProducto")).hide();
    mostrarToastInferior("✅ Producto registrado correctamente");
    cargarProductos();
  } catch (err) {
    console.error("❌ Error al registrar producto:", err);
    mostrarToastSuperior("❌ Error al registrar producto");
  }
}

async function cambiarEstadoProducto(p) {
  const nuevoEstado = p.Activo ? 0 : 1;
  const formData = new FormData();

  formData.append('Nombre', p.Nombre);
  formData.append('Descripcion', p.Descripcion || '');
  formData.append('Precio', parseFloat(p.Precio).toFixed(2));
  formData.append('PrecioOferta', p.PrecioOferta ? parseFloat(p.PrecioOferta).toFixed(2) : 0);
  formData.append('Stock', p.Stock);
  formData.append('IdCategoria', p.IdCategoria);
  formData.append('Activo', nuevoEstado);
  formData.append('ImagenURL', p.ImagenURL || '');
  formData.append('FechaCaducidad', '');

  try {
    const res = await fetch(`/api/admin/productos/${p.IdProducto}`, {
      method: "PUT",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || "Error al cambiar estado");
    }
    mostrarToastInferior(`✅ Producto ${nuevoEstado ? "activado" : "inactivado"}`);
    cargarProductos();
  } catch (err) {
    console.error("❌ Error al cambiar estado:", err);
    mostrarToastSuperior("❌ Error al cambiar estado");
  }
}

async function eliminarProducto(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  try {
    await fetch(`/api/admin/productos/${id}`, { method: "DELETE" });
    mostrarToastInferior("🗑️ Producto eliminado correctamente");
    cargarProductos();
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    mostrarToastSuperior("❌ Error al eliminar producto");
  }
}

async function cargarCategorias() {
  try {
    const res = await fetch("/api/categorias");
    if (!res.ok) {
      throw new Error(`Error al cargar categorías: ${res.status}`);
    }
    const categorias = await res.json();
    console.log("Categorías cargadas:", categorias);

    const selects = [document.getElementById("nuevoCategoria"), document.getElementById("editCategoria")];
    selects.forEach(select => {
      if (!select) return;
      select.innerHTML = `<option value="" disabled selected>Selecciona...</option>`;

      if (Array.isArray(categorias)) {
        categorias.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.idCategoria !== undefined ? cat.idCategoria : cat.IdCategoria;
          option.textContent = cat.nombre !== undefined ? cat.nombre : cat.Nombre;
          select.appendChild(option);
        });
      } else {
        console.error("Las categorías no son un array:", categorias);
      }
    });
  } catch (err) {
    console.error("❌ Error al cargar categorías:", err);
    mostrarToastSuperior("❌ Error al cargar categorías");
  }
}

function mostrarToastSuperior(mensaje, color = "#dc3545") {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: { background: color }
  }).showToast();
}

function mostrarToastInferior(mensaje, color = "#28a745") {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    style: { background: color }
  }).showToast();
}
