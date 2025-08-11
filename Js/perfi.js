// perfi.js actualizado

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  // Campos de perfil
  const campos = {
    nombres: document.getElementById("perfil-nombres"),
    apellidos: document.getElementById("perfil-apellidos"),
    correo: document.getElementById("perfil-correo"),
    tipoDocumento: document.getElementById("perfil-tipoDocumento"),
    numeroDocumento: document.getElementById("perfil-numeroDocumento"),
    fechaRegistro: document.getElementById("perfil-fechaRegistro")
  };

  const btnEditar = document.getElementById("btnEditarPerfil");
  const btnGuardar = document.getElementById("btnGuardarPerfil");

  // Cargar perfil
  try {
    const res = await fetch("http://localhost:3000/api/usuarios/perfil", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("No se pudo obtener el perfil");
    const data = await res.json();

    campos.nombres.value = data.Nombres || data.nombres;
    campos.apellidos.value = data.Apellidos || data.apellidos;
    campos.correo.value = data.Correo || data.correo;
    campos.tipoDocumento.value = data.TipoDocumento || data.tipoDocumento;
    campos.numeroDocumento.value = data.NumeroDocumento || data.numeroDocumento;
    campos.fechaRegistro.value = new Date(data.FechaRegistro || data.fechaRegistro).toLocaleDateString();
  } catch (err) {
    console.error("Error cargando perfil:", err);
  }

  // Editar perfil
  btnEditar.addEventListener("click", () => {
    [campos.nombres, campos.apellidos, campos.correo].forEach(input => input.disabled = false);
    btnGuardar.disabled = false;
    btnGuardar.style.cursor = "pointer";
  });

  document.getElementById("formPerfil").addEventListener("submit", async (e) => {
    e.preventDefault();

    const actualizados = {
      Nombres: campos.nombres.value.trim(),
      Apellidos: campos.apellidos.value.trim(),
      Correo: campos.correo.value.trim()
    };

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(actualizados)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al actualizar");

      mostrarToast("Perfil actualizado exitosamente", "success");
      [campos.nombres, campos.apellidos, campos.correo].forEach(input => input.disabled = true);
      btnGuardar.disabled = true;
      btnGuardar.style.cursor = "not-allowed";
    } catch (err) {
      mostrarToast("Error: " + err.message, "error");
    }
  });

  const inputNumero = document.getElementById("NumeroTarjeta");
  const inputFecha = document.getElementById("FechaExpiracion");
  const iconoTarjeta = document.getElementById("iconoTarjeta");

  inputNumero.addEventListener("input", () => {
    let valor = inputNumero.value.replace(/\D/g, "").slice(0, 16);

    if (/^(\d)\1{15}$/.test(valor)) {
      inputNumero.setCustomValidity("No se permiten 16 dígitos iguales.");
    } else if (valor.length !== 16) {
      inputNumero.setCustomValidity("La tarjeta debe tener exactamente 16 dígitos.");
    } else {
      inputNumero.setCustomValidity("");
    }

    inputNumero.reportValidity();
    inputNumero.value = valor.replace(/(.{4})/g, "$1 ").trim();

    const tipo = detectarTipoTarjeta(valor);
    iconoTarjeta.innerHTML = obtenerIconoHTML(tipo);
    iconoTarjeta.title = tipo;
  });

 inputFecha.addEventListener("input", () => {
  let valor = inputFecha.value.replace(/\D/g, "").slice(0, 4); // solo MMYY
  if (valor.length >= 3) {
    valor = valor.slice(0, 2) + "/" + valor.slice(2);
  }

  inputFecha.value = valor;

  if (valor.length === 5) {
    const [mesStr, anioStr] = valor.split("/");
    const mes = parseInt(mesStr);
    const anio = 2000 + parseInt(anioStr); // convierte "25" a 2025

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    if (mes < 1 || mes > 12) {
      inputFecha.setCustomValidity("Mes inválido (01-12)");
    } else if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      inputFecha.setCustomValidity("La tarjeta está vencida");
    } else {
      inputFecha.setCustomValidity("");
    }

    inputFecha.reportValidity();
  } else {
    inputFecha.setCustomValidity("");
  }
});


