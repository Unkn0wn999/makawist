document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');

  // Detectar clics en el sidebar
  document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const text = item.textContent.trim().toLowerCase();

      const section = text
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina acentos
        .replace(/\s+/g, '');

      window.location.hash = `#${section}`;
    });
  });

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const path = hash === 'dashboard'
      ? 'secciones/dashboard.html'
      : `secciones/${hash}.html`;

    loadSection(path, hash);
  }

  function loadSection(path, section) {
    if (!dashboardContent) return;

    dashboardContent.classList.add('fade-out');

    setTimeout(() => {
      fetch(path)
        .then(res => {
          if (!res.ok) throw new Error('No se encontró la sección');
          return res.text();
        })
        .then(html => {
          dashboardContent.innerHTML = html;
          dashboardContent.classList.remove('fade-out');

          // Si es dashboard, cargar gráficos
          if (section === 'dashboard') {
  if (typeof renderCharts === 'function') renderCharts();
  if (typeof cargarDatosDashboard === 'function') cargarDatosDashboard();
}

          // Si es sección "usuarios", cargar script solo cuando esté lista la tabla
          if (section === 'usuarios') {
  // Esperar que se cargue la tabla y ejecutar inicializarUsuarios()
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = '/Admin/js/usuarios.js';
    script.onload = () => {
      if (typeof inicializarUsuarios === "function") inicializarUsuarios();
    };
    document.body.appendChild(script);
  }, 300);
} 


          // Puedes agregar más secciones aquí...
        })
        .catch(err => {
          console.error("❌ Error al cargar sección:", err);
          dashboardContent.innerHTML = `<div class="alert alert-danger">Error al cargar la sección</div>`;
          dashboardContent.classList.remove('fade-out');
        });
    }, 300);
  }
});

// Utilidad: espera hasta que el elemento exista en el DOM
function esperarElemento(selector, callback, intentos = 20) {
  const interval = setInterval(() => {
    const el = document.querySelector(selector);
    if (el) {
      clearInterval(interval);
      callback();
    } else if (--intentos === 0) {
      clearInterval(interval);
      console.warn(`⚠️ No se encontró ${selector} después de varios intentos.`);
    }
  }, 200);
}

async function cargarDatosDashboard() {
  try {
    const [usuariosRes, categoriasRes, productosRes, ventasRes, promocionesRes] = await Promise.all([
      fetch('/api/usuarios/count'),
      fetch('/api/categorias/count'),
      fetch('/api/productos/count'),
      fetch('/api/ventas/count'),
      fetch('/api/cupones/activas/count')
    ]);

    const usuarios = await usuariosRes.json();
    const categorias = await categoriasRes.json();
    const productos = await productosRes.json();
    const ventas = await ventasRes.json();
    const promociones = await promocionesRes.json();

    document.getElementById('card-usuarios').textContent = usuarios.count || 0;
    document.getElementById('card-categorias').textContent = categorias.count || 0;
    document.getElementById('card-productos').textContent = productos.count || 0;
    document.getElementById('card-ventas').textContent = `S/${Number(ventas.count || 0).toFixed(2)}`;
    document.getElementById('card-promociones').textContent = promociones.count || 0;

  } catch (error) {
    console.error('❌ Error al cargar datos del dashboard:', error);
  }
}
