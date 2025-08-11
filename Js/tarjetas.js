document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const popup = document.getElementById("popup-tarjeta");
  const form = document.getElementById("formTarjeta");
  const btnAgregar = document.getElementById("btnAgregarTarjeta");
  const btnCancelar = document.getElementById("cancelarTarjeta");

  btnAgregar.addEventListener("click", () => popup.style.display = "flex");
  btnCancelar.addEventListener("click", () => {
    popup.style.display = "none";
    form.reset();
  });

  async function cargarTarjetas() {
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
        <div class="card mt-2 text-start">
          <div class="card-body">
            <h6 class="card-title">${t.TipoTarjeta} •••• ${t.NumeroTarjeta.slice(-4)}</h6>
            <p class="card-text">
              Titular: ${t.TitularTarjeta}<br/>
              Expira: ${t.FechaExpiracion}
            </p>
          </div>
        </div>
      `).join("");
    } catch (err) {
      console.error("❌ Error al cargar tarjetas:", err);
    }
  }

  cargarTarjetas();
});
