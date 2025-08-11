document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const contenedor = document.getElementById("pedidos");
  contenedor.innerHTML = '<h3>Mis pedidos</h3><p>Historial de compras.</p>';
  
  // Obtener compras guardadas en localStorage
  // Primero intentamos obtener del historialCompras (nuevo formato)
  // Si no existe, intentamos obtener de misCompras (formato antiguo)
  const historialCompras = JSON.parse(localStorage.getItem('historialCompras') || '[]');
  const comprasAnteriores = JSON.parse(localStorage.getItem('misCompras') || '[]');
  const comprasLocales = [...historialCompras, ...comprasAnteriores];
  
  try {
    // Obtener pedidos de la API
    const res = await fetch("http://localhost:3000/api/pedidos", {
      headers: { Authorization: `Bearer ${token}` }
    });

    let pedidosAPI = [];
    if (res.ok) {
      const respuesta = await res.json();
      // Verificar si la respuesta tiene la estructura esperada
      pedidosAPI = respuesta.pedidos || respuesta || [];
    }
    
    // Combinar pedidos de API y localStorage
    const todosPedidos = [...pedidosAPI, ...comprasLocales];
    
    // Ordenar por fecha (más reciente primero)
    todosPedidos.sort((a, b) => {
      const fechaA = new Date(a.FechaPedido || a.fecha);
      const fechaB = new Date(b.FechaPedido || b.fecha);
      return fechaB - fechaA;
    });

    if (todosPedidos.length === 0) {
      contenedor.innerHTML += `<p class="mensaje-centrado">No tienes compras registradas</p>`;
      return;
    }

    const html = todosPedidos.map(p => {
      // Asegurarse de que el ID del pedido nunca sea undefined
      const pedidoId = p.IdPedido || p.id || p.numero || 'SIN-ID';
      const fecha = new Date(p.FechaPedido || p.fecha).toLocaleDateString();
      const total = p.Total || p.total;
      const estado = p.Estado || p.estado || 'Completado';
      
      return `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title" style="color: hotpink;">Pedido #${pedidoId}</h5>
          <p class="card-text">
            Fecha: ${fecha}<br/>
            Total: S/ ${parseFloat(total).toFixed(2)}<br/>
            Estado: ${estado}
          </p>
          <button class="btn btn-hotpink btn-sm" onclick="verDetallePedido('${pedidoId}')">
            Ver detalle
          </button>
        </div>
      </div>
    `}).join("");

    contenedor.innerHTML += html;
  } catch (err) {
    console.error("❌ Error al cargar pedidos:", err);
    
    // Si falla la API, al menos mostrar las compras locales
    if (comprasLocales.length > 0) {
      const htmlLocal = comprasLocales.map(p => `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title" style="color: hotpink;">Pedido #${p.id}</h5>
            <p class="card-text">
              Fecha: ${new Date(p.fecha).toLocaleDateString()}<br/>
              Total: S/ ${parseFloat(p.total).toFixed(2)}<br/>
              Estado: ${p.estado || 'Completado'}
            </p>
            <button class="btn btn-hotpink btn-sm" onclick="verDetallePedido('${p.id}')">
              Ver detalle
            </button>
          </div>
        </div>
      `).join("");
      
      contenedor.innerHTML += htmlLocal;
    } else {
      contenedor.innerHTML += `<p class="mensaje-centrado">No tienes compras registradas</p>`;
    }
  }
});

