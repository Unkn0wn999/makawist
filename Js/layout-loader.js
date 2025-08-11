document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch("Componentes/header.html").then(res => res.text()),
    fetch("Componentes/footer.html").then(res => res.text()),
    fetch("Componentes/popups.html").then(res => res.text())
  ])
    .then(([header, footer, popups]) => {
      const headerContainer = document.getElementById("header-placeholder");
      const footerContainer = document.getElementById("footer-placeholder");
      const popupsContainer = document.getElementById("popups-placeholder");

      if (headerContainer) headerContainer.innerHTML = header;
      if (footerContainer) footerContainer.innerHTML = footer;
      if (popupsContainer) popupsContainer.innerHTML = popups;

      // Inyectar scripts necesarios si aún no están cargados
      if (!document.querySelector('script[src="Js/toast.js"]')) {
        const toastScript = document.createElement("script");
        toastScript.src = "Js/toast.js";
        toastScript.defer = true;
        document.body.appendChild(toastScript);
      }
      
      // Inyectar el validador de token si aún no está cargado
      if (!document.querySelector('script[src="Js/token-validator.js"]')) {
        const tokenScript = document.createElement("script");
        tokenScript.src = "Js/token-validator.js";
        tokenScript.defer = true;
        document.body.appendChild(tokenScript);
      }
      
      // Inyectar el script del botón de WhatsApp si aún no está cargado
      if (!document.querySelector('script[src="Js/whatsapp-button.js"]')) {
        const whatsappScript = document.createElement("script");
        whatsappScript.src = "Js/whatsapp-button.js";
        whatsappScript.defer = true;
        document.body.appendChild(whatsappScript);
      }

      // Esperar a que se carguen los scripts antes de actualizar el contador del carrito
      setTimeout(window.actualizarContadorCarrito, 100);
      
      // Inicializar funcionalidad de autenticación y menú de usuario
      iniciarFuncionalidadUsuario();
    })
    .catch(err => console.error("Error cargando layout:", err));
});

// Hacemos la función global para que pueda ser accedida desde otros archivos
window.actualizarContadorCarrito = function() {
  const token = localStorage.getItem("token");
  const badge = document.querySelector("#carrito-contador");

  if (!badge) return;
  
  // Si no hay token, mostrar 0
  if (!token) {
    badge.textContent = "0";
    return;
  }

  // Intentar obtener datos del carrito desde la API
  fetch("/api/carrito", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error al obtener carrito: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      // Verificar si la respuesta es un array de productos
      const productosArray = Array.isArray(data) ? data : [];
      
      // Calcular el total considerando diferentes nombres de propiedades para cantidad
      const total = productosArray.reduce((sum, p) => {
        // Intentar obtener la cantidad del producto, con fallbacks
        const cantidad = p.Cantidad !== undefined ? p.Cantidad : 
                        (p.cantidad !== undefined ? p.cantidad : 1);
        return sum + cantidad;
      }, 0);
      
      badge.textContent = total > 0 ? total : "0";
    })
    .catch(err => {
      console.log("Usando carrito local debido a error de API:", err);
      
      // Si hay error en la API, intentar usar el carrito del localStorage
      try {
        const carritoLocal = JSON.parse(localStorage.getItem("carrito") || "[]");
        // Asegurarse de que carritoLocal sea un array
        const carritoArray = Array.isArray(carritoLocal) ? carritoLocal : [];
        
        const total = carritoArray.reduce((sum, p) => {
          const cantidad = p.Cantidad !== undefined ? p.Cantidad : 
                          (p.cantidad !== undefined ? p.cantidad : 1);
          return sum + cantidad;
        }, 0);
        
        badge.textContent = total > 0 ? total : "0";
      } catch (localErr) {
        console.error("Error al leer carrito local:", localErr);
        badge.textContent = "0";
      }
    });
}

