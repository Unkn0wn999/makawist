document.addEventListener("DOMContentLoaded", () => {
  cargarPromocionesActivas();
});

async function cargarPromocionesActivas() {
  try {
    const res = await fetch("/api/promociones-activas");
    if (!res.ok) throw new Error("Error al cargar promociones activas");

    const promociones = await res.json();
    const contenedor = document.querySelector(".row.g-4");

    // Limpiamos solo las tarjetas actuales (no los títulos)
    const tarjetasActuales = contenedor.querySelectorAll(".card-promocion");
    tarjetasActuales.forEach(card => card.parentElement.remove());

    if (promociones.length === 0) {
      contenedor.insertAdjacentHTML("beforeend", `
        <div class="col-12">
          <div class="alert alert-secondary text-center">
            No hay promociones activas por el momento.
          </div>
        </div>
      `);
      return;
    }

    promociones.forEach(promo => {
  const card = `
    <div class="col-md-4">
      <div class="card card-promocion activa h-100 shadow-sm p-3">
        <div class="card-body text-start">
          <h5 class="card-title">${promo.Nombre}</h5>
          <p class="card-text">
            Obtén ${promo.Descuento}% de descuento con el código <strong>${promo.Codigo}</strong>. 
            Válido hasta <strong>${formatearFecha(promo.FechaFin)}</strong>.
          </p>
        </div>
      </div>
    </div>
  `;
  contenedor.insertAdjacentHTML("beforeend", card);
});


  } catch (error) {
    console.error("❌ Error al mostrar promociones:", error);
  }
}

function formatearFecha(fechaISO) {
  const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(fechaISO).toLocaleDateString("es-PE", opciones);
}
