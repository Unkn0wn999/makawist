console.log("📁 categorias.js cargado");

// Ejecuta directamente al cargar
cargarCategorias();

document.getElementById("formAgregarCategoria").addEventListener("submit", async (e) => {
  e.preventDefault();
  await agregarCategoria();
});

document.getElementById("formEditarCategoria").addEventListener("submit", async (e) => {
  e.preventDefault();
  await editarCategoria();
});

document.getElementById("btnConfirmarEliminar").addEventListener("click", async () => {
  const id = document.getElementById("idCategoriaEliminar").value;
  await eliminarCategoria(id);
});


// 🔄 Listar categorías
function cargarCategorias() {
  fetch("/api/admin/categorias")
    .then(res => res.json())
    .then(data => renderizarTabla(data))
    .catch(err => {
      console.error("❌ Error al cargar categorías:", err);
      mostrarToast("error");
    });
}

function renderizarTabla(categorias) {
  const tbody = document.querySelector("#tabla-categorias tbody");
  tbody.innerHTML = "";

  if (!categorias.length) {
    tbody.innerHTML = `<tr><td colspan="4">No hay categorías registradas.</td></tr>`;
    return;
  }

  categorias.forEach(cat => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cat.IdCategoria}</td>
      <td>${cat.Nombre}</td>
      <td>
        <span class="badge bg-${cat.Activo ? "success" : "secondary"}">
          ${cat.Activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditar(${cat.IdCategoria}, '${cat.Nombre}', ${cat.Activo})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="abrirModalEliminar(${cat.IdCategoria})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// ✅ Agregar categoría
async function agregarCategoria() {
  const nombre = document.getElementById("nuevoNombreCategoria").value.trim();
  if (!nombre) return;

  try {
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nombre })
    });

    if (!res.ok) throw new Error("Error al agregar");

    // ✅ Reiniciar formulario
    document.getElementById("formAgregarCategoria").reset();

    // ✅ Cerrar modal correctamente
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgregarCategoria"));
    if (modal) modal.hide();

    mostrarToast("success");
    cargarCategorias();
  } catch (err) {
    console.error("❌ Error al agregar categoría:", err);
    mostrarToast("error");
  }
}


// ✏️ Abrir modal de edición
function abrirModalEditar(id, nombre, estado) {
  document.getElementById("editIdCategoria").value = id;
  document.getElementById("editNombreCategoria").value = nombre;
  document.getElementById("editEstadoCategoria").value = estado;

  new bootstrap.Modal(document.getElementById("modalEditarCategoria")).show();
}


// ✅ Versión corregida de editarCategoria
async function editarCategoria() {
  const id = document.getElementById("editIdCategoria").value;
  const nombre = document.getElementById("editNombreCategoria").value.trim();
  const activo = parseInt(document.getElementById("editEstadoCategoria").value);

  if (!nombre) return;

  try {
    const res = await fetch(`/api/admin/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nombre, Activo: activo })
    });

    if (!res.ok) throw new Error("Error al editar");

    mostrarToast("success");
    bootstrap.Modal.getInstance(document.getElementById("modalEditarCategoria")).hide();
    cargarCategorias();
  } catch (err) {
    console.error("❌ Error al editar categoría:", err);
    mostrarToast("error");
  }
}


// 🟢 Cambiar estado activo/inactivo
async function cambiarEstadoCategoria(id, estadoActual) {
  const nuevoEstado = estadoActual ? 0 : 1;

  try {
    const res = await fetch(`/api/admin/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Estado: nuevoEstado })
    });

    if (!res.ok) throw new Error("Error al cambiar estado");

    mostrarToast("success");
    cargarCategorias();
  } catch (err) {
    console.error("❌ Error al cambiar estado:", err);
    mostrarToast("error");
  }
}

// 🗑️ Abrir modal de confirmación de eliminación
function abrirModalEliminar(idCategoria) {
  document.getElementById("idCategoriaEliminar").value = idCategoria;
  new bootstrap.Modal(document.getElementById("modalConfirmarEliminacion")).show();
}

// 🧹 Eliminar categoría
async function eliminarCategoria(id) {
  try {
    const res = await fetch(`/api/admin/categorias/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Error al eliminar");

    bootstrap.Modal.getInstance(document.getElementById("modalConfirmarEliminacion")).hide();
    mostrarToast("success");
    cargarCategorias();
  } catch (err) {
    console.error("❌ Error al eliminar categoría:", err);
    mostrarToast("error");
  }
}

// ✅ Mostrar toast de éxito o error
function mostrarToast(tipo) {
  const toast = new bootstrap.Toast(
    document.getElementById(tipo === "success" ? "toastSuccess" : "toastError")
  );
  toast.show();
}