// Función para inicializar la funcionalidad de autenticación y menú de usuario
function iniciarFuncionalidadUsuario() {
  const loginOverlay = document.getElementById("loginPopupOverlay");
  const registerOverlay = document.getElementById("registerPopupOverlay");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.querySelector("form[name='registro']");
  const iconoUsuario = document.getElementById("icono-usuario");
  const menuUsuario = document.getElementById("menu-usuario");
  const cerrarSesion = document.getElementById("cerrar-sesion");

  if (iconoUsuario) {
    iconoUsuario.addEventListener("click", (e) => {
      e.preventDefault();
      if (localStorage.getItem("token")) {
        menuUsuario.style.display = menuUsuario.style.display === "block" ? "none" : "block";
      } else {
        loginOverlay.style.display = "flex";
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (menuUsuario && !menuUsuario.contains(e.target) && !iconoUsuario?.contains(e.target)) {
      menuUsuario.style.display = "none";
    }
  });

  if (cerrarSesion) {
    cerrarSesion.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
  
  // Configurar botones para cambiar entre login y registro
  document.querySelectorAll(".register-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      limpiarCampos(registerForm);
      limpiarErrores();
      loginOverlay.style.display = "none";
      registerOverlay.style.display = "flex";
    });
  });

  // Configurar botones para cerrar popups
  document.getElementById("closeLoginPopup")?.addEventListener("click", () => {
    limpiarCampos(loginForm);
    limpiarErrores();
    loginOverlay.style.display = "none";
  });
  
  document.getElementById("closeForgotPasswordPopup")?.addEventListener("click", () => {
    document.getElementById("forgotPasswordForm").reset();
    limpiarErrores();
    document.getElementById("forgotPasswordPopupOverlay").style.display = "none";
  });
  
  document.getElementById("closeResetPasswordPopup")?.addEventListener("click", () => {
    document.getElementById("resetPasswordForm").reset();
    limpiarErrores();
    document.getElementById("resetPasswordPopupOverlay").style.display = "none";
  });

  document.getElementById("closeRegisterPopup")?.addEventListener("click", () => {
    limpiarCampos(registerForm);
    limpiarErrores();
    registerOverlay.style.display = "none";
  });

  // Configurar validación de tipo de documento
  const tipoDocumento = document.getElementById("registro-tipoDocumento");
  const numeroDocumento = document.getElementById("registro-documento");

  if (tipoDocumento && numeroDocumento) {
    tipoDocumento.addEventListener("change", () => {
      numeroDocumento.value = "";
      numeroDocumento.maxLength = tipoDocumento.value === "DNI" ? 8 : 11;
    });

    numeroDocumento.addEventListener("input", () => {
      const max = tipoDocumento.value === "DNI" ? 8 : 11;
      numeroDocumento.value = numeroDocumento.value.replace(/\D/g, "").slice(0, max);
    });
  }

  // Configurar botones para mostrar/ocultar contraseña
  document.querySelectorAll(".toggle-pass").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.getAttribute("data-target");
      const input = document.getElementById(inputId);
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
        btn.innerHTML = input.type === "password"
          ? '<i class="bi bi-eye-fill"></i>'
          : '<i class="bi bi-eye-slash-fill"></i>';
      }
    });
  });

  // Configurar enlace de recuperación de contraseña
  document.getElementById("forgot-password-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    loginOverlay.style.display = "none";
    document.getElementById("forgotPasswordPopupOverlay").style.display = "flex";
  });
  
  // Configurar botón para volver al login desde recuperación
  document.querySelectorAll(".back-to-login-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("forgotPasswordPopupOverlay").style.display = "none";
      loginOverlay.style.display = "flex";
    });
  });
  
  // Configurar formulario de recuperación de contraseña
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    configurarFormularioRecuperacion(forgotPasswordForm);
  }
  
  // Configurar formulario de reset de contraseña
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  if (resetPasswordForm) {
    configurarFormularioReset(resetPasswordForm);
  }
  
  // Configurar formularios de login y registro si existen
  if (loginForm) {
    configurarFormularioLogin(loginForm, loginOverlay);
  }

  if (registerForm) {
    configurarFormularioRegistro(registerForm, registerOverlay);
  }
}

// Función para configurar el formulario de login
function configurarFormularioLogin(loginForm, loginOverlay) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("#login-correo").value;
    const password = loginForm.querySelector("#login-password").value;

    fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: email, password }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.mensaje || "Error al iniciar sesión");
          });
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("rol", data.rol);
        loginOverlay.style.display = "none";
        
        // Redirigir según el rol
        if (data.rol === "admin") {
          window.location.href = "Admin/dashboard.html";
        } else {
          window.location.reload();
        }
      })
      .catch(err => {
        console.error("Error:", err);
        mostrarError("login-errores", err.message || "Error del servidor");
      });
  });
}

