/**
 * Sistema de notificaciones toast para Makawi Store
 * Este archivo contiene las funciones para mostrar mensajes toast en la aplicación
 */

// Función para mostrar un mensaje toast
function mostrarToast(mensaje, tipo = "info") {
  let toast = document.getElementById("toast-notification");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "toast-notificacion";
    toast.innerHTML = `<i class="bi me-2"></i><span id="mensaje-toast"></span>`;
    document.body.appendChild(toast);
  }

  const mensajeSpan = toast.querySelector("#mensaje-toast");
  const icon = toast.querySelector("i");

  // Resetear clases
  toast.className = "toast-notificacion show";
  icon.className = "bi me-2";

  switch (tipo) {
    case "success":
      toast.classList.add("toast-success");
      icon.classList.add("bi-check-circle-fill");
      break;
    case "error":
      toast.classList.add("toast-error");
      icon.classList.add("bi-x-circle-fill");
      break;
    case "warning":
      toast.classList.add("toast-warn");
      icon.classList.add("bi-exclamation-triangle-fill");
      break;
    case "info":
    default:
      toast.classList.add("toast-info");
      icon.classList.add("bi-info-circle-fill");
  }

  mensajeSpan.textContent = mensaje;

  toast.style.display = "flex";

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.style.display = "none";
    }, 400);
  }, 3500);
}

// Hacer disponible la función globalmente
window.mostrarToast = mostrarToast;
