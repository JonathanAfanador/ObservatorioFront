// ============================================================
// secretaria-base.js
// Configuración global, utilidades de autenticación y API
// ============================================================

// --- Almacén de datos global del dashboard ---
window.dashboardDataStore = {
    empresas: [],
    rutas: [],
    resoluciones: []
};

// --- Función auxiliar para leer cookies (CSRF de Sanctum) ---
window.getCookie = function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
};

// --- Notificaciones visuales ---
window.showNotification = function (type, title, message) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `notification ${type}`;

    let icon = '';
    if (type === 'success') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if (type === 'error') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if (type === 'warning') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if (type === 'info') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    div.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;

    div.querySelector('.notification-close').addEventListener('click', () => div.remove());
    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
};

// --- Llamada genérica a la API ---
window.apiCall = async function (endpoint, method = 'GET', body = null, isFile = false) {
    const csrfToken = getCookie('XSRF-TOKEN');

    const headers = {
        'Accept': 'application/json'
    };

    if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Si NO es archivo, agregamos Content-Type JSON
    if (!isFile && body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = { method, headers, credentials: 'same-origin' };

    if (body) {
        config.body = (isFile || body instanceof FormData) ? body : JSON.stringify(body);
    }

    try {
        let url = `/api${endpoint}`;

        // Cache-busting para peticiones GET (evita errores 404 por datos obsoletos)
        if (method.toUpperCase() === 'GET') {
            const sep = url.includes('?') ? '&' : '?';
            url += `${sep}_t=${new Date().getTime()}`;
        }

        const res = await fetch(url, config);

        // Manejo de token expirado o sesión no iniciada
        if (res.status === 401) {
            sessionStorage.removeItem('auth_token'); // Limpiar token deprecado por las dudas
            window.location.href = '/login';
            return null;
        }

        // Manejo especial para descargas (blobs)
        const contentType = res.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            return res;
        }

        const json = await res.json();

        if (!res.ok) {
            if (res.status === 422 && json.errors) {
                console.error('Errores de validación:', json.errors);
                const errorMsg = Object.entries(json.errors)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join('\n');
                throw new Error(`Validación fallida:\n${errorMsg}`);
            }
            throw new Error(json.message || `Error HTTP: ${res.status}`);
        }

        return json;
    } catch (err) {
        console.error('Fallo en API:', err);
        if (err.message !== 'Failed to fetch' && !err.message.includes('401')) {
            showNotification('error', 'Error de Sistema', err.message);
        }
        return null;
    }
};

window.normalizeList = function (resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  // Estructura { data: [...] }
  if (Array.isArray(resp.data)) return resp.data;
  // Estructura { data: { data: [...] } }
  if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  // Estructura paginada { current_page, data: [...] }
  if (resp.current_page && Array.isArray(resp.data)) return resp.data;
  // Buscar el primer array de objetos dentro del objeto
  const values = Object.values(resp);
  for (const v of values) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
      return v;
    }
  }
  return [];
};

window.getSafeData = function (obj, path, defaultValue = 'N/A') {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === null || result === undefined) {
      return defaultValue;
    }
  }
  return result || defaultValue;
};

// Backwards compatibility con la nueva arquitectura
window.apiGet = async function (path) { return window.apiCall(path, 'GET'); };
window.apiPost = async function (path, data) { return window.apiCall(path, 'POST', data); };
window.apiPut = async function (path, data) { return window.apiCall(path, 'PUT', data); };
