// Dashboard Empresa - Gestión CRUD completa
// ===========================================

let currentView = 'dashboard';
let editingId = null; // Para edición de registros

// Función para obtener token de autorización
function getToken() {
    return localStorage.getItem('auth_token');
}

// Sistema de notificaciones en página
function showNotification(type, title, message, duration = 5000) {
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

    // Botón cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('closing');
        setTimeout(() => notification.remove(), 300);
    });

    container.appendChild(notification);

    // Auto cerrar después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

// Función de confirmación personalizada (reemplaza confirm())
function showConfirm(title, message, onConfirm, onCancel = null) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'notification confirm-dialog';

    confirmDialog.innerHTML = `
        <div class="notification-icon" style="background: #f59e0b !important;">⚠</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
            <div class="confirm-buttons" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="confirm-yes" style="flex: 1; padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Eliminar</button>
                <button class="confirm-no" style="flex: 1; padding: 0.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Cancelar</button>
            </div>
        </div>
    `;

    // Botón Sí (Eliminar)
    confirmDialog.querySelector('.confirm-yes').addEventListener('click', () => {
        confirmDialog.classList.add('closing');
        setTimeout(() => confirmDialog.remove(), 300);
        if (onConfirm) onConfirm();
    });

    // Botón No (Cancelar)
    confirmDialog.querySelector('.confirm-no').addEventListener('click', () => {
        confirmDialog.classList.add('closing');
        setTimeout(() => confirmDialog.remove(), 300);
        if (onCancel) onCancel();
    });

    container.appendChild(confirmDialog);
}// Normaliza respuestas de listado (soporta estructuras paginadas)
function normalizeList(resp) {
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
}

// Función para obtener datos seguros de relaciones
function getSafeData(obj, path, defaultValue = 'N/A') {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        result = result?.[key];
        if (result === null || result === undefined) {
            return defaultValue;
        }
    }
    return result || defaultValue;
}

