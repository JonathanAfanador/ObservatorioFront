// ============================================================
// secretaria-init.js
// Punto de entrada: inicialización del dashboard secretaría
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Construir el menú lateral
    buildSecretariaMenu();

    // 2. Mostrar la vista de resumen por defecto y cargar sus datos
    const defView = document.getElementById('view-resumen');
    if (defView) defView.style.display = 'block';
    loadStats();

    // 3. Vincular el formulario de subir resolución
    const fRes = document.getElementById('form-resolucion');
    if (fRes) fRes.addEventListener('submit', handleSubirResolucion);
});