// Función para validar formato de email
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Función para mostrar mensajes toast
function mostrarToast(mensaje, tipo = 'warn') {
  // Verificar si ya existe un contenedor de toasts
  let toastContainer = document.querySelector('.toast-container');
  
  // Si no existe, crearlo
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Crear un nuevo toast
  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  
  // Normalizar el tipo de toast a los permitidos: success, warn, error
  let tipoNormalizado = tipo;
  if (tipo === 'warning') tipoNormalizado = 'warn';
  if (tipo === 'info') tipoNormalizado = 'warn';
  
  toast.className = `toast show toast-${tipoNormalizado}`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  // Definir el icono según el tipo
  let icono = '';
  let tipoMostrar = '';
  
  switch (tipoNormalizado) {
    case 'success':
      icono = '<i class="bi bi-check-circle-fill me-2"></i>';
      tipoMostrar = 'Success';
      break;
    case 'error':
      icono = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
      tipoMostrar = 'Error';
      break;
    case 'warn':
      icono = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
      tipoMostrar = 'Advertencia';
      break;
  }
  
  // Contenido del toast
  toast.innerHTML = `
    <div class="toast-header">
      ${icono}
      <strong class="me-auto">${tipoMostrar}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" onclick="document.getElementById('${toastId}').remove()"></button>
    </div>
    <div class="toast-body">
      ${mensaje}
    </div>
  `;
  
  // Añadir el toast al contenedor
  toastContainer.appendChild(toast);
  
  // Eliminar el toast después de 5 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Función para configurar el formulario de recuperación de contraseña
function configurarFormularioRecuperacion(forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = forgotPasswordForm.querySelector("#forgot-password-correo").value;
    
    // Validar correo
    if (!validarEmail(email)) {
      mostrarError("forgot-password-error-correo", "Ingresa un correo electrónico válido");
      return;
    }
    
    fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: email }),
    })
      .then(res => res.json())
      .then(data => {
        // Siempre mostrar mensaje de éxito, incluso si el correo no existe (por seguridad)
        document.getElementById("forgotPasswordPopupOverlay").style.display = "none";
        mostrarToast(data.mensaje || "Se ha enviado un enlace de recuperación a tu correo electrónico");
      })
      .catch(err => {
        console.error("Error:", err);
        mostrarError("forgot-password-errores", "Error al procesar la solicitud. Inténtalo más tarde.");
      });
  });
}

// Función para configurar el formulario de reset de contraseña
function configurarFormularioReset(resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const token = document.getElementById("reset-token").value;
    const password = resetPasswordForm.querySelector("#reset-password").value;
    const confirmPassword = resetPasswordForm.querySelector("#reset-confirm-password").value;
    
    // Validar contraseña
    if (password.length < 6) {
      mostrarError("reset-password-error-password", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      mostrarError("reset-password-error-confirm", "Las contraseñas no coinciden");
      return;
    }
    
    fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.mensaje || "Error al restablecer la contraseña");
          });
        }
        return res.json();
      })
      .then(data => {
        document.getElementById("resetPasswordPopupOverlay").style.display = "none";
        mostrarToast(data.mensaje || "Contraseña actualizada con éxito");
      })
      .catch(err => {
        console.error("Error:", err);
        mostrarError("reset-password-errores", err.message || "Error al restablecer la contraseña");
      });
  });
}

// Función para configurar el formulario de registro
function configurarFormularioRegistro(registerForm, registerOverlay) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nombres = registerForm.querySelector("#registro-nombres").value;
    const apellidos = registerForm.querySelector("#registro-apellidos").value;
    const tipoDoc = registerForm.querySelector("#registro-tipoDocumento").value;
    const numDoc = registerForm.querySelector("#registro-documento").value;
    const correo = registerForm.querySelector("#registro-correo").value;
    const pass = registerForm.querySelector("#registro-password").value;

    fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombres,
        apellidos,
        tipoDocumento: tipoDoc,
        numeroDocumento: numDoc,
        correo,
        password: pass,
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.mensaje || "Error al registrar");
          });
        }
        return res.json();
      })
      .then(data => {
        mostrarToast("¡Registro exitoso! Ahora puedes iniciar sesión.", "success");
        limpiarCampos(registerForm);
        registerOverlay.style.display = "none";
      })
      .catch(err => {
        console.error("Error:", err);
        mostrarError("error-correo", err.message || "Error del servidor");
      });
  });
}

// Función para mostrar mensajes de error
function mostrarError(id, mensaje) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<i class="bi bi-x-circle-fill me-1 text-danger"></i> ${mensaje}`;
}

// Función para limpiar todos los mensajes de error
function limpiarErrores() {
  document.querySelectorAll(".error-msg").forEach((e) => (e.innerHTML = ""));
}

// Función para limpiar todos los campos de un formulario
function limpiarCampos(form) {
  form?.querySelectorAll("input, select").forEach((input) => (input.value = ""));
}