// Wrapper para llamadas GET a la API
async function apiGet(path) {
    const token = getToken();
    if (!token) {
        console.error('No hay token de autenticación');
        return null;
    }
    try {
        const response = await fetch(`/api${path}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en GET:', error);
        return null;
    }
}

// Wrapper para llamadas POST a la API
async function apiPost(path, data) {
    const token = getToken();
    if (!token) {
        alert('No hay token de autenticación');
        return null;
    }
    try {
        const response = await fetch(`/api${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);

            // Si hay errores de validación, mostrarlos de forma legible
            if (errorData.errors && typeof errorData.errors === 'object') {
                const errorMessages = Object.entries(errorData.errors)
                    .map(([field, messages]) => {
                        const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
                        return `${field}: ${msgs}`;
                    })
                    .join('\n');
                throw new Error(errorMessages);
            }

            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en POST:', error);
        alert('Error al guardar:\n' + error.message);
        return null;
    }
}

// Wrapper para llamadas POST con archivos
async function apiPostFile(path, formData) {
    const token = getToken();
    if (!token) {
        alert('No hay token de autenticación');
        return null;
    }
    try {
        const response = await fetch(`/api${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
                // NO incluir Content-Type, el navegador lo establece automáticamente con boundary
            },
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en POST con archivo:', error);
        alert('Error al guardar: ' + error.message);
        return null;
    }
}

// Wrapper para llamadas PUT a la API
async function apiPut(path, data) {
    const token = getToken();
    if (!token) {
        showNotification('error', 'Error de autenticación', 'No hay token de autenticación');
        return null;
    }
    try {
        const response = await fetch(`/api${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en PUT:', error);
        showNotification('error', 'Error al actualizar', error.message);
        return null;
    }
}

// Wrapper para llamadas DELETE a la API
async function apiDelete(path) {
    const token = getToken();
    if (!token) {
        showNotification('error', 'Error de autenticación', 'No hay token de autenticación');
        return null;
    }
    try {
        const response = await fetch(`/api${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error en DELETE:', error);
        showNotification('error', 'Error al eliminar', error.message);
        return null;
    }
}

// ==========================
// Menú de navegación lateral
// ==========================
function buildEmpresaMenu() {
    const menuHtml = `
        <nav class="sidebar-nav">
            <a href="#dashboard" class="nav-link active">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
            </a>
            <a href="#conductores" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span>Conductores</span>
            </a>
            <a href="#licencias" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Licencias</span>
            </a>
            <a href="#vehiculos" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <span>Vehículos</span>
            </a>
            <a href="#rutas" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Rutas</span>
            </a>
            <a href="#asignaciones" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Asignaciones</span>
            </a>
            <a href="#informes" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Informes</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <a href="#" id="btn-volver-inicio" class="nav-link btn-home" title="Ir a la página principal">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span>Volver al Inicio</span>
            </a>
        </div>
    `;

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const nav = sidebar.querySelector('nav');
        if (nav) nav.remove();
        const footer = sidebar.querySelector('.sidebar-footer');
        if (footer) footer.remove();
        sidebar.insertAdjacentHTML('beforeend', menuHtml);

        // Event listeners para navegación - Agregar después de insertar el HTML
        setTimeout(() => {
            document.querySelectorAll('.sidebar .nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    const viewName = href.substring(1); // Eliminar el #
                    console.log('Click en menú:', viewName); // Debug
                    window.location.hash = viewName; // Esto disparará el hashchange
                });
            });
        }, 0);
    }
}

// Navegación entre vistas
function navigateTo(viewName) {
    console.log('Navegando a:', viewName); // Debug

    // Ocultar todas las vistas
    document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');

    // Mostrar vista seleccionada
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.style.display = 'block';
        currentView = viewName;

        // Actualizar menú activo
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${viewName}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Actualizar título del header
        const titles = {
            'dashboard': 'Panel de Control',
            'conductores': 'Gestión de Conductores',
            'licencias': 'Gestión de Licencias',
            'vehiculos': 'Gestión de Vehículos',
            'rutas': 'Gestión de Rutas',
            'asignaciones': 'Asignación Vehículos a Rutas',
            'informes': 'Informes y Reportes'
        };
        const headerTitle = document.getElementById('header-title');
        if (headerTitle && titles[viewName]) {
            headerTitle.textContent = titles[viewName];
        }

        // Cargar datos según la vista
        switch(viewName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'conductores':
                loadConductores();
                break;
            case 'licencias':
                loadLicencias();
                break;
            case 'vehiculos':
                loadVehiculos();
                break;
            case 'rutas':
                loadRutas();
                break;
            case 'asignaciones':
                loadAsignaciones();
                break;
            case 'informes':
                // Los informes se cargan on-demand
                break;
        }
    } else {
        console.error('Vista no encontrada:', viewName);
    }
}

// ==========================
// 1. DASHBOARD / RESUMEN
// ==========================
async function loadDashboard() {
    const conductores = await apiGet('/conductores');
    const licencias = await apiGet('/conductores-licencias');
    const vehiculos = await apiGet('/vehiculos');
    const rutas = await apiGet('/rutas');

    const totalConductores = normalizeList(conductores).length;
    const totalLicencias = normalizeList(licencias).length;
    const totalVehiculos = normalizeList(vehiculos).length;
    const totalRutas = normalizeList(rutas).length;

    document.getElementById('empresa-cards').innerHTML = `
        <div class="metric-card card-conductores">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="card-title">Conductores</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalConductores}</div>
                <div class="metric-label">Registrados</div>
            </div>
            <div class="card-footer">
                <small>Conductores activos en sistema</small>
            </div>
        </div>

        <div class="metric-card card-licencias">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 11h.01"></path>
                    <path d="M8 11h.01"></path>
                </svg>
                <span class="card-title">Licencias</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalLicencias}</div>
                <div class="metric-label">Activas</div>
            </div>
            <div class="card-footer">
                <small>Licencias de conducción vigentes</small>
            </div>
        </div>

        <div class="metric-card card-vehiculos">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="18" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M6 6h12v8H6z"></path>
                    <path d="M6 6L4 9m14-3l2 3"></path>
                </svg>
                <span class="card-title">Vehículos</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalVehiculos}</div>
                <div class="metric-label">En Flota</div>
            </div>
            <div class="card-footer">
                <small>Vehículos activos en operación</small>
            </div>
        </div>

        <div class="metric-card card-rutas">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <span class="card-title">Rutas</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalRutas}</div>
                <div class="metric-label">Autorizadas</div>
            </div>
            <div class="card-footer">
                <small>Rutas activas del sistema</small>
            </div>
        </div>
    `;
}

// ==========================
// 2. GESTIÓN DE CONDUCTORES
// ==========================
async function loadConductores() {
    const response = await apiGet('/conductores?include=persona,persona.tipo_ident');
    const conductores = normalizeList(response);

    console.log('=== LOAD CONDUCTORES ===');
    console.log('Respuesta cruda:', response);
    console.log('Conductores normalizados:', conductores);
    if (conductores.length > 0) {
        console.log('Primer conductor completo:', JSON.stringify(conductores[0], null, 2));
    }

    if (conductores.length === 0) {
        document.getElementById('conductores-table').innerHTML = '';
        return;
    }

    let html = '<div class="conductores-grid">';
    conductores.forEach((c, index) => {
        // Obtener datos de forma segura
        const nui = getSafeData(c, 'persona.nui');
        const nombre = getSafeData(c, 'persona.name', '?');
        const apellido = getSafeData(c, 'persona.last_name', '');
        const nombreCompleto = `${nombre} ${apellido}`.trim();
        const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
        const telefono = getSafeData(c, 'persona.phone_number');
        const genero = getSafeData(c, 'persona.gender');
        const tipoIdentDesc = getSafeData(c, 'persona.tipo_ident.descripcion', 'CÉDULA');

        console.log(`Conductor ${index}: NUI=${nui}, Nombre=${nombreCompleto}, Telefono=${telefono}, Genero=${genero}, TipoIdent=${tipoIdentDesc}`);

        const generoDisplay = genero === 'Hombre' ? '👨 Hombre' : genero === 'Mujer' ? '👩 Mujer' : 'N/A';

        html += `
            <div class="conductor-card" data-conductor-id="${c.id}">
                <div class="conductor-card-header">
                    <div class="conductor-avatar">
                        ${iniciales}
                    </div>
                    <div class="conductor-card-title">
                        <h4>${nombreCompleto}</h4>
                        <span class="conductor-badge">${tipoIdentDesc}</span>
                    </div>
                </div>

                <div class="conductor-card-body">
                    <div class="conductor-info-row">
                        <span class="info-label">Identificación:</span>
                        <span class="info-value">${nui}</span>
                    </div>
                    <div class="conductor-info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">${telefono}</span>
                    </div>
                    <div class="conductor-info-row">
                        <span class="info-label">Género:</span>
                        <span class="info-value">${generoDisplay}</span>
                    </div>
                </div>

                <div class="conductor-card-footer">
                    <button class="btn-edit btn-sm btn-edit-conductor" data-conductor-id="${c.id}" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px;">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" />
                            <path d="M13.5 6.5l4 4" />
                        </svg>
                        Editar
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    document.getElementById('conductores-table').innerHTML = html;
}

// Función para validar número de identificación según su tipo
function validateIdentificationNumber(tipoIdent, nui) {
    // Remover espacios y caracteres especiales
    const nuiLimpio = nui.trim();

    if (tipoIdent.toUpperCase().includes('CÉDULA DE CIUDADANÍA')) {
        // Cédula de Ciudadanía: debe ser solo números, entre 8 y 10 dígitos
        if (!/^\d{8,10}$/.test(nuiLimpio)) {
            return 'La Cédula de Ciudadanía debe contener entre 8 y 10 dígitos numéricos.';
        }
    } else if (tipoIdent.toUpperCase().includes('CÉDULA DE EXTRANJERÍA')) {
        // Cédula de Extranjería: debe ser solo números, entre 8 y 10 dígitos
        if (!/^\d{8,10}$/.test(nuiLimpio)) {
            return 'La Cédula de Extranjería debe contener entre 8 y 10 dígitos numéricos.';
        }
    } else if (tipoIdent.toUpperCase().includes('REGISTRO CIVIL')) {
        // Registro Civil: formato variable, al menos 7 caracteres alfanuméricos
        if (!/^[a-zA-Z0-9]{7,20}$/.test(nuiLimpio)) {
            return 'El Registro Civil debe contener entre 7 y 20 caracteres alfanuméricos.';
        }
    }

    return null; // Sin errores
}

// Función para validar número de teléfono
function validatePhoneNumber(telefono) {
    const telefonoLimpio = telefono.trim();

    // Debe ser exactamente 10 dígitos numéricos y empezar con 3 (formato colombiano)
    if (!/^3\d{9}$/.test(telefonoLimpio)) {
        return 'El teléfono debe contener exactamente 10 dígitos y comenzar con 3 (formato: 3XX XXX XXXX).';
    }

    return null; // Sin errores
}

// Función para mostrar/actualizar el mensaje de validación en tiempo real
function updateValidationMessage() {
    const tipoIdentSelect = document.getElementById('conductor-tipo-ident');
    const nui = document.getElementById('conductor-nui').value;
    const validationMessageDiv = document.getElementById('nui-validation-message');

    if (!tipoIdentSelect.value || !nui) {
        // No mostrar mensaje si no hay tipo seleccionado o número vacío
        validationMessageDiv.style.display = 'none';
        return;
    }

    const tipoIdentText = tipoIdentSelect.options[tipoIdentSelect.selectedIndex].text;
    const error = validateIdentificationNumber(tipoIdentText, nui);

    if (error) {
        validationMessageDiv.textContent = error;
        validationMessageDiv.style.display = 'block';
        validationMessageDiv.style.color = '#ef4444'; // Color rojo para errores
    } else {
        validationMessageDiv.textContent = '✓ Formato válido';
        validationMessageDiv.style.display = 'block';
        validationMessageDiv.style.color = '#10b981'; // Color verde para válido
    }
}

// Función para mostrar/actualizar el mensaje de validación del teléfono en tiempo real
function updatePhoneValidationMessage() {
    const telefono = document.getElementById('conductor-telefono').value;
    const validationMessageDiv = document.getElementById('telefono-validation-message');

    if (!telefono) {
        // No mostrar mensaje si el teléfono está vacío
        validationMessageDiv.style.display = 'none';
        return;
    }

    const error = validatePhoneNumber(telefono);

    if (error) {
        validationMessageDiv.textContent = error;
        validationMessageDiv.style.display = 'block';
        validationMessageDiv.style.color = '#ef4444'; // Color rojo para errores
    } else {
        validationMessageDiv.textContent = '✓ Teléfono válido';
        validationMessageDiv.style.display = 'block';
        validationMessageDiv.style.color = '#10b981'; // Color verde para válido
    }
}

// Validar formato de placa colombiana
function validatePlaca(placa) {
    if (!placa) return null;

    // Convertir a mayúsculas
    placa = placa.toUpperCase().trim();

    // Formato colombiano: 3 letras + 3 números (ABC123)
    const placaRegex = /^[A-Z]{3}[0-9]{3}$/;

    if (!placaRegex.test(placa)) {
        return 'La placa debe tener el formato: 3 letras seguidas de 3 números (Ej: ABC123)';
    }

    return null;
}

// Actualizar mensaje de validación de placa en tiempo real
function updatePlacaValidationMessage() {
    const placa = document.getElementById('vehiculo-placa').value;
    const validationMessageDiv = document.getElementById('placa-validation-message');

    if (!placa) {
        validationMessageDiv.style.display = 'none';
        return;
    }

    const error = validatePlaca(placa);

    if (error) {
        validationMessageDiv.textContent = error;
        validationMessageDiv.style.display = 'block';
        validationMessageDiv.style.color = '#ef4444'; // Color rojo para errores
    } else {
        validationMessageDiv.textContent = '✓ Placa válida';
        validationMessageDiv.style.display = 'block';
        validationMessageDiv.style.color = '#10b981'; // Color verde para válido
    }
}

// Abrir modal para agregar conductor (restaurado)
async function openModalConductor() {
    editingId = null;
    document.getElementById('form-conductor').reset();
    document.querySelector('#modal-conductor .modal-title').textContent = 'Agregar Conductor';

    // Cargar tipos de identificación
    const tiposIdent = await apiGet('/tipo_ident');
    console.log('Respuesta de tipo_ident:', tiposIdent);

    const selectTipo = document.getElementById('conductor-tipo-ident');
    selectTipo.innerHTML = '<option value="">Seleccione</option>';

    const tiposData = normalizeList(tiposIdent);
    const tiposPermitidos = ['CÉDULA DE CIUDADANÍA', 'CÉDULA DE EXTRANJERÍA', 'REGISTRO CIVIL'];
    const tiposFiltrados = tiposData.filter(t => t && t.descripcion && tiposPermitidos.includes(t.descripcion.toUpperCase()));

    tiposFiltrados.forEach((t) => {
        if (t && t.id && t.descripcion) {
            selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
        }
    });

    // Event listeners de validación en tiempo real
    document.getElementById('conductor-tipo-ident').addEventListener('change', updateValidationMessage);
    document.getElementById('conductor-nui').addEventListener('input', updateValidationMessage);
    document.getElementById('conductor-telefono').addEventListener('input', updatePhoneValidationMessage);

    document.getElementById('modal-conductor').style.display = 'flex';
}

// Guardar conductor
async function saveConductor(e) {
    e.preventDefault();

    // Validar que todos los campos requeridos estén llenos
    const tipoIdent = document.getElementById('conductor-tipo-ident').value;
    const nui = document.getElementById('conductor-nui').value;
    const nombres = document.getElementById('conductor-nombres').value;
    const apellidos = document.getElementById('conductor-apellidos').value;
    const telefono = document.getElementById('conductor-telefono').value;
    const genero = document.getElementById('conductor-genero').value;

    if (!tipoIdent || !nui || !nombres || !apellidos || !telefono || !genero) {
        showNotification('warning', 'Campos incompletos', 'Por favor complete todos los campos requeridos:\n- Tipo de Identificación\n- Número de Identificación\n- Nombres\n- Apellidos\n- Teléfono\n- Género');
        return;
    }

    // Validar número de identificación según el tipo seleccionado
    const tipoIdentSelect = document.getElementById('conductor-tipo-ident');
    const tipoIdentText = tipoIdentSelect.options[tipoIdentSelect.selectedIndex].text;

    const validationError = validateIdentificationNumber(tipoIdentText, nui);
    if (validationError) {
        showNotification('error', 'Número de identificación inválido', validationError);
        return;
    }

    // Validar número de teléfono
    const phoneValidationError = validatePhoneNumber(telefono);
    if (phoneValidationError) {
        showNotification('error', 'Número de teléfono inválido', phoneValidationError);
        return;
    }

    // Datos de persona
    const personaData = {
        tipo_ident_id: tipoIdent,
        nui: nui,
        name: nombres,
        last_name: apellidos,
        phone_number: telefono,
        gender: genero
    };

    if (editingId) {
        // Modo edición: actualizar persona existente
        const conductor = await apiGet(`/conductores/${editingId}`);
        if (!conductor?.data?.persona_id) return;

        const personaResult = await apiPut(`/personas/${conductor.data.persona_id}`, personaData);
        if (personaResult) {
            showNotification('success', '¡Éxito!', 'Conductor actualizado exitosamente');
            document.getElementById('modal-conductor').style.display = 'none';
            editingId = null;
            loadConductores();
        }
    } else {
        // Modo creación: crear persona y luego conductor
        const personaResult = await apiPost('/personas', personaData);
        if (!personaResult) return;

        const conductorData = {
            persona_id: personaResult.data.id
        };

        const conductorResult = await apiPost('/conductores', conductorData);
        if (conductorResult) {
            showNotification('success', '¡Éxito!', 'Conductor creado exitosamente');
            document.getElementById('modal-conductor').style.display = 'none';
            loadConductores();
        }
    }
}

// Eliminar conductor
async function deleteConductor(id) {
    showConfirm(
        'Eliminar Conductor',
        '¿Estás seguro que deseas eliminar este conductor?',
        async () => {
            const result = await apiDelete(`/conductores/${id}`);
            if (result) {
                showNotification('success', '¡Éxito!', 'Conductor eliminado');
                loadConductores();
            }
        }
    );
}

// Editar conductor
async function editConductor(id) {
    const response = await apiGet(`/conductores/${id}?include=persona`);
    const conductor = response?.data;
    if (!conductor || !conductor.persona) return;

    editingId = id;
    document.querySelector('#modal-conductor .modal-title').textContent = 'Editar Conductor';

    // Cargar tipos de identificación
    const tiposIdent = await apiGet('/tipo_ident');
    const selectTipo = document.getElementById('conductor-tipo-ident');
    selectTipo.innerHTML = '<option value="">Seleccione</option>';

    const tiposData = normalizeList(tiposIdent);
    // Filtrar solo: Cédula de Ciudadanía, Cédula de Extranjería y Registro Civil
    const tiposPermitidos = ['CÉDULA DE CIUDADANÍA', 'CÉDULA DE EXTRANJERÍA', 'REGISTRO CIVIL'];
    const tiposFiltrados = tiposData.filter(t => t && t.descripcion && tiposPermitidos.includes(t.descripcion.toUpperCase()));

    tiposFiltrados.forEach(t => {
        selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
    });

    // Rellenar formulario con datos de la persona
    const persona = conductor.persona;
    document.getElementById('conductor-tipo-ident').value = persona.tipo_ident_id || '';
    document.getElementById('conductor-nui').value = persona.nui || '';
    document.getElementById('conductor-nombres').value = persona.name || '';
    document.getElementById('conductor-apellidos').value = persona.last_name || '';
    document.getElementById('conductor-telefono').value = persona.phone_number || '';
    document.getElementById('conductor-genero').value = persona.gender || '';

    document.getElementById('modal-conductor').style.display = 'flex';
}// ==========================
// 3. GESTIÓN DE LICENCIAS
// ==========================
async function loadLicencias() {
    // Cargar licencias
    const response = await apiGet('/conductores-licencias?include=conductor,licencia');
    const licencias = normalizeList(response);

    console.log('=== LOAD LICENCIAS ===');
    console.log('Respuesta cruda:', response);
    console.log('Licencias normalizadas:', licencias);

    if (licencias.length === 0) {
        document.getElementById('licencias-table').innerHTML = '<div style="padding: 2rem; text-align: center; color: #999;">No hay licencias registradas aún.</div>';
        return;
    }

    // Cargar datos de categorías, restricciones y documentos (primera página)
    const categoriasResp = await apiGet('/categorias_licencia');
    const restriccionesResp = await apiGet('/restriccion_lic');
    const documentosResp = await apiGet('/documentos');
    // Cargar conductores con persona para fallback de nombres/iniciales
    const conductoresResp = await apiGet('/conductores?include=persona');

    const categorias = normalizeList(categoriasResp);
    const restricciones = normalizeList(restriccionesResp);
    const documentos = normalizeList(documentosResp);
    const conductoresLista = normalizeList(conductoresResp);

    const conductorPersonaMap = {};
    conductoresLista.forEach(c => { if (c.persona) conductorPersonaMap[c.id] = c.persona; });

    // Construir mapas iniciales
    const categoriasMap = {};
    const restriccionesMap = {};
    const documentosMap = {};
    categorias.forEach(c => { categoriasMap[c.id] = c.nombre || c.descripcion || 'N/A'; });
    restricciones.forEach(r => { restriccionesMap[r.id] = r.descripcion || 'Sin restricciones'; });
    documentos.forEach(d => { documentosMap[d.id] = d; });

    // Detectar documentos faltantes referenciados por licencias
    const missingDocIds = [];
    licencias.forEach(l => {
        if (l.licencia && l.licencia.documento_id && !documentosMap[l.licencia.documento_id]) {
            missingDocIds.push(l.licencia.documento_id);
        }
    });
    const uniqueMissing = [...new Set(missingDocIds)];
    if (uniqueMissing.length) {
        console.log('Documentos faltantes, cargando por ID:', uniqueMissing);
        for (const id of uniqueMissing) {
            try {
                const r = await apiGet(`/documentos/${id}`);
                if (r && r.data) {
                    documentosMap[id] = r.data;
                } else {
                    console.warn('Documento no encontrado (ID):', id, r);
                }
            } catch (e) {
                console.warn('Error cargando documento ID', id, e);
            }
        }
    }

    console.log('Categorías map:', categoriasMap);
    console.log('Restricciones map:', restriccionesMap);
    console.log('Documentos map (incluyendo faltantes):', documentosMap);
    console.log('Total documentos en mapa:', Object.keys(documentosMap).length);

    // (Mapas ya construidos arriba)

    let html = '<div class="licencias-grid">';

    licencias.forEach((l, index) => {
        try {
            // Obtener datos del conductor
            let nombreCompleto = 'Conductor';
            let iniciales = 'NA';

            if (l.conductor) {
                const conductor = l.conductor;
                let persona = conductor.persona;
                if (!persona && conductorPersonaMap[conductor.id]) {
                    persona = conductorPersonaMap[conductor.id];
                }
                if (persona) {
                    const firstName = (persona.name || persona.nombres || '').trim();
                    const lastName = (persona.last_name || persona.apellidos || '').trim();
                    nombreCompleto = `${firstName} ${lastName}`.trim() || 'Conductor';
                    const fnInitial = firstName ? firstName.split(/\s+/)[0].charAt(0) : 'N';
                    const lnInitial = lastName ? lastName.split(/\s+/).slice(-1)[0].charAt(0) : 'A';
                    iniciales = `${fnInitial}${lnInitial}`.toUpperCase();
                }
            }

            // Obtener datos de la licencia
            let numero = 'N/A';
            let categoria = 'N/A';
            let restriccion = 'Sin restricciones';
            if (l.licencia) {
                const lic = l.licencia;
                const docId = lic.documento_id;
                if (docId && documentosMap[docId]) {
                    const doc = documentosMap[docId];
                    if (doc.observaciones) {
                        const match = doc.observaciones.match(/Licencia #(\S+)/);
                        if (match) numero = match[1];
                    }
                } else {
                    console.log('Documento aún no disponible para ID:', docId);
                }
                if (numero === 'N/A' && lic.numero) {
                    numero = lic.numero; // fallback (por si en el futuro se agrega en la tabla)
                }
                if (lic.categoria_lic_id) {
                    categoria = categoriasMap[lic.categoria_lic_id] || 'N/A';
                }
                if (lic.restriccion_lic_id) {
                    restriccion = restriccionesMap[lic.restriccion_lic_id] || 'Sin restricciones';
                }
            }

            console.log(`Licencia ${index}:`, {nombreCompleto, numero, categoria, restriccion});

            // Determinar si la licencia está vencida
            let estadoColor = '#10b981';
            let estadoTexto = 'VIGENTE';

            html += `
                <div class="licencia-card" data-licencia-id="${l.id}">
                    <div class="licencia-card-header">
                        <div class="licencia-avatar">
                            ${iniciales}
                        </div>
                        <div class="licencia-card-title">
                            <h4>${nombreCompleto}</h4>
                            <span class="licencia-badge">Licencia #${numero}</span>
                        </div>
                        <div class="licencia-estado" style="background: ${estadoColor};">
                            ${estadoTexto}
                        </div>
                    </div>

                    <div class="licencia-card-body">
                        <div class="licencia-info-row">
                            <span class="info-label">Categoría:</span>
                            <span class="info-value">${categoria}</span>
                        </div>
                        <div class="licencia-info-row">
                            <span class="info-label">Restricción:</span>
                            <span class="info-value">${restriccion}</span>
                        </div>
                    </div>

                    <div class="licencia-card-footer">
                        <button class="btn-delete btn-sm" onclick="deleteLicencia(${l.id})" title="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;">
                                <path d="M6 7h12" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                                <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`Error procesando licencia ${index}:`, error, l);
        }
    });

    html += '</div>';
    document.getElementById('licencias-table').innerHTML = html;
}


// Eliminar asignación de licencia
window.deleteLicencia = async function(id) {
    showConfirm(
        'Eliminar Asignación',
        '¿Estás seguro que deseas eliminar esta asignación de licencia?',
        async () => {
            const result = await apiDelete(`/conductores-licencias/${id}`);
            if (result) {
                showNotification('success', '¡Éxito!', 'Asignación eliminada');
                loadLicencias();
            }
        }
    );
};

// ==========================
// 4. GESTIÓN DE VEHÍCULOS
// ==========================
async function loadVehiculos() {
    const response = await apiGet('/vehiculos?include=tipo,propietario.documento');
    const vehiculos = normalizeList(response);

    if (vehiculos.length === 0) {
        document.getElementById('vehiculos-table').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #6b7280;">
                <svg style="width: 64px; height: 64px; margin: 0 auto 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <p style="font-size: 1.1rem; font-weight: 500;">No hay vehículos registrados</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Comienza agregando tu primer vehículo a la flota</p>
            </div>
        `;
        return;
    }

    let html = '<div class="vehiculos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem;">';

    vehiculos.forEach((v) => {
        const tipo = v.tipo?.descripcion || 'Sin tipo';

        // Extraer nombre del propietario
        let nombrePropietario = 'Sin propietario';
        if (v.propietario && v.propietario.documento && v.propietario.documento.observaciones) {
            const obs = v.propietario.documento.observaciones;
            const match = obs.match(/Propietario:\s*([^-]+)/);
            if (match && match[1]) {
                nombrePropietario = match[1].trim();
            } else {
                nombrePropietario = `Propietario #${v.propietario_id}`;
            }
        } else if (v.propietario_id) {
            nombrePropietario = `Propietario #${v.propietario_id}`;
        }

        const enServicio = v.servicio ? 'Sí' : 'No';
        const estadoColor = v.servicio ? '#10b981' : '#6b7280';
        const estadoIcon = v.servicio ? '✓' : '✕';

        // Icono según el tipo de vehículo
        let vehiculoIcon = '🚗';
        if (tipo.toLowerCase().includes('bus')) vehiculoIcon = '🚌';
        else if (tipo.toLowerCase().includes('micro')) vehiculoIcon = '🚐';
        else if (tipo.toLowerCase().includes('taxi')) vehiculoIcon = '🚕';
        else if (tipo.toLowerCase().includes('moto')) vehiculoIcon = '🏍️';
        else if (tipo.toLowerCase().includes('camion')) vehiculoIcon = '🚚';

        html += `
            <div class="vehiculo-card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="font-size: 2.5rem; line-height: 1;">${vehiculoIcon}</div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: #1f2937; letter-spacing: 0.5px;">${v.placa || 'N/A'}</div>
                            <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">${tipo}</div>
                        </div>
                    </div>
                    <div style="background: ${estadoColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">
                        <span>${estadoIcon}</span>
                        <span>${enServicio}</span>
                    </div>
                </div>

                <div style="display: grid; gap: 0.75rem; margin-bottom: 1.25rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Marca
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${v.marca || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Modelo
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${v.modelo || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            Color
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${v.color || '#ccc'}; border: 2px solid #e5e7eb;"></span>
                            ${v.color || 'N/A'}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Propietario
                        </span>
                        <span style="color: #1f2937; font-weight: 600; font-size: 0.875rem;">${nombrePropietario}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editVehiculo(${v.id})" class="btn-edit btn-sm" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:18px; height:18px;">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" />
                            <path d="M13.5 6.5l4 4" />
                        </svg>
                        Editar
                    </button>
                    <button onclick="deleteVehiculo(${v.id})" class="btn-delete btn-sm" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;">
                            <path d="M6 7h12" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                            <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    document.getElementById('vehiculos-table').innerHTML = html;
}

// Eliminar vehículo
window.deleteVehiculo = async function(id) {
    showConfirm(
        'Eliminar Vehículo',
        '¿Estás seguro que deseas eliminar este vehículo?',
        async () => {
            const result = await apiDelete(`/vehiculos/${id}`);
            if (result) {
                showNotification('success', '¡Éxito!', 'Vehículo eliminado');
                loadVehiculos();
            }
        }
    );
};

// Editar vehículo
window.editVehiculo = async function(id) {
    const response = await apiGet(`/vehiculos/${id}`);
    const vehiculo = response?.data;
    if (!vehiculo) return;

    editingId = id;
    document.querySelector('#modal-vehiculo .modal-title').textContent = 'Editar Vehículo';

    // Cargar selects
    const tiposVeh = await apiGet('/tipo-vehiculo');
    const selectTipo = document.getElementById('vehiculo-tipo');
    selectTipo.innerHTML = '<option value="">Seleccione</option>';

    const tiposVehData = normalizeList(tiposVeh);
    tiposVehData.forEach(t => {
        selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
    });

    const propietarios = await apiGet('/propietarios?include=documento');
    const selectProp = document.getElementById('vehiculo-propietario');
    selectProp.innerHTML = '<option value="">Seleccione</option>';

    const propietariosData = normalizeList(propietarios);

    if (propietariosData.length === 0) {
        selectProp.innerHTML += `<option value="" disabled>No hay propietarios registrados</option>`;
    } else {
        propietariosData.forEach(p => {
            // Extraer nombre del propietario de las observaciones del documento
            let nombrePropietario = `Propietario #${p.id}`;

            if (p.documento && p.documento.observaciones) {
                const obs = p.documento.observaciones;
                const match = obs.match(/Propietario:\s*([^-]+)/);
                if (match && match[1]) {
                    nombrePropietario = match[1].trim();
                }
            }

            selectProp.innerHTML += `<option value="${p.id}">${nombrePropietario}</option>`;
        });
    }

    // Rellenar formulario
    document.getElementById('vehiculo-placa').value = vehiculo.placa || '';
    document.getElementById('vehiculo-tipo').value = vehiculo.tipo_veh_id || '';
    document.getElementById('vehiculo-propietario').value = vehiculo.propietario_id || '';
    document.getElementById('vehiculo-modelo').value = vehiculo.modelo || '';
    document.getElementById('vehiculo-marca').value = vehiculo.marca || '';
    document.getElementById('vehiculo-color').value = vehiculo.color || '';
    document.getElementById('vehiculo-servicio').value = vehiculo.servicio ? '1' : '0';

    document.getElementById('modal-vehiculo').style.display = 'flex';
};

// ==========================
// 5. GESTIÓN DE RUTAS
// ==========================
async function loadRutas() {
    const response = await apiGet('/rutas');
    const rutas = normalizeList(response);
    const container = document.getElementById('rutas-table');
    if (!container) return;

    if (rutas.length === 0) {
        container.innerHTML = '<p style="margin-top:1rem;color:#6b7280;">No hay rutas registradas todavía.</p>';
        return;
    }

    let html = '<div class="rutas-grid">';
    rutas.forEach(r => {
        const codigo = r.codigo || r.code || '';
        const nombre = r.nombre || r.name || '';
        const descripcion = r.descripcion || r.description || '';
        const empresa = (r.empresa && (r.empresa.nombre || r.empresa.name)) || r.empresa_nombre || r.empresa_id || '';
        const fileName = r.file_name || r.fileName || '';
        const extension = fileName ? fileName.split('.').pop().toUpperCase() : '';
        const created = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';

        html += `<div class="ruta-card">
            <div class="ruta-card-header">
                <span class="ruta-code ${codigo ? '' : 'ruta-code-empty'}">${codigo || 'Sin Código'}</span>
                <span class="ruta-ext ${extension ? '' : 'ruta-ext-empty'}">${extension || 'FILE'}</span>
            </div>
            <h4 class="ruta-name">${nombre || 'Sin Nombre'}</h4>
            <p class="ruta-desc">${descripcion || 'Sin descripción'}</p>
            <div class="ruta-meta">
                <span><strong>Empresa:</strong> ${empresa || 'No asociada'}</span>
                <span><strong>Creada:</strong> ${created || '—'}</span>
            </div>
            <div class="ruta-actions">
                <div class="ruta-actions-row">
                    <button class="ruta-btn ruta-btn--edit" aria-label="Editar ruta" data-id="${r.id}" data-action="edit" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 20h4l10.142-10.142a1.5 1.5 0 000-2.121L15.263 4.857a1.5 1.5 0 00-2.121 0L3 15.999V20Z" />
                            <path d="M13.5 6.5l4 4" />
                        </svg>
                        Editar
                    </button>
                    <button class="ruta-btn ruta-btn--delete" aria-label="Eliminar ruta" data-id="${r.id}" data-action="delete" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 7h12" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
                            <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                        </svg>
                        Eliminar
                    </button>
                </div>
                ${fileName ? `<button class="ruta-btn ruta-btn--download" aria-label="Descargar ruta" data-id="${r.id}" data-action="download" title="Descargar archivo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 17.5C4 16.672 4.672 16 5.5 16h13c.828 0 1.5.672 1.5 1.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5Z" />
                        <path d="M12 3v11" />
                        <path d="M8 10.5l4 3.5 4-3.5" />
                    </svg>
                    Descargar
                </button>` : ''}
            </div>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    // Delegar acciones de descarga/eliminación
    container.querySelectorAll('.ruta-actions button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const action = e.currentTarget.getAttribute('data-action');
            if (action === 'delete') {
                deleteRuta(parseInt(id,10));
            } else if (action === 'download') {
                downloadRuta(id);
            } else if (action === 'edit') {
                openEditRuta(id);
            }
        });
    });
}

// Descargar archivo de ruta usando fetch con Authorization
async function downloadRuta(id){
    try {
        const token = localStorage.getItem('auth_token');
        const resp = await fetch(`/api/rutas/${id}/file`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!resp.ok) {
            showNotification('error', 'Descarga falló', 'Servidor retornó error');
            return;
        }
        const blob = await resp.blob();
        // Intentar obtener nombre del header Content-Disposition
        let fileName = 'ruta';
        const cd = resp.headers.get('Content-Disposition');
        if (cd) {
            const match = cd.match(/filename="?([^";]+)"?/);
            if (match) fileName = match[1];
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        showNotification('error', 'Descarga falló', 'No se pudo descargar el archivo');
    }
}

// Abrir modal en modo edición
async function openEditRuta(id){
    try {
        const dataResp = await apiGet(`/rutas/${id}`);
        const ruta = dataResp?.data || dataResp; // según formato de apiGet
        if (!ruta) {
            showNotification('error', 'No encontrada', 'No se pudo cargar la ruta');
            return;
        }
        openModalRuta(); // inicializa
        document.getElementById('ruta-edit-id').value = id;
        document.getElementById('ruta-nombre').value = ruta.name || ruta.nombre || '';
        document.getElementById('ruta-modal-title').textContent = 'Editar Ruta';
        document.getElementById('ruta-submit-btn').textContent = 'Actualizar';
        const currentFileEl = document.getElementById('ruta-current-file');
        currentFileEl.style.display = 'block';
        currentFileEl.textContent = `Archivo actual: ${(ruta.file_name || '').split('/').pop()}`;
        document.getElementById('ruta-file-help').textContent = 'Seleccione el nuevo archivo (obligatorio para actualizar).';
    } catch (err) {
        showNotification('error', 'Error', 'No se pudo abrir la edición');
    }
}

// Eliminar ruta
window.deleteRuta = async function(id) {
    showConfirm(
        'Eliminar Ruta',
        '¿Estás seguro que deseas eliminar esta ruta?',
        async () => {
            const result = await apiDelete(`/rutas/${id}`);
            if (result) {
                showNotification('success', '¡Éxito!', 'Ruta eliminada');
                loadRutas();
            }
        }
    );
};

// ==========================
// 6. ASIGNACIONES VEH-RUTA
// ==========================
async function loadAsignaciones() {
    const response = await apiGet('/seguim-estado-veh');
    const asignaciones = normalizeList(response);

    if (asignaciones.length === 0) {
        document.getElementById('asignaciones-table').innerHTML = '';
        return;
    }

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Vehículo</th><th>Ruta</th><th>Kilometraje</th><th>Fecha/Hora</th><th>Usuario</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';
    asignaciones.forEach(a => {
        html += `<tr>
            <td>${a.vehiculo?.placa || 'N/A'}</td>
            <td>${a.ruta?.nombre || 'N/A'}</td>
            <td>${a.kilometraje || 'N/A'}</td>
            <td>${a.fecha_hora || 'N/A'}</td>
            <td>${a.usuario?.name || 'N/A'}</td>
            <td>
                <button class="btn-delete" onclick="deleteAsignacion(${a.id})">Eliminar</button>
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('asignaciones-table').innerHTML = html;
}

// Eliminar asignación
window.deleteAsignacion = async function(id) {
    showConfirm(
        'Eliminar Asignación',
        '¿Estás seguro que deseas eliminar esta asignación?',
        async () => {
            const result = await apiDelete(`/seguim-estado-veh/${id}`);
            if (result) {
                showNotification('success', '¡Éxito!', 'Asignación eliminada');
                loadAsignaciones();
            }
        }
    );
};

// ==========================
// INICIALIZACIÓN
// ==========================

// Reemplazar menú inmediatamente para evitar ver el menú por defecto
if (document.readyState === 'loading') {
    // Si el DOM aún no está listo, esperar al DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    // Si el DOM ya está listo, ejecutar inmediatamente
    initDashboard();
}

function initDashboard() {
    console.log('=== INIT DASHBOARD EMPRESA ===');
    console.log('DOM Ready:', document.readyState);

    // Intentar precargar empresa_id si no existe
    (async () => {
        if (!localStorage.getItem('empresa_id')) {
            try {
                const empresasResp = await apiGet('/empresas');
                const empresasData = normalizeList(empresasResp);
                if (empresasData.length > 0) {
                    localStorage.setItem('empresa_id', empresasData[0].id);
                    console.log('empresa_id precargado:', empresasData[0].id);
                } else {
                    console.warn('No se encontró empresa para precargar empresa_id');
                }
            } catch (err) {
                console.error('Error precargando empresa_id:', err);
            }
        }
    })();

    buildEmpresaMenu();
    setupEventListeners(); // Configurar todos los event listeners

    console.log('Botones después de setupEventListeners:', {
        conductor: document.getElementById('btn-add-conductor'),
        vehiculo: document.getElementById('btn-add-vehiculo'),
        ruta: document.getElementById('btn-add-ruta'),
        licencia: document.getElementById('btn-add-licencia'),
        asignacion: document.getElementById('btn-add-asignacion')
    });

    // Vistas válidas para este dashboard
    const validViews = ['dashboard', 'conductores', 'licencias', 'vehiculos', 'rutas', 'asignaciones', 'informes'];

    // Cargar vista inicial
    let hash = window.location.hash.substring(1);

    // Si el hash no es válido, redirigir a dashboard
    if (!validViews.includes(hash)) {
        hash = 'dashboard';
        window.location.hash = 'dashboard';
    }

    navigateTo(hash);

    // Listener para cambios en hash
    window.addEventListener('hashchange', () => {
        let view = window.location.hash.substring(1);

        // Validar vista
        if (!validViews.includes(view)) {
            view = 'dashboard';
            window.location.hash = 'dashboard';
        }

        navigateTo(view);
    });
}

// ==========================
// FUNCIONES DE MODALES
// ==========================

// --- LICENCIAS ---
async function openModalLicencia() {
    document.getElementById('form-licencia').reset();

    // Cargar conductores con incluye persona
    const conductores = await apiGet('/conductores?include=persona');
    const selectCond = document.getElementById('licencia-conductor');
    selectCond.innerHTML = '<option value="">Seleccione</option>';

    const conductoresData = normalizeList(conductores);
    console.log('Conductores para licencia:', conductoresData);
    conductoresData.forEach(c => {
        const persona = c.persona || {};
        const nombre = persona.name || '';
        const apellido = persona.last_name || '';
        const nombreCompleto = `${nombre} ${apellido}`.trim();
        if (nombreCompleto) {
            selectCond.innerHTML += `<option value="${c.id}">${nombreCompleto}</option>`;
        }
    });

    // Cargar categorías
    const categorias = await apiGet('/categorias_licencia');
    const selectCat = document.getElementById('licencia-categoria');
    selectCat.innerHTML = '<option value="">Seleccione</option>';

    const categoriasData = normalizeList(categorias);
    categoriasData.forEach(cat => {
        selectCat.innerHTML += `<option value="${cat.id}">${cat.descripcion}</option>`;
    });

    // Cargar restricciones
    const restricciones = await apiGet('/restriccion_lic');
    const selectRest = document.getElementById('licencia-restriccion');
    selectRest.innerHTML = '<option value="">Seleccione</option>';

    const restriccionesData = normalizeList(restricciones);
    restriccionesData.forEach(r => {
        selectRest.innerHTML += `<option value="${r.id}">${r.descripcion}</option>`;
    });

    document.getElementById('modal-licencia').style.display = 'flex';
}

async function saveLicencia(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const conductorId = document.getElementById('licencia-conductor').value;
    const categoriaId = document.getElementById('licencia-categoria').value;
    const restriccionId = document.getElementById('licencia-restriccion').value;
    const numero = document.getElementById('licencia-numero').value;
    const archivo = document.getElementById('licencia-archivo').files[0];

    // Validar campos requeridos
    if (!conductorId || !categoriaId || !restriccionId || !numero || !archivo) {
        showNotification('warning', 'Campos incompletos', 'Por favor complete todos los campos requeridos, incluyendo el archivo de licencia.');
        return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (archivo.size > maxSize) {
        showNotification('error', 'Archivo muy grande', 'El archivo no debe superar 10MB.');
        return;
    }

    try {
        // Paso 1: Crear el documento con el archivo del usuario
        const formData = new FormData();
        formData.append('file', archivo);
        formData.append('observaciones', `Licencia #${numero} - Conductor ID: ${conductorId}`);
        formData.append('tipo_doc_id', 1); // tipo_doc_id para licencia

        console.log('Creando documento con archivo:', archivo.name);
        const documentoResult = await apiPostFile('/documentos', formData);
        if (!documentoResult || !documentoResult.data) {
            showNotification('error', 'Error al crear documento', 'No se pudo guardar el archivo de licencia.');
            console.error('Respuesta documento:', documentoResult);
            return;
        }

        const documentoId = documentoResult.data.id;
        console.log('Documento creado con ID:', documentoId);

        // Paso 2: Crear la licencia
        const licenciaData = {
            numero: numero,
            categoria_lic_id: categoriaId,
            restriccion_lic_id: restriccionId,
            documento_id: documentoId
        };

        console.log('Creando licencia:', licenciaData);
        const licenciaResult = await apiPost('/licencias', licenciaData);
        if (!licenciaResult || !licenciaResult.data) {
            showNotification('error', 'Error al crear licencia', 'No se pudo crear la licencia.');
            console.error('Respuesta licencia:', licenciaResult);
            return;
        }

        const licenciaId = licenciaResult.data.id;
        console.log('Licencia creada con ID:', licenciaId);

        // Paso 3: Crear la asignación conductor-licencia
        const asignacionData = {
            conductor_id: conductorId,
            licencia_id: licenciaId
        };

        console.log('Creando asignación:', asignacionData);
        const asignacionResult = await apiPost('/conductores-licencias', asignacionData);
        if (!asignacionResult) {
            showNotification('error', 'Error al asignar', 'No se pudo asignar la licencia al conductor.');
            console.error('Respuesta asignación:', asignacionResult);
            return;
        }

        // Éxito
        showNotification('success', '¡Éxito!', 'Licencia asignada exitosamente al conductor.');
        document.getElementById('modal-licencia').style.display = 'none';
        loadLicencias();

    } catch (error) {
        console.error('Error en saveLicencia:', error);
        showNotification('error', 'Error', 'Ocurrió un error al asignar la licencia: ' + error.message);
    }
}

// --- VEHÍCULOS ---
async function openModalVehiculo() {
    editingId = null;
    document.getElementById('form-vehiculo').reset();
    document.querySelector('#modal-vehiculo .modal-title').textContent = 'Agregar Vehículo';

    // Cargar tipos de vehículo
    const tiposVeh = await apiGet('/tipo-vehiculo');
    const selectTipo = document.getElementById('vehiculo-tipo');
    selectTipo.innerHTML = '<option value="">Seleccione</option>';

    const tiposVehData = normalizeList(tiposVeh);
    tiposVehData.forEach(t => {
        selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
    });

    // Cargar propietarios
    const propietarios = await apiGet('/propietarios?include=documento');
    const selectProp = document.getElementById('vehiculo-propietario');
    selectProp.innerHTML = '<option value="">Seleccione</option>';

    const propietariosData = normalizeList(propietarios);
    console.log('Propietarios cargados:', propietariosData);

    if (propietariosData.length === 0) {
        selectProp.innerHTML += `<option value="" disabled>No hay propietarios registrados</option>`;
    } else {
        propietariosData.forEach(p => {
            // Extraer nombre del propietario de las observaciones del documento
            let nombrePropietario = `Propietario #${p.id}`;

            if (p.documento && p.documento.observaciones) {
                const obs = p.documento.observaciones;
                // Buscar el patrón "Propietario: [Nombre]"
                const match = obs.match(/Propietario:\s*([^-]+)/);
                if (match && match[1]) {
                    nombrePropietario = match[1].trim();
                }
            }

            selectProp.innerHTML += `<option value="${p.id}">${nombrePropietario}</option>`;
        });
    }

    // Agregar event listener para validación de placa en tiempo real
    document.getElementById('vehiculo-placa').addEventListener('input', updatePlacaValidationMessage);

    document.getElementById('modal-vehiculo').style.display = 'flex';
}

async function saveVehiculo(e) {
    e.preventDefault();

    const placa = document.getElementById('vehiculo-placa').value.toUpperCase().trim();

    // Validar formato de placa antes de enviar
    const placaError = validatePlaca(placa);
    if (placaError) {
        showNotification('error', 'Placa inválida', placaError);
        return;
    }

    const vehiculoData = {
        placa: placa,
        tipo_veh_id: document.getElementById('vehiculo-tipo').value,
        propietario_id: document.getElementById('vehiculo-propietario').value,
        modelo: document.getElementById('vehiculo-modelo').value,
        marca: document.getElementById('vehiculo-marca').value,
        color: document.getElementById('vehiculo-color').value,
        servicio: document.getElementById('vehiculo-servicio').value === '1'
    };

    let result;
    if (editingId) {
        result = await apiPut(`/vehiculos/${editingId}`, vehiculoData);
    } else {
        result = await apiPost('/vehiculos', vehiculoData);
    }

    if (result) {
        showNotification('success', '¡Éxito!', 'Vehículo guardado exitosamente');
        document.getElementById('modal-vehiculo').style.display = 'none';
        loadVehiculos();
    }
}

// --- RUTAS ---
function openModalRuta() {
    const form = document.getElementById('form-ruta');
    form.reset();
    // Prellenar empresa id oculto
    const empresaId = localStorage.getItem('empresa_id');
    if (empresaId) {
        const hiddenEmpresa = document.getElementById('ruta-empresa-id');
        if (hiddenEmpresa) hiddenEmpresa.value = empresaId;
    }
    document.getElementById('ruta-edit-id').value = '';
    document.getElementById('ruta-modal-title').textContent = 'Agregar Ruta';
    document.getElementById('ruta-submit-btn').textContent = 'Guardar';
    document.getElementById('ruta-current-file').style.display = 'none';
    document.getElementById('ruta-file-help').textContent = 'Formato requerido. El backend exige este archivo.';
    document.getElementById('modal-ruta').style.display = 'flex';
}

async function saveRuta(e) {
    e.preventDefault();

    const nombre = document.getElementById('ruta-nombre').value.trim();
    const fileInput = document.getElementById('ruta-file');
    let empresaId = document.getElementById('ruta-empresa-id').value || localStorage.getItem('empresa_id');
    const editId = document.getElementById('ruta-edit-id').value;

    if (!nombre) {
        showNotification('warning', 'Nombre requerido', 'Debe ingresar el nombre de la ruta.');
        return;
    }
    if (!fileInput || fileInput.files.length === 0) {
        showNotification('warning', 'Archivo requerido', 'Debe adjuntar el archivo de la ruta.');
        return;
    }
    if (!empresaId) {
        showNotification('error', 'Sin empresa', 'No se pudo determinar la empresa asociada.');
        return;
    }

    const formData = new FormData();
    // Campos requeridos según backend
    formData.append('name', nombre); // backend espera 'name'
    formData.append('empresa_id', empresaId);
    formData.append('file', fileInput.files[0]); // backend espera 'file'

    let result;
    if (editId) {
        result = await apiPostFile(`/rutas/${editId}`, formData);
    } else {
        result = await apiPostFile('/rutas', formData);
    }

    if (result && result.status !== false) {
        showNotification('success', '¡Éxito!', editId ? 'Ruta actualizada' : 'Ruta creada exitosamente');
        document.getElementById('modal-ruta').style.display = 'none';
        loadRutas && loadRutas();
        return;
    }

    if (result && result.errors) {
        const messages = Object.values(result.errors).flat().join('\n');
        showNotification('error', 'Error de validación', messages);
        return;
    }

    showNotification('error', 'Error', 'No se pudo crear la ruta.');
}

// --- ASIGNACIONES ---
async function openModalAsignacion() {
    document.getElementById('form-asignacion').reset();

    // Cargar vehículos
    const vehiculos = await apiGet('/vehiculos');
    const selectVeh = document.getElementById('asignacion-vehiculo');
    selectVeh.innerHTML = '<option value="">Seleccione</option>';

    const vehiculosData = normalizeList(vehiculos);
    vehiculosData.forEach(v => {
        selectVeh.innerHTML += `<option value="${v.id}">${v.placa}</option>`;
    });

    // Cargar rutas
    const rutas = await apiGet('/rutas');
    const selectRuta = document.getElementById('asignacion-ruta');
    selectRuta.innerHTML = '<option value="">Seleccione</option>';

    const rutasData = normalizeList(rutas);
    rutasData.forEach(r => {
        selectRuta.innerHTML += `<option value="${r.id}">${r.nombre}</option>`;
    });

    // Establecer fecha y hora actuales por defecto
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0,5);
    document.getElementById('asignacion-fecha').value = today;
    document.getElementById('asignacion-hora').value = time;

    document.getElementById('modal-asignacion').style.display = 'flex';
}

async function saveAsignacion(e) {
    e.preventDefault();

    // Obtener el usuario_id del localStorage
    const userIdStr = localStorage.getItem('user_id') || localStorage.getItem('id');
    if (!userIdStr) {
        showNotification('error', 'Error', 'No se pudo obtener el ID del usuario');
        return;
    }

    const asignacionData = {
        vehiculo_id: document.getElementById('asignacion-vehiculo').value,
        ruta_id: document.getElementById('asignacion-ruta').value,
        usuario_id: parseInt(userIdStr),
        kilometraje: document.getElementById('asignacion-kilometraje').value || null,
        fecha_hora: document.getElementById('asignacion-fecha').value ? document.getElementById('asignacion-fecha').value + ' ' + (document.getElementById('asignacion-hora').value || '00:00:00') : null,
        observaciones: document.getElementById('asignacion-observaciones').value || null
    };

    const result = await apiPost('/seguim-estado-veh', asignacionData);
    if (result) {
        showNotification('success', '¡Éxito!', 'Asignación creada exitosamente');
        document.getElementById('modal-asignacion').style.display = 'none';
        loadAsignaciones();
    }
}

// --- INFORMES ---
let informeConductoresCache = { conductores: [], licencias: [] };
let informeVehiculosRutaCache = { asignaciones: [] };

function exportCSV(filename, rows) {
    if (!rows || !rows.length) return;
    const csvContent = rows.map(r => r.map(v => '"' + (v ?? '') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

function buildResumenConductores() {
    const { conductores, licencias } = informeConductoresCache;
    const totalConductores = conductores.length;
    const licenciasPorConductor = new Map();
    licencias.forEach(l => {
        const arr = licenciasPorConductor.get(l.conductor_id) || []; arr.push(l); licenciasPorConductor.set(l.conductor_id, arr);
    });
    let conLicencia = 0, sinLicencia = 0, vigentes = 0, vencidas = 0;
    const hoy = new Date();
    conductores.forEach(c => {
        const lista = licenciasPorConductor.get(c.id) || [];
        if (lista.length === 0) { sinLicencia++; } else {
            conLicencia++;
            lista.forEach(l => {
                const lic = l.licencia || {}; const fecha = lic.fecha_vencimiento ? new Date(lic.fecha_vencimiento) : null;
                if (fecha && fecha < hoy) vencidas++; else if (fecha) vigentes++;
            });
        }
    });
    return { totalConductores, conLicencia, sinLicencia, vigentes, vencidas };
}

function renderTablaConductores(filtroEstado = 'todos', filtroCategoria = 'todas') {
    const { conductores, licencias } = informeConductoresCache;
    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Conductor</th><th>Identificación</th><th>Licencia Nº</th><th>Categoría</th><th>Vencimiento</th><th>Estado</th>';
    html += '</tr></thead><tbody>';
    let added = 0;
    const hoy = new Date();
    conductores.forEach(c => {
        const persona = c.persona || {}; const licCond = licencias.filter(l => l.conductor_id === c.id);
        if (licCond.length === 0) {
            if (filtroEstado === 'sin' || filtroEstado === 'todos') {
                html += `<tr class="row-sin">
                    <td>${persona.name} ${persona.last_name}</td>
                    <td>${persona.nui}</td>
                    <td colspan="4" class="text-center"><span class="badge badge-error">Sin licencia</span></td>
                </tr>`;
                added++;
            }
        } else {
            licCond.forEach(l => {
                const lic = l.licencia || {}; const fecha = lic.fecha_vencimiento ? new Date(lic.fecha_vencimiento) : null;
                const estado = fecha && fecha < hoy ? 'vencida' : 'vigente';
                if (filtroEstado !== 'todos' && filtroEstado !== estado) return;
                const categoria = lic.categoria_licencia?.nombre || 'N/A';
                if (filtroCategoria !== 'todas' && filtroCategoria !== categoria) return;
                html += `<tr>
                    <td>${persona.name} ${persona.last_name}</td>
                    <td>${persona.nui}</td>
                    <td>${lic.numero || 'N/A'}</td>
                    <td>${categoria}</td>
                    <td>${lic.fecha_vencimiento || 'N/A'}</td>
                    <td><span class="badge ${estado === 'vigente' ? 'badge-success' : 'badge-error'}">${estado}</span></td>
                </tr>`;
                added++;
            });
        }
    });
    if (added === 0) {
        html += `<tr><td colspan="6" class="text-center" style="font-weight:600; color:#64748b;">No hay registros (verifica filtros o que existan conductores)</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
}

async function loadInformeConductores() {
    const conductoresResp = await apiGet('/conductores');
    const licenciasResp = await apiGet('/conductores-licencias');

    // Normalización flexible para distintos formatos de respuesta
    const normalizeList = (resp) => {
        if (!resp) return [];
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp.data)) return resp.data; // Laravel Resource
        if (resp.data && Array.isArray(resp.data.data)) return resp.data.data; // Paginación
        // Buscar primera propiedad que sea array
        for (const k of Object.keys(resp)) {
            if (Array.isArray(resp[k])) return resp[k];
        }
        return [];
    };

    const conductoresList = normalizeList(conductoresResp);
    const licenciasList = normalizeList(licenciasResp);

    informeConductoresCache.conductores = conductoresList;
    informeConductoresCache.licencias = licenciasList;

    console.log('[DEBUG informe conductores] rawConductores:', conductoresResp);
    console.log('[DEBUG informe conductores] rawLicencias:', licenciasResp);
    console.log('[DEBUG informe conductores] normalized lengths:', {
        conductores: conductoresList.length,
        licencias: licenciasList.length
    });

    // Si ambas respuestas son null probablemente 401 (ver consola). Mostrar mensaje amigable.
    if (!conductoresResp && !licenciasResp) {
        document.getElementById('informe-result').innerHTML = `
            <div class="informe-error auth-error" style="padding:1rem 1.25rem; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; color:#991b1b; font-size:.85rem; font-weight:500;">
                No se pudieron cargar los datos (401 Unauthorized). Inicia sesión nuevamente o verifica que el token esté en localStorage bajo <code>auth_token</code>.
            </div>
        `;
        return; // abortar resto
    }

    const resumen = buildResumenConductores();
    // Obtener lista de categorías únicas
    const categoriasSet = new Set();
    informeConductoresCache.licencias.forEach((l, idx) => {
        // Tomar distintos caminos posibles según estructura real
        const lic = l.licencia || l; // a veces podría venir plano
        const nombre = lic?.categoria_licencia?.nombre || lic?.categoria?.nombre || lic?.categoria_licencia || lic?.categoria;
        if (nombre && typeof nombre === 'string') categoriasSet.add(nombre.trim());
        if (idx < 3) {
            console.log('[DEBUG categoria licencia] registro', idx, {
                original: l,
                extraido: nombre
            });
        }
    });
    if (categoriasSet.size === 0) {
        console.warn('No se detectaron categorías de licencia. Revisa estructura de /conductores-licencias');
    }
    const categorias = Array.from(categoriasSet).sort();

    let controls = `<div class="informe-controls">
        <div class="resumen-grid resumen-grid-enhanced">
            <div class="resumen-item resumen-item--total">
                <div class="resumen-icon">
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 00-3-3.85'/><path d='M16 3.13a4 4 0 010 7.75'/></svg>
                </div><div class="resumen-text"><span>Total Conductores</span><strong>${resumen.totalConductores}</strong></div>
            </div>
            <div class="resumen-item resumen-item--lic">
                <div class="resumen-icon">
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M3 4h18v4H3z'/><path d='M8 4v4'/><path d='M3 8l2 12h14l2-12'/><path d='M10 12h4'/></svg>
                </div><div class="resumen-text"><span>Con Licencia</span><strong>${resumen.conLicencia}</strong></div>
            </div>
            <div class="resumen-item resumen-item--sin">
                <div class="resumen-icon">
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><circle cx='12' cy='12' r='10'/><path d='M8 12h8'/></svg>
                </div><div class="resumen-text"><span>Sin Licencia</span><strong>${resumen.sinLicencia}</strong></div>
            </div>
            <div class="resumen-item resumen-item--vig">
                <div class="resumen-icon">
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/><path d='M9.5 11.5l2 2 3-3'/></svg>
                </div><div class="resumen-text"><span>Licencias Vigentes</span><strong>${resumen.vigentes}</strong></div>
            </div>
            <div class="resumen-item resumen-item--ven">
                <div class="resumen-icon">
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>
                </div><div class="resumen-text"><span>Licencias Vencidas</span><strong>${resumen.vencidas}</strong></div>
            </div>
        </div>
        <div class="filtros-grid filtros-grid-enhanced">
            <div class="filtro-group">
                <label for='filtro-estado-lic' class='filtro-label'>Estado</label>
                <select id="filtro-estado-lic" class="filtro-select filtro-select--wide">
                    <option value="todos">Todos</option>
                    <option value="vigente">Vigente</option>
                    <option value="vencida">Vencida</option>
                    <option value="sin">Sin licencia</option>
                </select>
            </div>
            <div class="filtro-group">
                <label for='filtro-categoria-lic' class='filtro-label'>Categoría</label>
                <select id="filtro-categoria-lic" class="filtro-select filtro-select--wide">
                    <option value="todas">Todas</option>
                    ${categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="export-buttons">
                <button id="btn-export-conductores" class="btn-export btn-export--primary"><svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M4 17.5C4 16.672 4.672 16 5.5 16h13c.828 0 1.5.672 1.5 1.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5Z'/><path d='M12 3v11'/><path d='M8 10.5l4 3.5 4-3.5'/></svg> Exportar CSV</button>
            </div>
        </div>
    </div>`;

    const tabla = `<div class="tabla-wrapper">${renderTablaConductores()}</div>`;
    const html = '<h3 class="informe-title">Informe: Conductores y Licencias</h3>' + controls + tabla;
    const cont = document.getElementById('informe-result');
    cont.innerHTML = html;

    document.getElementById('filtro-estado-lic').addEventListener('change', () => {
        const estado = document.getElementById('filtro-estado-lic').value;
        const categoria = document.getElementById('filtro-categoria-lic').value;
        cont.querySelector('table').outerHTML = renderTablaConductores(estado, categoria);
    });
    document.getElementById('filtro-categoria-lic').addEventListener('change', () => {
        const estado = document.getElementById('filtro-estado-lic').value;
        const categoria = document.getElementById('filtro-categoria-lic').value;
        cont.querySelector('table').outerHTML = renderTablaConductores(estado, categoria);
    });
    document.getElementById('btn-export-conductores').addEventListener('click', () => {
        // Re-render filtered table to rows
        const estado = document.getElementById('filtro-estado-lic').value;
        const categoria = document.getElementById('filtro-categoria-lic').value;
        // Build rows
        const hoy = new Date();
        const rows = [['Conductor','Identificación','Licencia Nº','Categoría','Vencimiento','Estado']];
        informeConductoresCache.conductores.forEach(c => {
            const persona = c.persona || {}; const licCond = informeConductoresCache.licencias.filter(l => l.conductor_id === c.id);
            if (licCond.length === 0) {
                if (estado === 'sin' || estado === 'todos') rows.push([`${persona.name} ${persona.last_name}`, persona.nui, '','', '', 'Sin licencia']);
            } else {
                licCond.forEach(l => {
                    const lic = l.licencia || {}; const fecha = lic.fecha_vencimiento ? new Date(lic.fecha_vencimiento) : null;
                    const est = fecha && fecha < hoy ? 'Vencida' : 'Vigente';
                    const estKey = est.toLowerCase();
                    const categoriaLic = lic.categoria_licencia?.nombre || 'N/A';
                    if ((estado === 'todos' || estado === estKey) && (categoria === 'todas' || categoria === categoriaLic)) {
                        rows.push([`${persona.name} ${persona.last_name}`, persona.nui, lic.numero || 'N/A', categoriaLic, lic.fecha_vencimiento || 'N/A', est]);
                    }
                });
            }
        });
        exportCSV('informe_conductores.csv', rows);
    });
}

function renderTablaVehiculosRutaDetalle() {
    const asignaciones = informeVehiculosRutaCache.asignaciones;
    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Ruta</th><th>Vehículo (Placa)</th><th>Tipo</th><th>Kilometraje</th><th>Fecha/Hora</th>';
    html += '</tr></thead><tbody>';
    if (asignaciones.length === 0) {
        html += '<tr><td colspan="5" class="text-center">No hay asignaciones registradas</td></n></tr>';
    } else {
        asignaciones.forEach(a => {
            const vehiculo = a.vehiculo || {}; const ruta = a.ruta || {};
            html += `<tr>
                <td>${ruta.nombre || 'N/A'}</td>
                <td>${vehiculo.placa || 'N/A'}</td>
                <td>${vehiculo.tipo?.nombre || 'N/A'}</td>
                <td>${a.kilometraje || 'N/A'}</td>
                <td>${a.fecha_hora || 'N/A'}</td>
            </tr>`;
        });
    }
    html += '</tbody></table>';
    return html;
}

async function loadInformeVehiculosRuta() {
    const asignacionesResp = await apiGet('/seguim-estado-veh');
    informeVehiculosRutaCache.asignaciones = asignacionesResp?.data || [];
    // Agregado por ruta
    const conteoPorRuta = new Map();
    informeVehiculosRutaCache.asignaciones.forEach(a => {
        const nombreRuta = a.ruta?.nombre || 'Sin nombre';
        conteoPorRuta.set(nombreRuta, (conteoPorRuta.get(nombreRuta) || 0) + 1);
    });
    const resumenRows = Array.from(conteoPorRuta.entries()).sort((a,b)=>b[1]-a[1]);
    let resumenHtml = '<table class="data-table"><thead><tr><th>Ruta</th><th>Vehículos Asignados</th></tr></thead><tbody>';
    if (resumenRows.length === 0) resumenHtml += '<tr><td colspan="2" class="text-center">Sin asignaciones</td></tr>';
    else resumenRows.forEach(([ruta, count]) => { resumenHtml += `<tr><td>${ruta}</td><td><span class="badge badge-info">${count}</span></td></tr>`; });
    resumenHtml += '</tbody></table>';

    const detalleHtml = renderTablaVehiculosRutaDetalle();
    const cont = document.getElementById('informe-result');
    cont.innerHTML = '<h3 class="font-semibold mb-3">Informe: Vehículos por Ruta</h3>'+
        '<div class="informe-controls"><div class="export-buttons"><button id="btn-export-vehiculos-ruta" class="btn-export">Exportar CSV</button></div></div>' +
        '<h4 class="mb-2 font-semibold">Resumen</h4>' + resumenHtml + '<h4 class="mt-6 mb-2 font-semibold">Detalle</h4>' + detalleHtml;

    document.getElementById('btn-export-vehiculos-ruta').addEventListener('click', () => {
        const rows = [['Ruta','Placa','Tipo','Kilometraje','Fecha/Hora']];
        informeVehiculosRutaCache.asignaciones.forEach(a => {
            rows.push([a.ruta?.nombre || 'N/A', a.vehiculo?.placa || 'N/A', a.vehiculo?.tipo?.nombre || 'N/A', a.kilometraje || '', a.fecha_hora || '']);
        });
        exportCSV('informe_vehiculos_ruta.csv', rows);
    });
}

// ==========================
// CONFIGURAR EVENT LISTENERS
// ==========================
function setupEventListeners() {
    console.log('=== SETUP EVENT LISTENERS CON DELEGACIÓN ===');

    // Usar delegación de eventos en el documento para capturar todos los clics
    // Esto funciona incluso si los elementos están ocultos o se agregan después
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Botón agregar conductor
        if (target.id === 'btn-add-conductor' || target.closest('#btn-add-conductor')) {
            e.preventDefault();
            console.log('Click en agregar conductor');
            openModalConductor();
        }

        // Botón agregar licencia
        if (target.id === 'btn-add-licencia' || target.closest('#btn-add-licencia')) {
            e.preventDefault();
            console.log('Click en agregar licencia');
            openModalLicencia();
        }

        // Botón agregar vehículo
        if (target.id === 'btn-add-vehiculo' || target.closest('#btn-add-vehiculo')) {
            e.preventDefault();
            console.log('Click en agregar vehículo');
            openModalVehiculo();
        }

        // Botón agregar ruta
        if (target.id === 'btn-add-ruta' || target.closest('#btn-add-ruta')) {
            e.preventDefault();
            console.log('Click en agregar ruta');
            openModalRuta();
        }

        // Botón agregar asignación
        if (target.id === 'btn-add-asignacion' || target.closest('#btn-add-asignacion')) {
            e.preventDefault();
            console.log('Click en agregar asignación');
            openModalAsignacion();
        }

        // Botones editar/eliminar conductores
        if (target.classList.contains('btn-edit-conductor')) {
            e.preventDefault();
            const conductorId = target.getAttribute('data-conductor-id');
            console.log('Click en editar conductor:', conductorId);
            editConductor(conductorId);
        }
        if (target.classList.contains('btn-delete-conductor')) {
            e.preventDefault();
            const conductorId = target.getAttribute('data-conductor-id');
            console.log('Click en eliminar conductor:', conductorId);
            deleteConductor(conductorId);
        }

        // Botones de cancelar modales
        if (target.id === 'btn-cancel-conductor' || target.closest('#btn-cancel-conductor')) {
            e.preventDefault();
            document.getElementById('modal-conductor').style.display = 'none';
        }
        if (target.id === 'btn-cancel-licencia' || target.closest('#btn-cancel-licencia')) {
            e.preventDefault();
            document.getElementById('modal-licencia').style.display = 'none';
        }
        if (target.id === 'btn-cancel-vehiculo' || target.closest('#btn-cancel-vehiculo')) {
            e.preventDefault();
            document.getElementById('modal-vehiculo').style.display = 'none';
        }
        if (target.id === 'btn-cancel-ruta' || target.closest('#btn-cancel-ruta')) {
            e.preventDefault();
            document.getElementById('modal-ruta').style.display = 'none';
        }
        if (target.id === 'btn-cancel-asignacion' || target.closest('#btn-cancel-asignacion')) {
            e.preventDefault();
            document.getElementById('modal-asignacion').style.display = 'none';
        }

        // Botones de informes
        if (target.id === 'btn-informe-conductores' || target.closest('#btn-informe-conductores')) {
            e.preventDefault();
            loadInformeConductores();
        }
        if (target.id === 'btn-informe-vehiculos-ruta' || target.closest('#btn-informe-vehiculos-ruta')) {
            e.preventDefault();
            loadInformeVehiculosRuta();
        }
    });

    // Event listeners para formularios (submit)
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'form-conductor') {
            e.preventDefault();
            saveConductor(e);
        }
        if (e.target.id === 'form-licencia') {
            e.preventDefault();
            saveLicencia(e);
        }
        if (e.target.id === 'form-vehiculo') {
            e.preventDefault();
            saveVehiculo(e);
        }
        if (e.target.id === 'form-ruta') {
            e.preventDefault();
            saveRuta(e);
        }
        if (e.target.id === 'form-asignacion') {
            e.preventDefault();
            saveAsignacion(e);
        }
    });

    console.log('✅ Event listeners con delegación configurados');
}
