// FIX para dashboard-empresa.js
// 1. Primero haz backup: copy resources\js\dashboard-empresa.js resources\js\dashboard-empresa.bak
// 2. El problema principal es que los event listeners se declaran antes del DOM estar listo
// 3. La solución es mover TODOS dentro de initDashboard() o usar funciones nombradas

// Mensaje simple para confirmar que el script del dashboard de empresa se cargó
console.log('Script dashboard-empresa cargado');

// Muestra en consola si los botones principales existen en el DOM al momento de ejecutar el script
console.log('Botones encontrados:', {
    conductor: !!document.getElementById('btn-add-conductor'),
    vehiculo: !!document.getElementById('btn-add-vehiculo'),
    ruta: !!document.getElementById('btn-add-ruta')
});
