// Js/direcciones.js completamente adaptado al HTML que proporcionaste y al backend funcional

// Espera a que el DOM cargue
window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup-direccion");
  const form = document.getElementById("formDireccion");
  const btnAbrir = document.getElementById("btnAgregarDireccion");
  const btnCancelar = document.getElementById("cancelarDireccion");
  const contenedor = document.querySelector(".contenedor-direcciones");

  let editandoId = null;

  // Aseguramos que el botón de agregar dirección funcione correctamente
  btnAbrir.addEventListener("click", function() {
    console.log("Botón de agregar dirección clickeado");
    form.reset();
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    editandoId = null;
  });

  // El botón cancelar ahora usa la función cerrarPopupDireccion definida en cuenta.html
  // No necesitamos este event listener ya que usamos onclick en el HTML

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = Object.fromEntries(new FormData(form));
    const method = editandoId ? "PUT" : "POST";
    const url = editandoId ? `http://localhost:3000/api/direcciones/${editandoId}` : "http://localhost:3000/api/direcciones";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(datos),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al guardar dirección");

      mostrarToast(data.mensaje || "Dirección guardada", "success");
      form.reset();
      popup.style.display = "none";
      cargarDirecciones();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  });

  async function cargarDirecciones() {
    // Limpiamos el contenedor antes de cargar las direcciones
    contenedor.innerHTML = "";


    try {
      const res = await fetch("http://localhost:3000/api/direcciones", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const direcciones = await res.json();

      if (!Array.isArray(direcciones) || direcciones.length === 0) {
        contenedor.innerHTML = `<p class="mt-3">No tienes direcciones agregadas</p>`;
        return;
      }

      direcciones.forEach((d) => {
        const div = document.createElement("div");
        div.className = "card mt-3 text-start";
        div.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${d.Direccion}</h5>
            <p class="card-text">${d.Ciudad || ""}, ${d.Departamento || ""}</p>
            <p class="card-text"><small class="text-muted">CP: ${d.CodigoPostal || "-"} | Ref: ${d.Referencia || "-"}</small></p>
            <div class="d-flex gap-2 justify-content-end">
              <button class="btn btn-sm btn-outline-primary" onclick='editar(${d.IdDireccion}, "${d.Direccion}", "${d.Ciudad || ''}", "${d.Departamento || ''}", "${d.CodigoPostal || ''}", "${d.Referencia || ''}")'>Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick='eliminar(${d.IdDireccion})'>Eliminar</button>
            </div>
          </div>`;
        contenedor.appendChild(div);
      });
    } catch (err) {
      mostrarToast("Error al cargar direcciones", "error");
    }
  }

  window.editar = (id, direccion, ciudad, departamento, codigoPostal, referencia) => {
    form.Direccion.value = direccion;
    form.Ciudad.value = ciudad;
    form.Departamento.value = departamento;
    form.CodigoPostal.value = codigoPostal;
    form.Referencia.value = referencia;
    editandoId = id;
    // Usamos la función definida en cuenta.html para abrir el popup
    abrirPopupDireccion();
  };

  window.eliminar = async (id) => {
    // Asegurarse de que id sea un número
    id = parseInt(id);
    if (isNaN(id)) {
      mostrarToast("ID de dirección inválido", "error");
      return;
    }
    
    // Usar confirm para confirmar la eliminación
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

    try {
      console.log('Eliminando dirección con ID:', id);
      
      const res = await fetch(`http://localhost:3000/api/direcciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log('Respuesta del servidor:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('Datos de respuesta:', data);
      
      if (!res.ok) throw new Error(data.mensaje || "Error al eliminar");

      mostrarToast(data.mensaje || "Dirección eliminada", "success");
      cargarDirecciones();
    } catch (err) {
      console.error('Error al eliminar dirección:', err);
      mostrarToast(err.message, "error");
    }
  };

  cargarDirecciones();
});
