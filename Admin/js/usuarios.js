console.log("🔄 usuarios.js cargado");

inicializarUsuarios();

function inicializarUsuarios() {
  cargarUsuarios();

  const formEditar = document.getElementById("formEditarUsuario");
  if (formEditar) {
    formEditar.addEventListener("submit", async e => {
      e.preventDefault();
      await guardarEdicionUsuario();
    });
  }

  const formAgregar = document.getElementById("formAgregarUsuario");
  if (formAgregar) {
    formAgregar.addEventListener("submit", async e => {
      e.preventDefault();
      await registrarNuevoUsuario();
    });
  }

  document.getElementById("modalAgregarUsuario").addEventListener("show.bs.modal", () => {
    document.getElementById("formAgregarUsuario").reset();
    document.querySelector("#formAgregarUsuario button[type=submit]").disabled = false;
  });

  document.getElementById("nuevoNumeroDocumento").addEventListener("input", e => {
    const tipo = document.getElementById("nuevoTipoDocumento").value;
    let maxLength = tipo === "DNI" ? 8 : (tipo === "RUC" || tipo === "CE") ? 11 : 15;
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, maxLength);
  });

  document.getElementById("editNumeroDocumento").addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 15);
  });
}

function cargarUsuarios() {
  const tbody = document.querySelector("#tabla-usuarios tbody");
  if (!tbody) return;

  fetch("/api/usuarios")
    .then(res => res.json())
    .then(usuarios => {
      tbody.innerHTML = "";

      if (!usuarios.length) {
        tbody.innerHTML = `<tr><td colspan="8">No hay usuarios registrados.</td></tr>`;
        return;
      }

      usuarios.forEach(u => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${u.IdUsuario}</td>
          <td>${u.Nombres} ${u.Apellidos}</td>
          <td>${u.Correo}</td>
          <td>${u.TipoDocumento ?? '-'} ${u.NumeroDocumento ?? ''}</td>
          <td><span class="badge bg-${u.Rol === 'admin' ? 'primary' : 'secondary'}">${u.Rol}</span></td>
          <td><span class="badge bg-${u.Activo ? 'success' : 'danger'}">${u.Activo ? 'Activo' : 'Inactivo'}</span></td>
          <td>${new Date(u.FechaRegistro).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirEditar(${u.IdUsuario}, '${u.Nombres}', '${u.Apellidos}', '${u.Correo}', '${u.TipoDocumento}', '${u.NumeroDocumento}', '${u.Rol}', ${u.Activo})">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning me-1" onclick='cambiarEstadoUsuario(${JSON.stringify(u)})'>
              <i class="bi ${u.Activo ? 'bi-person-dash' : 'bi-person-check'}"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminacion(${u.IdUsuario})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error("❌ Error al cargar usuarios:", err);
      tbody.innerHTML = `<tr><td colspan="8">Error al cargar usuarios.</td></tr>`;
    });
}

function abrirEditar(id, nombres, apellidos, correo, tipoDoc, numDoc, rol, activo) {
  document.getElementById("editIdUsuario").value = id;
  document.getElementById("editNombres").value = nombres;
  document.getElementById("editApellidos").value = apellidos;
  document.getElementById("editCorreo").value = correo;
  document.getElementById("editTipoDocumento").value = tipoDoc || "";
  document.getElementById("editNumeroDocumento").value = numDoc || "";
  document.getElementById("editRol").value = rol;
  document.getElementById("editActivo").value = activo;

  new bootstrap.Modal(document.getElementById("modalEditarUsuario")).show();
}

function guardarEdicionUsuario() {
  const id = document.getElementById("editIdUsuario").value;
  const datos = {
    Nombres: document.getElementById("editNombres").value.trim(),
    Apellidos: document.getElementById("editApellidos").value.trim(),
    Correo: document.getElementById("editCorreo").value.trim(),
    TipoDocumento: document.getElementById("editTipoDocumento").value,
    NumeroDocumento: document.getElementById("editNumeroDocumento").value,
    Rol: document.getElementById("editRol").value,
    Activo: document.getElementById("editActivo").value
  };

  fetch(`/api/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById("modalEditarUsuario")).hide();
      mostrarToastInferior("✅ Usuario actualizado correctamente");
      cargarUsuarios();
    })
    .catch(err => console.error("Error al guardar edición:", err));
}

function cambiarEstadoUsuario(usuario) {
  const nuevoEstado = usuario.Activo === 1 ? 0 : 1;

  const datos = {
    Nombres: usuario.Nombres,
    Apellidos: usuario.Apellidos,
    Correo: usuario.Correo,
    TipoDocumento: usuario.TipoDocumento,
    NumeroDocumento: usuario.NumeroDocumento,
    Rol: usuario.Rol,
    Activo: nuevoEstado
  };

  fetch(`/api/usuarios/${usuario.IdUsuario}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al actualizar estado");
      return res.json();
    })
    .then(() => {
      mostrarToastInferior(`✅ Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      cargarUsuarios();
    })
    .catch(err => {
      console.error("❌ Error:", err);
      mostrarToastSuperior("❌ Error al actualizar usuario");
    });
}

function confirmarEliminacion(id) {
  const toast = document.createElement("div");
  toast.className = "toast align-items-center text-bg-danger border-0 show position-fixed bottom-0 end-0 m-3";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ¿Eliminar usuario <strong>ID ${id}</strong>? 
        <button class="btn btn-sm btn-light ms-2" onclick="eliminarUsuario(${id}); this.closest('.toast').remove()">Sí</button>
        <button class="btn btn-sm btn-outline-light ms-1" onclick="this.closest('.toast').remove()">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
}

function eliminarUsuario(id) {
  fetch(`/api/usuarios/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(() => {
      mostrarToastInferior("🗑️ Usuario eliminado correctamente");
      cargarUsuarios();
    })
    .catch(err => console.error("❌ Error al eliminar usuario:", err));
}

let registrando = false; // bandera para evitar múltiples envíos

async function registrarNuevoUsuario() {
  if (registrando) return; // si ya está registrando, evita duplicación
  registrando = true;

  const btn = document.querySelector("#formAgregarUsuario button[type=submit]");
  btn.disabled = true;

  const nombres = document.getElementById("nuevoNombres").value.trim();
  const apellidos = document.getElementById("nuevoApellidos").value.trim();
  const correo = document.getElementById("nuevoCorreo").value.trim();
  const tipoDoc = document.getElementById("nuevoTipoDocumento").value;
  const numDoc = document.getElementById("nuevoNumeroDocumento").value.trim();
  const password = document.getElementById("nuevoPassword").value;
  const rol = document.getElementById("nuevoRol").value;

  // Validaciones
  if (!nombres || !apellidos || !correo || !tipoDoc || !numDoc || !password || !rol) {
    mostrarToastSuperior("❗ Todos los campos son obligatorios");
    registrando = false;
    btn.disabled = false;
    return;
  }

  if (!/^\d+$/.test(numDoc)) {
    mostrarToastSuperior("❗ El número de documento debe contener solo dígitos");
    registrando = false;
    btn.disabled = false;
    return;
  }

  if (tipoDoc === "DNI" && numDoc.length !== 8) {
    mostrarToastSuperior("❗ El DNI debe tener 8 dígitos");
    registrando = false;
    btn.disabled = false;
    return;
  }

  if ((tipoDoc === "RUC" || tipoDoc === "CE") && numDoc.length !== 11) {
    mostrarToastSuperior(`❗ El ${tipoDoc} debe tener 11 dígitos`);
    registrando = false;
    btn.disabled = false;
    return;
  }

  const nuevoUsuario = {
    Nombres: nombres,
    Apellidos: apellidos,
    Correo: correo,
    TipoDocumento: tipoDoc,
    NumeroDocumento: numDoc,
    Contraseña: password,
    Rol: rol
  };

  try {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario)
    });

    const data = await res.json();

    if (!res.ok) {
      // Validar código de error exacto
      if (data?.code === "ER_DUP_ENTRY" || data?.mensaje?.includes("ya está registrado")) {
        mostrarToastSuperior("❌ Ya existe un usuario con ese correo.");
      } else {
        mostrarToastSuperior(`❌ ${data?.mensaje || "Error al registrar el usuario"}`);
      }
      return;
    }

    mostrarToastSuperior("✅ Usuario registrado correctamente", "#198754");

    document.getElementById("formAgregarUsuario").reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgregarUsuario"));
    if (modal) modal.hide();
    cargarUsuarios();
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    mostrarToastSuperior("❌ Error inesperado al registrar");
  } finally {
    btn.disabled = false;
    registrando = false;
  }
}



function mostrarToastSuperior(mensaje, color = "#dc3545") {
  Toastify({
    text: mensaje,
    duration: 3500,
    gravity: "top",
    position: "center",
    style: {
      background: color,
      borderRadius: "5px",
      fontSize: "15px",
    }
  }).showToast();
}

function mostrarToastInferior(mensaje, color = "#28a745") {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    style: {
      background: color,
      borderRadius: "5px",
      fontSize: "14px",
    }
  }).showToast();
}
