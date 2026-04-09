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

// --- Utilidad para formatear fechas ---
window.formatDate = function (dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- Búsqueda Global en Tablas ---
window.applyGlobalSearch = function (query, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    const q = query.toLowerCase();
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
};

// --- Visualizador Universal de Documentos ---
window.previewDocument = function (url, title = 'Documento de Soporte') {
    const modal = document.getElementById('modal-preview-doc');
    const content = document.getElementById('preview-doc-content');
    const titleEl = document.getElementById('modal-preview-title');
    const downloadBtn = document.getElementById('btn-download-preview');

    if (!modal || !content) return;

    // Configurar Header y descarga
    if (titleEl) titleEl.textContent = title;
    if (downloadBtn) {
        downloadBtn.href = url;
        downloadBtn.className = downloadBtn.className.replace('pointer-events-none opacity-50', '');
    }

    // Identificar extensión
    const ext = url.split('.').pop().toLowerCase();
    content.innerHTML = '<div class="flex items-center justify-center h-full"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>';

    setTimeout(() => {
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
            content.innerHTML = `<img src="${url}" alt="Soporte" class="max-w-full max-h-full object-contain shadow-lg rounded-sm">`;
        } else if (ext === 'pdf') {
            content.innerHTML = `<iframe src="${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH" class="w-full h-full border-0 rounded-sm shadow-inner" style="background: #525659;"></iframe>`;
        } else {
            content.innerHTML = `
                <div class="text-center p-8 bg-white rounded-xl shadow-xl border border-slate-200 mx-4 max-w-sm">
                    <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <p class="font-bold text-sm uppercase tracking-widest text-center">Este tipo de archivo (.${ext}) no permite previsualización directa.<br>Por favor, utilice el botón de descarga.</p>
                </div>`;
        }
    }, 400);

    modal.style.display = 'flex';
};

// Inicializar eventos del visualizador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const btnClose = document.getElementById('btn-close-preview');
    const modal = document.getElementById('modal-preview-doc');

    if (btnClose && modal) {
        btnClose.onclick = () => { modal.style.display = 'none'; };
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    }
});

// Backwards compatibility
window.apiGet = async function (path) { return window.apiCall(path, 'GET'); };
window.apiPost = async function (path, data) { return window.apiCall(path, 'POST', data); };
window.apiPut = async function (path, data) { return window.apiCall(path, 'PUT', data); };

// Exponer AdminBase name-spacing para compatibilidad con las llamadas desde el HTML
window.AdminBase = {
    applyGlobalSearch: window.applyGlobalSearch,
    previewDocument: window.previewDocument
};
