document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');

  // Verificar si hay token al cargar la página
  const token = localStorage.getItem('token');
  if (!token) {
    // Si no hay token, redirigir al inicio
    window.location.href = '/';
    return;
  }
  // Cargar datos del perfil
    async function cargarDatosPerfil() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch('/api/usuarios/perfil', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Error al cargar datos del perfil');
      
      const usuario = await res.json();
      console.log('Datos del perfil recibidos en nav-loader:', usuario);
      
      // Llenar campos del formulario
      document.getElementById('perfil-nombres').value = usuario.Nombres || '';
      document.getElementById('perfil-apellidos').value = usuario.Apellidos || '';
      document.getElementById('perfil-correo').value = usuario.Correo || '';
      document.getElementById('perfil-tipoDocumento').value = usuario.TipoDocumento || 'DNI';
      document.getElementById('perfil-numeroDocumento').value = usuario.NumeroDocumento || '';
      
      // Verificar si FechaRegistro existe y formatearla
      if (usuario.FechaRegistro) {
        try {
          document.getElementById('perfil-fechaRegistro').value = new Date(usuario.FechaRegistro).toLocaleDateString();
        } catch (e) {
          console.error('Error al formatear fecha:', e);
          document.getElementById('perfil-fechaRegistro').value = usuario.FechaRegistro;
        }
      } else {
        document.getElementById('perfil-fechaRegistro').value = '';
      }
      
    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al cargar datos del perfil', 'error');
    }
  }
  // Detecta clics en ítems del sidebar
  document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const text = item.textContent.trim().toLowerCase();

      // Reemplaza espacios y acentos para formar el nombre del archivo
      const section = text
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina acentos
        .replace(/\s+/g, '');

      // Actualiza el hash
      window.location.hash = `#${section}`;
    });
  });
  
  // Configurar botón de perfil
  document.getElementById('btn-perfil').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#perfil';
  });
  
  // Configurar botón de cerrar sesión
  document.getElementById('btn-cerrar-sesion').addEventListener('click', (e) => {
    e.preventDefault();
    cerrarSesion();
  });

  // Escucha cambios en el hash
  window.addEventListener('hashchange', handleHashChange);

  // Carga sección inicial si hay hash
  handleHashChange();

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const pathHtml = `secciones/${hash}.html`;
    const pathJs = `js/${hash}.js`;

    loadSection(pathHtml, pathJs);
  }

  function loadSection(pathHtml, pathJs) {
    if (!dashboardContent) return;

    dashboardContent.classList.add('fade-out');

    setTimeout(() => {
      fetch(pathHtml)
        .then(res => {
          if (!res.ok) throw new Error('No se encontró la sección');
          return res.text();
        })
        .then(html => {
          dashboardContent.innerHTML = html;
          dashboardContent.classList.remove('fade-out');

          // ✅ Renderizar gráficos si es dashboard
          if (pathHtml.includes('dashboard.html') && typeof renderCharts === 'function') {
            renderCharts();
          }

          // ✅ Cargar y ejecutar el script dinámico
          const script = document.createElement('script');
          script.src = pathJs;
          script.type = 'text/javascript';

          // ✅ Ejecuta el script inmediatamente al cargar (evita defer y DOMContentLoaded)
          script.onload = () => console.log(`✅ ${pathJs} cargado`);
          script.onerror = () => console.error(`❌ Error al cargar ${pathJs}`);
          // Eliminar scripts anteriores si ya fueron cargados
          document.querySelectorAll(`script[src="${pathJs}"]`).forEach(s => s.remove());

          document.body.appendChild(script);

        })
        .catch(err => {
          dashboardContent.innerHTML = `<div class="alert alert-danger">Error al cargar la sección</div>`;
          dashboardContent.classList.remove('fade-out');
          console.error('❌ Error cargando sección:', err);
        });
    }, 300);
  }
  
  // Función para cerrar sesión
  function cerrarSesion() {
    // Limpiar localStorage
    localStorage.clear();
    
    // Mostrar mensaje al usuario
    mostrarToast('Sesión cerrada correctamente', 'success');
    
    // Esperar un momento para que el usuario vea el mensaje
    setTimeout(() => {
      // Redirigir a la página principal
      window.location.href = '/';
    }, 1500); // Esperar 1.5 segundos
  }
  
  // Función para mostrar toast de notificación
  function mostrarToast(mensaje, tipo = 'info') {
    // Verificar si Toastify está disponible
    if (typeof Toastify === 'function') {
      Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: tipo === 'success' ? '#4CAF50' : 
                         tipo === 'error' ? '#F44336' : 
                         tipo === 'warning' ? '#FF9800' : '#2196F3',
      }).showToast();
    } else {
      // Fallback si Toastify no está disponible
      alert(mensaje);
    }
  }
});
