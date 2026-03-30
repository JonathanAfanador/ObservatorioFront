// ============================================================
// app-auth-utils.js
// Utilidades compartidas de autenticación: manejo de errores
// de formulario y limpieza de storage de sesión.
// Usado por: app-register.js, app-login.js, app-logout.js
// ============================================================

/**
 * Limpia todos los mensajes de error del formulario
 * y restaura los textos de ayuda.
 */
export function clearErrors() {
    document.querySelectorAll('[id^="error-"]').forEach(span => {
        span.classList.add('hidden');
        span.textContent = '';
    });

    document.querySelectorAll('.form-helper-text').forEach(p => {
        p.classList.remove('hidden');
    });

    const generalError = document.getElementById('form-error-message');
    if (generalError) {
        generalError.classList.add('hidden');
        generalError.textContent = '';
    }
}

/**
 * Muestra un mensaje de error para un campo específico
 * y oculta su texto de ayuda.
 */
export function showValidationError(field, message) {
    const helper = document.getElementById(`helper-${field}`);
    if (helper) helper.classList.add('hidden');

    const errorSpan = document.getElementById(`error-${field}`);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.toggle('hidden', !message);
    }
}

export function clearAuthStorage() {
    sessionStorage.removeItem('auth_token'); // Por retrocompatibilidad
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_role_id');
    sessionStorage.removeItem('user_role_desc');
    sessionStorage.removeItem('user_dashboard_path');
    sessionStorage.removeItem('user_empresa_id');
}

/**
 * Lee el valor de una cookie por su nombre
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

/**
 * Devuelve el token de sesión (legacy compatibility)
 */
export function getToken() {
    return sessionStorage.getItem('auth_token') || '';
}

// Exponer al scope global para evitar ReferenceError
window.getToken = getToken;