function verDetallePedido(id) {
  // Buscar primero en localStorage (tanto en historialCompras como en misCompras)
  const historialCompras = JSON.parse(localStorage.getItem('historialCompras') || '[]');
  const comprasAnteriores = JSON.parse(localStorage.getItem('misCompras') || '[]');
  const todasLasCompras = [...historialCompras, ...comprasAnteriores];
  
  // Buscar por id o por numero (dependiendo del formato)
  const pedidoLocal = todasLasCompras.find(p => p.id == id || p.numero == id);
  
  if (pedidoLocal) {
    // Crear modal para mostrar detalles
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'detalleModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'detalleModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    // Obtener los productos (compatibilidad con ambos formatos)
    const productos = pedidoLocal.productos || [];
    
    // Generar HTML para los productos
    const productosHTML = productos.map(p => {
      // Construir la ruta de la imagen con fallback
      let imagenPath = 'Imagenes/no-disponible.png';
      if (p.ImagenURL) {
          if (p.ImagenURL.startsWith('http')) {
              imagenPath = p.ImagenURL;
          } else if (p.ImagenURL.startsWith('/')) {
              imagenPath = p.ImagenURL.substring(1);
          } else if (p.ImagenURL.startsWith('Imagenes/')) {
              imagenPath = p.ImagenURL;
          } else {
              imagenPath = `Imagenes/${p.ImagenURL}`;
          }
      }
      
      return `
      <div class="d-flex align-items-center mb-2 border-bottom pb-2">
        <img src="${imagenPath}" alt="${p.Nombre}" class="img-thumbnail me-3" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.src='Imagenes/no-disponible.png'">
        <div class="flex-grow-1">
          <h6 class="mb-0" style="color: hotpink;">${p.Nombre}</h6>
          <small>Cantidad: ${p.Cantidad} x S/ ${parseFloat(p.Precio).toFixed(2)}</small>
        </div>
        <div class="text-end">
          <strong>S/ ${(parseFloat(p.Precio) * p.Cantidad).toFixed(2)}</strong>
        </div>
      </div>
    `}).join('');
    
    // Obtener los datos del pedido (compatibilidad con ambos formatos)
    const pedidoId = pedidoLocal.id || pedidoLocal.numero || pedidoLocal.IdPedido || 'SIN-ID';
    const pedidoFecha = pedidoLocal.fecha || pedidoLocal.FechaPedido || new Date().toLocaleDateString();
    const pedidoEstado = pedidoLocal.estado || pedidoLocal.Estado || 'Completado';
    const pedidoTotal = pedidoLocal.total || pedidoLocal.Total || '0.00';
    const pedidoSubtotal = pedidoLocal.subtotal || '0.00';
    const pedidoEnvio = pedidoLocal.envio || '0.00';
    const pedidoDescuento = pedidoLocal.descuento || '0.00';
    
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #fff0f5;">
            <h5 class="modal-title" id="detalleModalLabel" style="color: hotpink;">Detalle del Pedido #${pedidoId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <p><strong>Fecha:</strong> ${pedidoFecha}</p>
              <p><strong>Estado:</strong> ${pedidoEstado}</p>
              ${pedidoLocal.metodoPago ? `<p><strong>Método de pago:</strong> ${pedidoLocal.metodoPago}</p>` : ''}
              ${pedidoLocal.direccion ? `<p><strong>Dirección:</strong> ${pedidoLocal.direccion}</p>` : ''}
            </div>
            <h6 class="border-bottom pb-2 mb-3">Productos</h6>
            ${productosHTML}
            <div class="mt-3 pt-3 border-top">
              <div class="d-flex justify-content-between">
                <p>Subtotal:</p>
                <p>S/ ${parseFloat(pedidoSubtotal).toFixed(2)}</p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Envío:</p>
                <p>S/ ${parseFloat(pedidoEnvio).toFixed(2)}</p>
              </div>
              ${parseFloat(pedidoDescuento) > 0 ? `
              <div class="d-flex justify-content-between">
                <p>Descuento:</p>
                <p>- S/ ${parseFloat(pedidoDescuento).toFixed(2)}</p>
              </div>` : ''}
              <div class="d-flex justify-content-between mt-2">
                <h5>Total:</h5>
                <h5>S/ ${parseFloat(pedidoTotal).toFixed(2)}</h5>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-hotpink" onclick="generarComprobantePDF('${pedidoId}')">Descargar Comprobante</button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar el modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Eliminar el modal del DOM cuando se cierre
    modal.addEventListener('hidden.bs.modal', function () {
      document.body.removeChild(modal);
    });
  } else {
    // Si no se encuentra en localStorage, intentar obtener de la API
    obtenerDetallePedidoAPI(id);
  }
}

