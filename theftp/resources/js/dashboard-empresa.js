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
    `;

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const nav = sidebar.querySelector('nav');
        if (nav) nav.remove();
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
                    <button class="btn-edit btn-sm btn-edit-conductor" data-conductor-id="${c.id}">✏️ Editar</button>
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
// Abrir modal para agregar conductor
async function openModalConductor() {
    editingId = null;
    document.getElementById('form-conductor').reset();
    document.querySelector('#modal-conductor .modal-title').textContent = 'Agregar Conductor';

    // Cargar tipos de identificación
    const tiposIdent = await apiGet('/tipo_ident');
    console.log('Respuesta de tipo_ident:', tiposIdent);

    const selectTipo = document.getElementById('conductor-tipo-ident');
    selectTipo.innerHTML = '<option value="">Seleccione</option>';

    // Normalizar listado
    const tiposData = normalizeList(tiposIdent);

    // Filtrar solo: Cédula de Ciudadanía, Cédula de Extranjería y Registro Civil
    const tiposPermitidos = ['CÉDULA DE CIUDADANÍA', 'CÉDULA DE EXTRANJERÍA', 'REGISTRO CIVIL'];
    const tiposFiltrados = tiposData.filter(t => t && t.descripcion && tiposPermitidos.includes(t.descripcion.toUpperCase()));

    tiposFiltrados.forEach((t) => {
        if (t && t.id && t.descripcion) {
            selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
        }
    });

    // Agregar event listeners para validación en tiempo real
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
                        <button class="btn-delete btn-sm" onclick="deleteLicencia(${l.id})">🗑️ Eliminar</button>
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
    const response = await apiGet('/vehiculos');
    const vehiculos = normalizeList(response);

    if (vehiculos.length === 0) {
        document.getElementById('vehiculos-table').innerHTML = '';
        return;
    }

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Placa</th><th>Tipo</th><th>Marca</th><th>Modelo</th><th>Color</th><th>Propietario</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';
    vehiculos.forEach(v => {
        const propietario = v.propietario?.persona || {};
        html += `<tr>
            <td>${v.placa || 'N/A'}</td>
            <td>${v.tipo?.descripcion || 'N/A'}</td>
            <td>${v.marca || 'N/A'}</td>
            <td>${v.modelo || 'N/A'}</td>
            <td>${v.color || 'N/A'}</td>
            <td>${propietario.name || ''} ${propietario.last_name || ''}</td>
            <td>
                <button class="btn-edit" onclick="editVehiculo(${v.id})">Editar</button>
                <button class="btn-delete" onclick="deleteVehiculo(${v.id})">Eliminar</button>
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
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

    const propietarios = await apiGet('/propietarios?include=persona');
    const selectProp = document.getElementById('vehiculo-propietario');
    selectProp.innerHTML = '<option value="">Seleccione</option>';

    const propietariosData = normalizeList(propietarios);
    propietariosData.forEach(p => {
        const persona = p.persona || {};
        selectProp.innerHTML += `<option value="${p.id}">${persona.name} ${persona.last_name}</option>`;
    });

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

    if (rutas.length === 0) {
        document.getElementById('rutas-table').innerHTML = '';
        return;
    }

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>Código</th><th>Nombre</th><th>Descripción</th><th>Empresa</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';
    rutas.forEach(r => {
        html += `<tr>
            <td>${r.codigo || 'N/A'}</td>
            <td>${r.nombre || 'N/A'}</td>
            <td>${r.descripcion || 'N/A'}</td>
            <td>${r.empresa?.nombre || 'N/A'}</td>
            <td>
                <button class="btn-delete" onclick="deleteRuta(${r.id})">Eliminar</button>
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('rutas-table').innerHTML = html;
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
    const tiposVeh = await apiGet('/tipo_vehiculo');
    const selectTipo = document.getElementById('vehiculo-tipo');
    selectTipo.innerHTML = '<option value="">Seleccione</option>';

    const tiposVehData = normalizeList(tiposVeh);
    tiposVehData.forEach(t => {
        selectTipo.innerHTML += `<option value="${t.id}">${t.descripcion}</option>`;
    });

    // Cargar propietarios
    const propietarios = await apiGet('/propietarios?include=persona');
    const selectProp = document.getElementById('vehiculo-propietario');
    selectProp.innerHTML = '<option value="">Seleccione</option>';

    const propietariosData = normalizeList(propietarios);
    propietariosData.forEach(p => {
        const persona = p.persona || {};
        selectProp.innerHTML += `<option value="${p.id}">${persona.name} ${persona.last_name}</option>`;
    });

    document.getElementById('modal-vehiculo').style.display = 'flex';
}

async function saveVehiculo(e) {
    e.preventDefault();

    const vehiculoData = {
        placa: document.getElementById('vehiculo-placa').value,
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
    document.getElementById('form-ruta').reset();
    document.getElementById('modal-ruta').style.display = 'flex';
}

async function saveRuta(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('codigo', document.getElementById('ruta-codigo').value);
    formData.append('nombre', document.getElementById('ruta-nombre').value);
    formData.append('descripcion', document.getElementById('ruta-descripcion').value);

    const archivoInput = document.getElementById('ruta-archivo');
    if (archivoInput.files.length > 0) {
        formData.append('archivo', archivoInput.files[0]);
    }

    const result = await apiPostFile('/rutas', formData);
    if (result) {
        showNotification('success', '¡Éxito!', 'Ruta creada exitosamente');
        document.getElementById('modal-ruta').style.display = 'none';
        loadRutas();
    }
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
async function loadInformeConductores() {
    const conductores = await apiGet('/conductores');
    const licencias = await apiGet('/conductores-licencias');

    let html = '<h3 class="font-semibold mb-3">Informe: Conductores y Licencias</h3>';
    html += '<table class="data-table"><thead><tr>';
    html += '<th>Conductor</th><th>Identificación</th><th>Licencia Nº</th><th>Categoría</th><th>Vencimiento</th><th>Estado</th>';
    html += '</tr></thead><tbody>';

    const conductoresData = conductores?.data || [];
    const licenciasData = licencias?.data || [];

    conductoresData.forEach(c => {
        const persona = c.persona || {};
        const licenciasCond = licenciasData.filter(l => l.conductor_id === c.id);

        if (licenciasCond.length === 0) {
            html += `<tr>
                <td>${persona.name} ${persona.last_name}</td>
                <td>${persona.nui}</td>
                <td colspan="4" style="text-align:center; color: #dc2626;">Sin licencia asignada</td>
            </tr>`;
        } else {
            licenciasCond.forEach(l => {
                const lic = l.licencia || {};
                const vencimiento = new Date(lic.fecha_vencimiento);
                const hoy = new Date();
                const estado = vencimiento < hoy ? 'Vencida' : 'Vigente';
                const colorEstado = estado === 'Vigente' ? '#16a34a' : '#dc2626';

                html += `<tr>
                    <td>${persona.name} ${persona.last_name}</td>
                    <td>${persona.nui}</td>
                    <td>${lic.numero || 'N/A'}</td>
                    <td>${lic.categoria_licencia?.nombre || 'N/A'}</td>
                    <td>${lic.fecha_vencimiento || 'N/A'}</td>
                    <td style="color: ${colorEstado}; font-weight: 600;">${estado}</td>
                </tr>`;
            });
        }
    });

    html += '</tbody></table>';
    document.getElementById('informe-result').innerHTML = html;
}

async function loadInformeVehiculosRuta() {
    const asignaciones = await apiGet('/seguim-estado-veh');
    const asignacionesData = asignaciones?.data || [];

    let html = '<h3 class="font-semibold mb-3">Informe: Vehículos por Ruta</h3>';
    html += '<table class="data-table"><thead><tr>';
    html += '<th>Ruta</th><th>Vehículo (Placa)</th><th>Tipo</th><th>Kilometraje</th><th>Fecha/Hora</th>';
    html += '</tr></thead><tbody>';

    if (asignacionesData.length === 0) {
        html += '<tr><td colspan="5" style="text-align:center;">No hay asignaciones registradas</td></tr>';
    } else {
        asignacionesData.forEach(a => {
            const vehiculo = a.vehiculo || {};
            const ruta = a.ruta || {};
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
    document.getElementById('informe-result').innerHTML = html;
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
