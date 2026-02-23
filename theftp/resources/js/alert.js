/*
 * Controla cuándo se muestra u oculta la alerta de notificación
 * en la pantalla de inicio de sesión.
 */
document.addEventListener('DOMContentLoaded', () => {

  // Busca el elemento donde debería aparecer la alerta
  const alertBox = document.getElementById('auth-alert-box');
  if (!alertBox) {
    // Si en esta vista no existe la alerta, no hay nada que manejar
    return;
  }

  // Ubica el botón encargado de cerrar la alerta
  const closeButton = alertBox.querySelector('.auth-alert-close');

  // Maneja el cierre de la alerta cuando el usuario hace clic
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      // Al presionar la “X”, simplemente se oculta el mensaje
      alertBox.classList.remove('is-visible');
    });
  }

  // Revisa los parámetros de la URL para saber si debe mostrarse la alerta
  const urlParams = new URLSearchParams(window.location.search);

  // Si llega el parámetro ?status=logged-out, significa que cerró sesión
  if (urlParams.get('status') === 'logged-out') {
    // En ese caso, se activa la visibilidad de la alerta
    alertBox.classList.add('is-visible');
  }

});
