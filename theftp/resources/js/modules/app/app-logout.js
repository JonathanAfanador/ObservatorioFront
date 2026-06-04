// ============================================================
// app-logout.js
// Logout manual y cierre automático por inactividad.
// ============================================================
import { clearAuthStorage, getCookie, getAuthHeaders } from './app-auth-utils.js';

// ======================== LOGOUT MANUAL ========================

/**
 * Maneja el clic en los botones ".btn-logout".
 * Invalida el token en el servidor, limpia el storage y redirige.
 */
async function handleLogout(e) {
    e.preventDefault();

    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.error('La solicitud de logout a la API falló.', response.status, response.statusText);
        } else {
            console.log('Cierre de sesión de API solicitado y completado (200 OK).');
        }
    } catch (error) {
        console.error('Error de red durante el logout en el servidor:', error);
    }

    clearAuthStorage();

    // Restaurar UI al estado de invitado
    document.getElementById('auth-guest-desktop')?.classList.remove('hidden');
    document.getElementById('auth-guest-mobile')?.classList.remove('hidden');
    document.getElementById('auth-user-desktop')?.classList.add('hidden');
    document.getElementById('auth-user-mobile')?.classList.add('hidden');

    window.location.href = '/login?status=logged-out';
}

// Asignar a todos los botones de logout
document.querySelectorAll('.btn-logout').forEach(button => {
    button.addEventListener('click', handleLogout);
});

// ======================== INACTIVIDAD ========================

let inactivityTimer;
const INACTIVITY_TIMEOUT = 90 * 60 * 1000; // 90 minutos (1 hora y media)
// const INACTIVITY_TIMEOUT = 5000; // Para pruebas rápidas

/**
 * Cierra la sesión automáticamente por inactividad.
 */
async function logoutDueToInactivity() {
    console.log('Cerrando sesión por inactividad...');
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: getAuthHeaders()
        });
        console.log('Sesión de API invalidada por inactividad.');
    } catch (error) {
        console.error('Error al intentar cerrar sesión de API por inactividad:', error);
    }

    clearAuthStorage();
    window.location.href = '/login?status=inactive';
}

/**
 * Reinicia el temporizador de inactividad.
 * Se llama cada vez que se detecta actividad del usuario.
 */
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
}

/**
 * Arranca el sistema de vigilancia de inactividad.
 * Debe llamarse solo cuando el usuario está autenticado.
 */
export function startInactivityTracker() {
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    console.log(`Iniciando seguimiento de inactividad (${INACTIVITY_TIMEOUT / 1000}s).`);
    resetInactivityTimer();
}

// Exponer en window para compatibilidad con app-ui.js que la invoca mediante typeof
window.startInactivityTracker = startInactivityTracker;
