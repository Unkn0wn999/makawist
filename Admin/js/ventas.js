console.log("✅ ventas.js cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  cargarVentas();
});

async function cargarVentas() {
  const tbody = document.querySelector("#tabla-ventas tbody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/ventas");
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const ventas = await res.json();

    tbody.innerHTML = "";

    if (!ventas.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay ventas registradas.</td></tr>`;
      return;
    }

    ventas.forEach(v => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${v.IdVenta}</td>
        <td>${v.ClienteNombre || "-"}</td>
        <td>${v.Fecha ? new Date(v.Fecha).toLocaleString() : "-"}</td>
        <td>S/. ${parseFloat(v.Total || 0).toFixed(2)}</td>
        <td>${v.Estado || "Pendiente"}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="verDetallesVenta(${v.IdVenta})">
            <i class="bi bi-eye"></i> Ver
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("❌ Error al cargar ventas:", error);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar ventas.</td></tr>`;
  }
}

function verDetallesVenta(idVenta) {
  // Aquí puedes implementar mostrar un modal con detalles o redirigir a otra página
  alert(`Ver detalles de la venta ID: ${idVenta}`);
}
