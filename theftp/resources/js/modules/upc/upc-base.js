// ============================================================
// upc-base.js
// Almacén de datos global, notificaciones y llamada a API (GET)
// ============================================================

/**
 * Función maestra de navegación autónoma para el panel UPC
 * Permite cambiar entre vistas de reporte y entrar al Geovisor de forma segura.
 */
window.navigateToView = function(viewName) {
    console.log(`[UPC Router] Navegando a vista: ${viewName}`);
    
    // 1. Intentar disparar el clic del enlace real en el sidebar UPC
    const link = document.querySelector(`.nav-link[data-view="${viewName}"], a[href="#${viewName}"]`);
    if (link) {
        link.click();
    } else {
        // 2. Fallback manual: Cambio de estado directo en el DOM si el link no está disponible
        document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.style.display = 'block';
            
            // Actualizar el título del header para feedback visual
            const headerTitle = document.getElementById('header-title');
            if (headerTitle) {
                const names = {
                    'overview': 'Resumen',
                    'empresas': 'Reporte de Empresas',
                    'conductores': 'Reporte de Conductores',
                    'vehiculos': 'Reporte de Vehículos',
                    'rutas': 'Reporte de Rutas Autorizadas',
                    'documentos': 'Reporte de Resoluciones',
                    'estadisticas': 'Estadísticas'
                };
                headerTitle.textContent = names[viewName] || viewName;
            }

            // Sincronizar estado visual del menú
            document.querySelectorAll('.nav-link').forEach(l => {
                if (l.getAttribute('data-view') === viewName) l.classList.add('is-active');
                else l.classList.remove('is-active');
            });
        }
    }
};

// --- Almacén compartido de datos para todas las vistas ---
window.dashboardDataStore = {
    empresas: [],
    conductores: [],
    vehiculos: [],
    rutas: [],
    documentos: [],

    // Paginación por módulo
    pagination: {
        empresas: { current: 1, perPage: 10 },
        conductores: { current: 1, perPage: 10 },
        vehiculos: { current: 1, perPage: 10 },
        rutas: { current: 1, perPage: 10 },
        documentos: { current: 1, perPage: 10 }
    }
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
    const headers = window.getAuthHeaders ? window.getAuthHeaders() : { 'Accept': 'application/json' };

    const res = await fetch(path, { headers });

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

// --- Helper para renderizar la paginación con números específicos ---
window.renderPagination = function (totalItems, currentPage, itemsPerPage, onPageChangeName) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';

    let html = '<div class="pagination-container">';

    // Botón Anterior
    html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="${onPageChangeName}(${currentPage - 1})" title="Anterior">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    `;

    // Lógica para mostrar números (1, ..., curr-1, curr, curr+1, ..., total)
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'is-active' : ''}" onclick="${onPageChangeName}(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    // Botón Siguiente
    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="${onPageChangeName}(${currentPage + 1})" title="Siguiente">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    `;

    html += '</div>';
    return html;
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
