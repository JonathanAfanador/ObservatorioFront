// ============================================================
// upc-base.js
// Almacén de datos global, notificaciones y llamada a API (GET)
// ============================================================

// --- Almacén compartido de datos para todas las vistas ---
window.dashboardDataStore = {
    empresas: [],
    conductores: [],
    vehiculos: [],
    rutas: [],
    documentos: []
};

// --- Almacén de instancias de gráficos (para destruirlos antes de recrear) ---
window.graficosActivos = {};

// --- Notificaciones visuales ---
window.showNotification = function (type, title, message, duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || '•'}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('closing');
        setTimeout(() => notification.remove(), 300);
    });

    container.appendChild(notification);

    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
};

// --- Llamada GET a la API (normaliza respuesta paginada y no paginada) ---
window.apiGet = async function (path) {
    const headers = { 'Accept': 'application/json' };

    const res = await fetch(path, { headers, credentials: 'same-origin' });

    if (!res.ok) {
        console.error(`Error ${res.status} consultando ${path}`);

        if (res.status === 401) {
            sessionStorage.removeItem('auth_token'); // Limpieza
            showNotification('warning', 'Sesión Expirada', 'Tu sesión ha expirado. Serás redirigido al inicio de sesión.', 3000);
            setTimeout(() => { window.location.href = '/'; }, 3000);
            throw new Error('Sesión expirada');
        }

        throw new Error(`Error ${res.status} (${res.statusText}) consultando ${path}`);
    }

    const json = await res.json();

    // Normalizar respuestas paginadas y no paginadas
    if (json.data && json.data.data) {
        return json; // { status, total, data: { ..., data: [...] } }
    } else if (json.data) {
        return { status: true, total: json.data.length, data: { data: json.data } };
    } else {
        return { status: true, total: 1, data: { data: [json] } };
    }
};

// --- Helper para extraer valores anidados (ej: 'persona.name') ---
window.getDeepValue = function (obj, path) {
    if (!path) return '-';
    try {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        return (value !== null && value !== undefined) ? value : '-';
    } catch (e) {
        return '-';
    }
};

// --- Generador genérico de tablas HTML ---
window.createTableFromArray = function (items, keys, noResultsMessage = 'No hay datos disponibles') {
    if (!Array.isArray(items) || items.length === 0) {
        return `<div class="empty-state"><p class="text-gray-500 text-center py-8">${noResultsMessage}</p></div>`;
    }

    let html = '<div class="table-container"><table class="modern-table">';
    html += '<thead><tr>';
    keys.forEach(k => html += `<th>${k.label}</th>`);
    html += '</tr></thead><tbody>';

    items.forEach((item, index) => {
        html += `<tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">`;
        keys.forEach(k => {
            let value = '-';
            if (typeof k.render === 'function') {
                try { value = k.render(item, index); } catch (e) { value = '-'; }
            } else if (k.key) {
                if (k.key.includes('.')) {
                    const parts = k.key.split('.');
                    let temp = item;
                    for (let part of parts) {
                        if (temp && typeof temp === 'object' && part in temp) {
                            temp = temp[part];
                        } else { temp = null; break; }
                    }
                    if (temp !== null && temp !== undefined && temp !== '') value = temp;
                } else {
                    if (item[k.key] !== undefined && item[k.key] !== null && item[k.key] !== '') {
                        value = item[k.key];
                    }
                }
            }
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
};