// Función para obtener detalles del pedido desde la API
async function obtenerDetallePedidoAPI(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Necesitas iniciar sesión para ver los detalles del pedido");
      return;
    }
    
    // Mostrar indicador de carga
    const loadingModal = document.createElement('div');
    loadingModal.className = 'modal fade';
    loadingModal.id = 'loadingModal';
    loadingModal.setAttribute('tabindex', '-1');
    loadingModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center p-4">
            <div class="spinner-border text-hotpink mb-3" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando detalles del pedido...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(loadingModal);
    const loadingModalInstance = new bootstrap.Modal(loadingModal);
    loadingModalInstance.show();
    
    // Realizar la petición a la API
    const response = await fetch(`/api/pedidos/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Ocultar indicador de carga
    loadingModalInstance.hide();
    loadingModal.addEventListener('hidden.bs.modal', function () {
      document.body.removeChild(loadingModal);
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles del pedido');
    }
    
    const data = await response.json();
    
    if (!data.exito || !data.pedido) {
      throw new Error('No se encontraron detalles del pedido');
    }
    
    // Crear y mostrar el modal con los datos obtenidos
    mostrarModalDetallePedido(data.pedido);
    
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    alert("Detalles del pedido #" + id + " no disponibles: " + error.message);
  }
}

// Función para mostrar el modal con los detalles del pedido
function mostrarModalDetallePedido(pedido) {
  // Crear modal para mostrar detalles
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'detalleModal';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'detalleModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  
  // Obtener los productos
  const productos = pedido.productos || [];
  
  // Generar HTML para los productos
  const productosHTML = productos.map(p => {
    // Construir la ruta de la imagen con fallback
    let imagenPath = 'Imagenes/no-disponible.png';
    if (p.imagen) {
      if (p.imagen.startsWith('http')) {
        imagenPath = p.imagen;
      } else if (p.imagen.startsWith('/')) {
        imagenPath = p.imagen.substring(1);
      } else if (p.imagen.startsWith('Imagenes/')) {
        imagenPath = p.imagen;
      } else {
        imagenPath = `Imagenes/${p.imagen}`;
      }
    }
    
    return `
    <div class="d-flex align-items-center mb-2 border-bottom pb-2">
      <img src="${imagenPath}" alt="${p.nombre}" class="img-thumbnail me-3" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.src='Imagenes/no-disponible.png'">
      <div class="flex-grow-1">
        <h6 class="mb-0" style="color: hotpink;">${p.nombre}</h6>
        <small>Cantidad: ${p.cantidad} x S/ ${parseFloat(p.precioUnitario).toFixed(2)}</small>
      </div>
      <div class="text-end">
        <strong>S/ ${(parseFloat(p.precioUnitario) * p.cantidad).toFixed(2)}</strong>
      </div>
    </div>
  `}).join('');
  
  // Calcular subtotal, envío y descuento si no están disponibles
  let subtotal = 0;
  productos.forEach(p => {
    subtotal += parseFloat(p.precioUnitario || 0) * parseInt(p.cantidad || 0);
  });
  
  const envio = pedido.envio || 0;
  const descuento = pedido.descuento || 0;
  
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header" style="background-color: #fff0f5;">
          <h5 class="modal-title" id="detalleModalLabel" style="color: hotpink;">Detalle del Pedido #${pedido.id || pedido.numeroPedido}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            ${pedido.metodoPago ? `<p><strong>Método de pago:</strong> ${pedido.metodoPago}</p>` : ''}
            ${pedido.cliente && pedido.cliente.direccion ? `<p><strong>Dirección:</strong> ${pedido.cliente.direccion}</p>` : ''}
          </div>
          <h6 class="border-bottom pb-2 mb-3">Productos</h6>
          ${productosHTML}
          <div class="mt-3 pt-3 border-top">
            <div class="d-flex justify-content-between">
              <p>Subtotal:</p>
              <p>S/ ${subtotal.toFixed(2)}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Envío:</p>
              <p>S/ ${parseFloat(envio).toFixed(2)}</p>
            </div>
            ${parseFloat(descuento) > 0 ? `
            <div class="d-flex justify-content-between">
              <p>Descuento:</p>
              <p>- S/ ${parseFloat(descuento).toFixed(2)}</p>
            </div>` : ''}
            <div class="d-flex justify-content-between mt-2">
              <h5>Total:</h5>
              <h5>S/ ${parseFloat(pedido.total).toFixed(2)}</h5>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-hotpink" onclick="generarComprobantePDF('${pedido.id || pedido.numeroPedido}')">Descargar Comprobante</button>
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Mostrar el modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // Eliminar el modal del DOM cuando se cierre
  modal.addEventListener('hidden.bs.modal', function () {
    document.body.removeChild(modal);
  });

}

// Función para generar comprobante de pago en PDF
function generarComprobantePDF(pedidoId) {
  // Buscar el pedido en localStorage
  const historialCompras = JSON.parse(localStorage.getItem('historialCompras') || '[]');
  const comprasAnteriores = JSON.parse(localStorage.getItem('misCompras') || '[]');
  const todasLasCompras = [...historialCompras, ...comprasAnteriores];
  
  const pedido = todasLasCompras.find(p => p.id == pedidoId || p.numero == pedidoId);
  
  if (!pedido) {
    mostrarToast('No se encontró información del pedido', 'error');
    return;
  }
  
  // Cargar jsPDF si no está disponible
  if (typeof jsPDF === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      const scriptAutoTable = document.createElement('script');
      scriptAutoTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
      scriptAutoTable.onload = function() {
        generarPDF(pedido);
      };
      document.head.appendChild(scriptAutoTable);
    };
    document.head.appendChild(script);
  } else {
    generarPDF(pedido);
  }
}

function generarPDF(pedido) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Datos del pedido
  const pedidoId = pedido.id || pedido.numero || pedido.IdPedido || 'SIN-ID';
  const fecha = new Date(pedido.fecha || pedido.FechaPedido).toLocaleDateString();
  const metodoPago = pedido.metodoPago || 'Tarjeta';
  const productos = pedido.productos || [];
  const subtotal = parseFloat(pedido.subtotal || '0').toFixed(2);
  const envio = parseFloat(pedido.envio || '0').toFixed(2);
  const descuento = parseFloat(pedido.descuento || '0').toFixed(2);
  const total = parseFloat(pedido.total || pedido.Total || '0').toFixed(2);
  
  // Colores de la marca
  const hotpink = [255, 105, 180];
  const white = [255, 255, 255];
  
  // Configuración de la página
  doc.setFillColor(hotpink[0], hotpink[1], hotpink[2]);
  doc.setDrawColor(hotpink[0], hotpink[1], hotpink[2]);
  
  // Encabezado
  doc.setFillColor(hotpink[0], hotpink[1], hotpink[2]);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKAWI STORE CIX', 105, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('COMPROBANTE DE PAGO', 105, 25, { align: 'center' });
  
  // Información del pedido
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Cuadro de información
  doc.setDrawColor(hotpink[0], hotpink[1], hotpink[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 40, 180, 40, 3, 3, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL PEDIDO', 105, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Número de Pedido: #${pedidoId}`, 25, 60);
  doc.text(`Fecha: ${fecha}`, 25, 70);
  doc.text(`Método de Pago: ${metodoPago}`, 120, 60);
  
  // Tabla de productos
  const tableColumn = ['Producto', 'Cantidad', 'Precio Unit.', 'Total'];
  const tableRows = [];
  
  productos.forEach(producto => {
    const productData = [
      producto.Nombre,
      producto.Cantidad,
      'S/ ' + parseFloat(producto.Precio).toFixed(2),
      'S/ ' + (parseFloat(producto.Precio) * producto.Cantidad).toFixed(2)
    ];
    tableRows.push(productData);
  });
  
  doc.autoTable({
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: hotpink,
      textColor: white,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Totales
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Cuadro para totales
  doc.setDrawColor(hotpink[0], hotpink[1], hotpink[2]);
  doc.roundedRect(110, finalY, 85, 50, 3, 3, 'S');
  
  doc.text('Subtotal:', 120, finalY + 10);
  doc.text('S/ ' + subtotal, 180, finalY + 10, { align: 'right' });
  
  doc.text('Envío:', 120, finalY + 20);
  doc.text('S/ ' + envio, 180, finalY + 20, { align: 'right' });
  
  if (parseFloat(descuento) > 0) {
    doc.text('Descuento:', 120, finalY + 30);
    doc.text('- S/ ' + descuento, 180, finalY + 30, { align: 'right' });
  }
  
  doc.setFillColor(hotpink[0], hotpink[1], hotpink[2]);
  doc.rect(110, finalY + 35, 85, 0.5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 120, finalY + 45);
  doc.text('S/ ' + total, 180, finalY + 45, { align: 'right' });
  
  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('¡Gracias por tu compra en Makawi Store!', 105, 280, { align: 'center' });
  doc.text(`Página ${pageCount}`, 105, 285, { align: 'center' });
  
  // Guardar PDF
  doc.save(`Comprobante_Pedido_${pedidoId}.pdf`);
  mostrarToast('Comprobante descargado correctamente', 'success');
}
