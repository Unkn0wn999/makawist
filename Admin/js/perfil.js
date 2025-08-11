/**
 * Funciones para el manejo del perfil de administrador
 */

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

// Verificar si hay token al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  console.log('Token en localStorage:', token ? 'Presente' : 'No encontrado');
  
  if (token) {
    try {
      // Intentar decodificar el token para ver su contenido
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Contenido del token:', payload);
      }
    } catch (e) {
      console.error('Error al decodificar token:', e);
    }
  }
  
  if (!token) {
    // Si no hay token, redirigir al inicio
    console.log('No hay token, redirigiendo...');
    window.location.href = '/';
  }
});

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
      console.log('Datos del perfil recibidos:', usuario);
      
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