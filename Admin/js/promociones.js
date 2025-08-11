console.log("📢 cupones.js cargado");

inicializarCupones();

function inicializarCupones() {
  cargarCupones();

  document.getElementById("formAgregarPromocion").addEventListener("submit", async e => {
    e.preventDefault();
    await registrarCupon();
  });

  document.getElementById("formEditarPromocion").addEventListener("submit", async e => {
    e.preventDefault();
    await guardarEdicionCupon();  
  });
}

function cargarCupones() {
  fetch("/api/admin/cupones")
    .then(res => res.json())
    .then(cupones => {
      const tbody = document.querySelector("#tabla-promociones tbody"); // Si quieres cambiar id en HTML a #tabla-cupones, actualiza aquí
      tbody.innerHTML = "";

      if (!cupones.length) {
        tbody.innerHTML = `<tr><td colspan="8">No hay cupones registrados.</td></tr>`;
        return;
      }

      cupones.forEach(c => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${c.IdPromocion}</td>
          <td>${c.Nombre}</td>
          <td>${c.Codigo}</td>
          <td>${c.Descuento}%</td>
          <td>${c.FechaInicio}</td>
          <td>${c.FechaFin}</td>
          <td><span class="badge bg-${c.Activo ? "success" : "secondary"}">${c.Activo ? "Activo" : "Inactivo"}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-danger me-1" onclick='abrirEditarCupon(${JSON.stringify(c)})'>
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-dark" onclick="eliminarCupon(${c.IdPromocion})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error("❌ Error al cargar cupones:", err);
      mostrarToast("Error al cargar cupones");
    });
}

async function registrarCupon() {
  const nombre = document.getElementById("promoNombre")?.value.trim();
  const codigo = document.getElementById("promoCodigo")?.value.trim();
  const descuento = parseFloat(document.getElementById("promoDescuento")?.value);
  const inicio = document.getElementById("promoInicio")?.value;
  const fin = document.getElementById("promoFin")?.value;
  const activo = parseInt(document.getElementById("promoActivo")?.value);

  if (!nombre || !codigo || isNaN(descuento) || !inicio || !fin) {
    return mostrarToast("❗ Todos los campos son obligatorios");
  }

  try {
    const res = await fetch("/api/admin/cupones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nombre, Codigo: codigo, Descuento: descuento, FechaInicio: inicio, FechaFin: fin, Activo: activo })
    });

    if (!res.ok) throw new Error("Error al registrar cupón");

    bootstrap.Modal.getInstance(document.getElementById("modalAgregarPromocion")).hide();
    mostrarToast("✅ Cupón registrado", "#198754");
    document.getElementById("formAgregarPromocion").reset();
    cargarCupones();
  } catch (error) {
    console.error(error);
    mostrarToast("❌ No se pudo registrar el cupón");
  }
}

function abrirEditarCupon(c) {
  document.getElementById("editPromoId").value = c.IdPromocion;
  document.getElementById("editPromoNombre").value = c.Nombre;
  document.getElementById("editPromoCodigo").value = c.Codigo;
  document.getElementById("editPromoDescuento").value = c.Descuento;
  document.getElementById("editPromoInicio").value = c.FechaInicio;
  document.getElementById("editPromoFin").value = c.FechaFin;
  document.getElementById("editPromoActivo").value = c.Activo;

  new bootstrap.Modal(document.getElementById("modalEditarPromocion")).show();
}

async function guardarEdicionCupon() {
  const id = document.getElementById("editPromoId").value;
  const nombre = document.getElementById("editPromoNombre").value.trim();
  const codigo = document.getElementById("editPromoCodigo").value.trim();
  const descuento = parseFloat(document.getElementById("editPromoDescuento").value);
  const inicio = document.getElementById("editPromoInicio").value;
  const fin = document.getElementById("editPromoFin").value;
  const activo = parseInt(document.getElementById("editPromoActivo").value);

  if (!nombre || !codigo || isNaN(descuento) || !inicio || !fin) {
    return mostrarToast("❗ Todos los campos son obligatorios");
  }

  try {
    const res = await fetch(`/api/admin/cupones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nombre, Codigo: codigo, Descuento: descuento, FechaInicio: inicio, FechaFin: fin, Activo: activo })
    });

    if (!res.ok) throw new Error("Error al actualizar cupón");

    bootstrap.Modal.getInstance(document.getElementById("modalEditarPromocion")).hide();
    mostrarToast("✅ Cupón actualizado", "#198754");
    cargarCupones();
  } catch (error) {
    console.error(error);
    mostrarToast("❌ No se pudo actualizar el cupón");
  }
}

let idCuponAEliminar = null;

function eliminarCupon(id) {
  idCuponAEliminar = id;
  const modal = new bootstrap.Modal(document.getElementById("modalConfirmarEliminacion"));
  modal.show();
}

document.getElementById("btnConfirmarEliminar").addEventListener("click", async () => {
  if (!idCuponAEliminar) return;

  try {
    const res = await fetch(`/api/admin/cupones/${idCuponAEliminar}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar cupón");

    bootstrap.Modal.getInstance(document.getElementById("modalConfirmarEliminacion")).hide();
    mostrarToast("🗑️ Cupón eliminado correctamente", "#dc3545");
    cargarCupones();
  } catch (error) {
    console.error(error);
    mostrarToast("❌ No se pudo eliminar el cupón");
  } finally {
    idCuponAEliminar = null;
  }
});

function mostrarToast(mensaje, color = "#dc3545") {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: {
      background: color,
      borderRadius: "6px",
      fontSize: "14px"
    }
  }).showToast();
}
