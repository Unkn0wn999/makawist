/**
 * token-validator.js
 * Este script verifica la validez del token JWT y cierra la sesión automáticamente cuando expira
 */

// Función para decodificar un token JWT sin verificar la firma
function decodificarToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Error al decodificar token:', error);
    return null;
  }
}

// Función para verificar si el token JWT ha expirado
function verificarTokenExpirado() {
  const token = localStorage.getItem('token');
  
  // Si no hay token, no hay nada que verificar
  if (!token) return false;
  
  try {
    const payload = decodificarToken(token);
    
    if (!payload) return true; // Si no se pudo decodificar, consideramos que es inválido
    
    // Verificar si el token ha expirado
    if (payload.exp) {
      const fechaExpiracion = new Date(payload.exp * 1000); // Convertir de segundos a milisegundos
      const ahora = new Date();
      
      if (ahora >= fechaExpiracion) {
        console.log('⚠️ Token expirado. Cerrando sesión...');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    return true; // Si hay error al verificar, consideramos que el token es inválido
  }
}

// Función para verificar si el token está a punto de expirar (menos de 10 minutos)
function tokenPorExpirar() {
  const token = localStorage.getItem('token');
  
  // Si no hay token, no hay nada que verificar
  if (!token) return false;
  
  try {
    const payload = decodificarToken(token);
    
    if (!payload || !payload.exp) return false;
    
    const fechaExpiracion = new Date(payload.exp * 1000); // Convertir de segundos a milisegundos
    const ahora = new Date();
    
    // Calcular la diferencia en minutos
    const minutosParaExpirar = (fechaExpiracion - ahora) / (1000 * 60);
    
    // Si faltan menos de 10 minutos para que expire
    return minutosParaExpirar > 0 && minutosParaExpirar < 10;
  } catch (error) {
    console.error('❌ Error al verificar tiempo de expiración:', error);
    return false;
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  // Mostrar mensaje al usuario
  if (typeof mostrarToast === 'function') {
    mostrarToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
  } else {
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }
  
  // Limpiar localStorage
  localStorage.clear();
  
  // Esperar un momento para que el usuario vea el mensaje
  setTimeout(() => {
    // Redirigir a la página principal si no estamos ya en ella
    if (window.location.pathname !== '/index.html' && 
        window.location.pathname !== '/' && 
        !window.location.pathname.includes('/Admin/')) {
      window.location.href = '/index.html';
    } else {
      // Si ya estamos en la página principal, solo recargamos
      window.location.reload();
    }
  }, 1500); // Esperar 1.5 segundos
}

// Verificar el token cada vez que se carga una página
document.addEventListener('DOMContentLoaded', () => {
  if (verificarTokenExpirado()) {
    cerrarSesion();
  }
});

// Función para renovar el token
async function renovarToken() {
  try {
    // Obtener el token actual
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Llamar al endpoint de renovación de token
    const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('No se pudo renovar el token');
    }
    
    const data = await response.json();
    
    // Guardar el nuevo token
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ Token renovado exitosamente');
      return true;
    } else {
      throw new Error('No se recibió un nuevo token');
    }
  } catch (error) {
    console.error('❌ Error al renovar token:', error);
    return false;
  }
}

// Verificar el token periódicamente (cada minuto)
setInterval(() => {
  // Si el token ha expirado, cerrar sesión
  if (verificarTokenExpirado()) {
    cerrarSesion();
    return;
  }
  
  // Si el token está por expirar, intentar renovarlo
  if (tokenPorExpirar()) {
    console.log('⚠️ Token por expirar. Intentando renovar...');
    renovarToken().catch(error => {
      console.error('❌ Error al renovar token:', error);
    });
  }
}, 60 * 1000); // 1 minuto en milisegundos

// Verificar el token antes de cada petición fetch
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // Si el token ha expirado, cerrar sesión antes de realizar la petición
  if (verificarTokenExpirado()) {
    cerrarSesion();
    // Rechazar la promesa con un error
    return Promise.reject(new Error('Token expirado'));
  }
  
  // Si el token es válido, continuar con la petición original
  return originalFetch.apply(this, arguments);
};