document.getElementById("formTarjeta").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const numeroLimpio = form.NumeroTarjeta.value.replace(/\D/g, "");
  const tipo = detectarTipoTarjeta(numeroLimpio);

  if (numeroLimpio.length !== 16) {
    mostrarToast("El número de tarjeta debe tener exactamente 16 dígitos", "error");
    return;
  }

  const tarjeta = {
    TitularTarjeta: form.TitularTarjeta.value.trim(),
    NumeroTarjeta: numeroLimpio,
    FechaExpiracion: form.FechaExpiracion.value.trim(),
    CVV: form.CVV.value.trim(),
    TipoTarjeta: tipo
  };

  try {
    const res = await fetch("http://localhost:3000/api/tarjetas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(tarjeta)
    });

    if (!res.ok) throw new Error("Error al guardar tarjeta");

    cerrarPopupTarjeta();
    form.reset();
    iconoTarjeta.innerHTML = `<i class="bi bi-credit-card text-secondary"></i>`;
    await cargarTarjetas();
    mostrarToast("Tarjeta guardada correctamente", "success");
  } catch (err) {
    mostrarToast("Error: " + err.message, "error");
  }
});


  await cargarTarjetas();
});

function detectarTipoTarjeta(numero) {
  if (/^4/.test(numero)) return "Visa";
  if (/^5[1-5]/.test(numero)) return "MasterCard";
  if (/^3[47]/.test(numero)) return "American Express";
  if (/^6(?:011|5)/.test(numero)) return "Discover";
  return "Desconocida";
}

function obtenerIconoHTML(tipo) {
  switch (tipo) {
    case "Visa":
      return `<img src="./Imagenes/Iconos/visa.svg" alt="Visa" style="height: 24px;">`;
    case "MasterCard":
      return `<img src="./Imagenes/Iconos/mastercard.svg" alt="MasterCard" style="height: 24px;">`;
    case "American Express":
      return `<img src="./Imagenes/Iconos/amex.svg" alt="Amex" style="height: 24px;">`;
    default:
      return `<i class="bi bi-credit-card text-secondary"></i>`;
  }
}

async function cargarTarjetas() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:3000/api/tarjetas", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tarjetas = await res.json();
    const contenedor = document.getElementById("lista-tarjetas");

    if (!tarjetas.length) {
      contenedor.innerHTML = `<p class="mensaje-centrado">No tienes tarjetas guardadas</p>`;
      return;
    }

    contenedor.innerHTML = tarjetas.map(t => `
      <div class="card mt-2 card-item animate-fade-in" id="tarjeta-${t.IdTarjeta}">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 class="card-title mb-1">
              <img src="${obtenerRutaIcono(t.TipoTarjeta)}" alt="${t.TipoTarjeta}" class="me-1" style="width:30px">
              ${t.TipoTarjeta} •••• ${t.NumeroTarjeta.slice(-4)}
            </h6>
            <p class="card-text mb-0">
              Titular: ${t.TitularTarjeta}<br/>
              Expira: ${t.FechaExpiracion}
            </p>
          </div>
          <button class="btn btn-sm btn-danger" onclick="eliminarTarjeta(${t.IdTarjeta})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error al cargar tarjetas:", err);
  }
}

function obtenerRutaIcono(tipo) {
  switch (tipo) {
    case "Visa": return "./Imagenes/Iconos/visa.svg";
    case "MasterCard": return "./Imagenes/Iconos/mastercard.svg";
    case "American Express": return "./Imagenes/Iconos/amex.svg";
    default: return "./Imagenes/Iconos/default.svg";
  }
}

function cerrarPopupTarjeta() {
  document.getElementById("popup-tarjeta").style.display = "none";
  document.getElementById("formTarjeta").reset();
  document.getElementById("iconoTarjeta").innerHTML = `<i class="bi bi-credit-card text-secondary"></i>`;
}

async function eliminarTarjeta(id) {
  const tarjetaDiv = document.getElementById(`tarjeta-${id}`);
  if (!tarjetaDiv) return;

  try {
    const res = await fetch(`http://localhost:3000/api/tarjetas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || "Error al eliminar");

    tarjetaDiv.classList.add("animate-fade-out");
    setTimeout(() => {
      tarjetaDiv.remove();
      if (!document.querySelector(".card-item")) {
        document.getElementById("lista-tarjetas").innerHTML =
          `<p class="mensaje-centrado">No tienes tarjetas guardadas</p>`;
      }
    }, 500);

    mostrarToast("Tarjeta eliminada correctamente", "success");
  } catch (err) {
    mostrarToast("Error: " + err.message, "error");
  }
}
