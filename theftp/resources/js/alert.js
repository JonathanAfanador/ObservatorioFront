/*
 * Controla la visualización de la alerta de notificación
 * en la página de login.
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Busca el contenedor de la alerta en la página
  const alertBox = document.getElementById('auth-alert-box');
  if (!alertBox) {
    // Si no hay alerta en esta página, no hacer nada.
    return;
  }

  const closeButton = alertBox.querySelector('.auth-alert-close');
  
  // 2. Lógica para CERRAR la alerta
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      // Oculta la alerta al hacer clic en la 'X'
      alertBox.classList.remove('is-visible');
    });
  }

  // 3. Lógica para MOSTRAR la alerta
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('status') === 'logged-out') {
    // Si el parámetro ?status=logged-out existe...
    alertBox.classList.add('is-visible'); // ¡Muéstralo!
  }

});