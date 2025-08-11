document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch("Componentes/header.html").then(res => res.text()),
    fetch("Componentes/footer.html").then(res => res.text()),
    fetch("Componentes/popups.html").then(res => res.text())
  ])
    .then(([headerHtml, footerHtml, popupsHtml]) => {
      const header = document.getElementById("header-placeholder");
      const footer = document.getElementById("footer-placeholder");
      const popups = document.getElementById("popups-placeholder");

      if (header) header.innerHTML = headerHtml;
      if (footer) footer.innerHTML = footerHtml;
      if (popups) popups.innerHTML = popupsHtml;

      iniciarApp();
    })
    .catch(err => console.error("Error cargando layout:", err));
});

function iniciarApp() {
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
    if (menuUsuario && !menuUsuario.contains(e.target) && !iconoUsuario.contains(e.target)) {
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

  document.querySelectorAll(".register-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      limpiarCampos(registerForm);
      limpiarErrores();
      loginOverlay.style.display = "none";
      registerOverlay.style.display = "flex";
    });
  });

  document.getElementById("closeLoginPopup")?.addEventListener("click", () => {
    limpiarCampos(loginForm);
    limpiarErrores();
    loginOverlay.style.display = "none";
  });

  document.getElementById("closeRegisterPopup")?.addEventListener("click", () => {
    limpiarCampos(registerForm);
    limpiarErrores();
    registerOverlay.style.display = "none";
  });

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

  // LOGIN
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();
    const correo = loginForm.correo.value.trim();
    const pass = loginForm.password.value.trim();
    let valido = true;

    if (!correo) {
      mostrarError("login-error-correo", "El correo es obligatorio");
      valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarError("login-error-correo", "Correo inválido");
      valido = false;
    }

    if (!pass) {
      mostrarError("login-error-password", "La contraseña es obligatoria");
      valido = false;
    }

    if (!valido) return;

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarError("login-errores", data.mensaje || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("rol", data.rol);

      if (data.rol === "admin") {
        window.location.href = "/Admin/dashboard.html";
      } else {
        location.reload();
      }
    } catch {
      mostrarError("login-errores", "Error del servidor");
    }
  });

  // REGISTRO
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();
    let valido = true;

    const nombres = registerForm.nombres.value.trim();
    const apellidos = registerForm.apellidos.value.trim();
    const tipoDoc = registerForm.tipoDocumento.value;
    const numDoc = registerForm.numeroDocumento.value.trim();
    const correo = registerForm.correo.value.trim();
    const pass = registerForm.password.value;

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombres)) {
      mostrarError("error-nombres", "Solo se permiten letras");
      valido = false;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidos)) {
      mostrarError("error-apellidos", "Solo se permiten letras");
      valido = false;
    }

    if (!tipoDoc) {
      mostrarError("error-tipoDocumento", "Selecciona tipo de documento");
      valido = false;
    } else if (tipoDoc === "DNI" && !/^\d{8}$/.test(numDoc)) {
      mostrarError("error-documento", "DNI debe tener 8 dígitos");
      valido = false;
    } else if ((tipoDoc === "RUC" || tipoDoc === "CE") && !/^\d{11}$/.test(numDoc)) {
      mostrarError("error-documento", "Debe tener 11 dígitos");
      valido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarError("error-correo", "Correo inválido");
      valido = false;
    }

    const passRegex = /^(?=.*[A-Z!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\]{8,}$/;
    if (!passRegex.test(pass)) {
      mostrarError("error-password", "Mínimo 8 caracteres, 1 mayúscula o signo especial");
      valido = false;
    }

    if (!valido) return;

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombres, apellidos, tipoDocumento: tipoDoc, numeroDocumento: numDoc, correo, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarError("error-correo", data.mensaje || "Error al registrar");
        return;
      }

      mostrarToast("¡Registro exitoso! Ahora puedes iniciar sesión.", "success");
      limpiarCampos(registerForm);
    } catch {
      mostrarError("error-correo", "Error del servidor");
    }
  });

  function mostrarError(id, mensaje) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<i class="bi bi-x-circle-fill me-1 text-danger"></i> ${mensaje}`;
  }

  function limpiarErrores() {
    document.querySelectorAll(".error-msg").forEach((e) => (e.innerHTML = ""));
  }

  function limpiarCampos(form) {
    form?.querySelectorAll("input, select").forEach((input) => (input.value = ""));
  }
}
