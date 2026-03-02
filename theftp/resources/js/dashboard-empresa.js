// Dashboard Empresa - Gestión CRUD completa
// ===========================================
let currentView = 'dashboard';
let editingId = null; // Para edición de registros
let myEmpresaId = null;
// Función para obtener token de autorización
function getToken() {
  return localStorage.getItem('auth_token');
}

// Decodifica el payload de un JWT (sin verificar firma) y devuelve el objeto JSON
function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    // El payload está en la segunda parte (base64url)
    const payload = parts[1];
    // Convertir base64url a base64 estándar
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const jsonStr = atob(padded);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // Algunos servidores devuelven cadenas URI-encoded dentro del JWT
      return JSON.parse(decodeURIComponent(escape(jsonStr)));
    }
  } catch (err) {
    console.warn('decodeJwtPayload failed:', err);
    return null;
  }
}

// Intenta resolver el user id desde varias fuentes: localStorage keys, auth_user JSON, o el token JWT
function getUserId() {
  // Posibles claves donde se almacena el id directamente
  const keys = ['user_id', 'id', 'usuario_id'];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) {
      const n = parseInt(v, 10);
      if (!isNaN(n)) return n;
    }
  }
  
  // Algunas apps guardan el usuario completo en `auth_user` o `authUser`
  const userJsonKeys = ['auth_user', 'authUser', 'user', 'usuario'];
  for (const k of userJsonKeys) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj) {
          const cand = obj.id || obj.user_id || obj.usuario_id || obj.uid || obj.sub;
          const n = parseInt(cand, 10);
          if (!isNaN(n)) return n;
        }
      } catch (e) {
        // no es JSON, ignorar
      }
    }
  }
  
  // Como último recurso, intentar decodificar el token JWT y leer claims comunes
  const token = getToken();
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload) {
      const cand = payload.sub || payload.id || payload.user_id || payload.uid || payload.usuario_id;
      const n = parseInt(cand, 10);
      if (!isNaN(n)) return n;
    }
  }
  
  return null;
}

// Sistema de notificaciones en página
function showNotification(type, title, message, duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icons = {
    success: '✓'
    , error: '✕'
    , warning: '⚠'
    , info: 'ℹ'
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
} // Normaliza respuestas de listado (soporta estructuras paginadas)
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
      method: 'GET'
      , headers: {
        'Authorization': `Bearer ${token}`
        , 'Accept': 'application/json'
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
      method: 'POST'
      , headers: {
        'Authorization': `Bearer ${token}`
        , 'Accept': 'application/json'
        , 'Content-Type': 'application/json'
      }
      , body: JSON.stringify(data)
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
      method: 'POST'
      , headers: {
        'Authorization': `Bearer ${token}`
        , 'Accept': 'application/json'
        // NO incluir Content-Type, el navegador lo establece automáticamente con boundary
      }
      , body: formData
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
      method: 'PUT'
      , headers: {
        'Authorization': `Bearer ${token}`
        , 'Accept': 'application/json'
        , 'Content-Type': 'application/json'
      }
      , body: JSON.stringify(data)
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
      method: 'DELETE'
      , headers: {
        'Authorization': `Bearer ${token}`
        , 'Accept': 'application/json'
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
            <a href="#resoluciones" class="nav-link" data-view="resoluciones">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Resoluciones</span>
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
      'dashboard': 'Panel de Control'
      , 'conductores': 'Gestión de Conductores'
      , 'licencias': 'Gestión de Licencias'
      , 'vehiculos': 'Gestión de Vehículos'
      , 'rutas': 'Gestión de Rutas'
      , 'asignaciones': 'Asignación Vehículos a Rutas'
      , 'informes': 'Informes y Reportes'
    };
    const headerTitle = document.getElementById('header-title');
    if (headerTitle && titles[viewName]) {
      headerTitle.textContent = titles[viewName];
    }
    
    // Cargar datos según la vista
    switch (viewName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'conductores':
      loadConductores();
      break;
    case 'resoluciones':
      loadResoluciones();
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
  
  if (conductores.length > 0) {
    ('Primer conductor completo:', JSON.stringify(conductores[0], null, 2));
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
    
    (`Conductor ${index}: NUI=${nui}, Nombre=${nombreCompleto}, Telefono=${telefono}, Genero=${genero}, TipoIdent=${tipoIdentDesc}`);
    
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
  ('Respuesta de tipo_ident:', tiposIdent);
  
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
    tipo_ident_id: tipoIdent
    , nui: nui
    , name: nombres
    , last_name: apellidos
    , phone_number: telefono
    , gender: genero
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
    'Eliminar Conductor'
    , '¿Estás seguro que deseas eliminar este conductor?'
    , async () => {
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
} // ==========================
// 3. GESTIÓN DE LICENCIAS
// ==========================
async function loadLicencias() {
  // Cargar licencias
  const response = await apiGet('/conductores-licencias?include=conductor,licencia');
  const licencias = normalizeList(response);
  
  console.log('=== LOAD LICENCIAS ===');
  console.log('Respuesta cruda:', response);
  console.log('Licencias normalizadas:', licencias);
  
  // Cargar catálogos auxiliares
  const categoriasResp = await apiGet('/categorias_licencia');
  const restriccionesResp = await apiGet('/restriccion_lic');
  const documentosResp = await apiGet('/documentos');
  const conductoresResp = await apiGet('/conductores?include=persona');
  
  const categorias = normalizeList(categoriasResp);
  const restricciones = normalizeList(restriccionesResp);
  const documentos = normalizeList(documentosResp);
  const conductoresLista = normalizeList(conductoresResp);
  
  // Maps rápidos
  const categoriasMap = {};
  const restriccionesMap = {};
  const documentosMap = {};
  const conductorPersonaMap = {};
  
  categorias.forEach(c => {
    if (c && (c.id || c.categoria_id)) categoriasMap[c.id || c.categoria_id] = c;
  });
  restricciones.forEach(r => {
    if (r && (r.id || r.restriccion_lic_id)) restriccionesMap[r.id || r.restriccion_lic_id] = (r.descripcion || r.nombre || 'Sin restricciones');
  });
  documentos.forEach(d => {
    if (d && (d.id || d.documento_id)) documentosMap[d.id || d.documento_id] = d;
  });
  conductoresLista.forEach(c => {
    if (c && c.persona) conductorPersonaMap[c.id] = c.persona;
  });
  
  // Helper: resolve category display (prefer nombre/descripcion, not codigo)
  function resolveCategoria(lica, wrapper) {
    const cand = lica?.categoria || lica?.categoria_licencia || lica?.categoriaObj || null;
    if (cand) return cand.nombre || cand.descripcion || cand.codigo || (typeof cand === 'string' ? cand : null);
    const id = lica?.categoria_id || lica?.categoria_lic_id || lica?.categoriaLicId || wrapper?.categoria_id || wrapper?.categoria_lic_id || wrapper?.categoriaId || null;
    if (id && categoriasMap[id]) {
      const c = categoriasMap[id];
      return c.nombre || c.descripcion || c.codigo || String(id);
    }
    // try nested licencia
    const nestedId = (lica && lica.licencia && (lica.licencia.categoria_id || lica.licencia.categoria_lic_id)) || null;
    if (nestedId && categoriasMap[nestedId]) {
      const c = categoriasMap[nestedId];
      return c.nombre || c.descripcion || c.codigo || String(nestedId);
    }
    return null;
  }
  
  // Helper: resolve documento display (prefer numeric identifier fields)
  function resolveDocumentoText(doc) {
    if (!doc) return null;
    const candidates = [
      'numero', 'nro', 'numero_documento', 'nro_documento', 'numero_registro', 'numeroDocumento', 'nroDocumento', 'nui', 'numero_identificacion', 'identificacion'
    ];
    for (const k of candidates) {
      if (doc[k]) return String(doc[k]);
    }
    // fallback to nombre/descripcion/titulo
    return doc.nombre || doc.descripcion || doc.titulo || null;
  }
  
  // Si no hay licencias, mostrar mensaje simple
  if (!licencias || licencias.length === 0) {
    document.getElementById('licencias-table').innerHTML = `
            <div style="text-align:center; padding:2rem; color:#6b7280;">
                <p style="font-size:1.1rem; font-weight:500;">No hay asignaciones de licencias</p>
                <p style="font-size:0.9rem; margin-top:0.5rem;">Asigna licencias a conductores para verlas aquí</p>
            </div>
        `;
    return;
  }
  
  // Detectar documentos faltantes referenciados por licencias y cargarlos individualmente
  const missingDocIds = [];
  licencias.forEach(item => {
    const licObj = item.licencia || item;
    const docId = licObj && (licObj.documento_id || licObj.documentoId || licObj.documento);
    if (docId && !documentosMap[docId]) missingDocIds.push(docId);
  });
  const uniqueMissing = [...new Set(missingDocIds)];
  for (const id of uniqueMissing) {
    try {
      const r = await apiGet(`/documentos/${id}`);
      if (r && r.data) documentosMap[id] = r.data;
    } catch (e) {
      console.warn('Error cargando documento ID', id, e);
    }
  }
  
  let html = '<div class="licencias-grid">';
  
  licencias.forEach((l, index) => {
    try {
      // Nombre del conductor
      let nombreCompleto = 'Conductor';
      let iniciales = 'NA';
      if (l.conductor) {
        let persona = l.conductor.persona || conductorPersonaMap[l.conductor.id];
        if (persona) {
          const firstName = (persona.name || persona.nombres || '').trim();
          const lastName = (persona.last_name || persona.apellidos || '').trim();
          nombreCompleto = `${firstName} ${lastName}`.trim() || 'Conductor';
          const fnInitial = firstName ? firstName.split(/\s+/)[0].charAt(0) : 'N';
          const lnInitial = lastName ? lastName.split(/\s+/).slice(-1)[0].charAt(0) : 'A';
          iniciales = `${fnInitial}${lnInitial}`.toUpperCase();
        }
      }
      
      // Datos de la licencia
      const licObj = l.licencia || l;
      const numero = licObj.numero || licObj.numero_licencia || licObj.licencia_num || licObj.id || 'N/A';
      
      // Categoría
      let categoria = '—';
      const resolvedCat = resolveCategoria(licObj, l);
      if (resolvedCat) categoria = resolvedCat;
      
      // Debug: show what we found for category/document per licencia (print first 6)
      if (index < 6) console.debug('DEBUG licencia sample', {
        index
        , licObj
        , resolvedCat
        , categoria
      });
      
      // Restricción
      let restriccion = 'Sin restricciones';
      const restrId = licObj.restriccion_lic_id || licObj.restriccion_id || l.restriccion_lic_id || l.restriccion_id;
      if (restrId && restriccionesMap[restrId]) restriccion = restriccionesMap[restrId];
      
      // Documento - Número de identificación de la persona (NUI)
      let documentoText = '';
      
      // Primero intentamos obtener el NUI de la persona del conductor
      if (l.conductor) {
        let persona = l.conductor.persona || conductorPersonaMap[l.conductor.id];
        if (persona && persona.nui) {
          documentoText = String(persona.nui);
        }
      }
      
      // Si no encontramos el NUI, buscamos en el documento de la licencia
      if (!documentoText) {
        const rawDocRef = licObj.documento_id || licObj.documentoId || licObj.documento || l.documento_id || l.documento || null;
        let docEntry = null;
        if (rawDocRef && typeof rawDocRef === 'object') {
          // licencia.documento might already be an object
          docEntry = rawDocRef;
        } else if (rawDocRef) {
          // try by id or nested id
          const possibleId = (rawDocRef && rawDocRef.id) ? rawDocRef.id : rawDocRef;
          docEntry = documentosMap[possibleId] || documentosMap[rawDocRef] || null;
        }
        if (index < 6) console.debug('DEBUG documento lookup', {
          index
          , rawDocRef
          , docEntryFound: !!docEntry
          , docEntry
        });
        if (docEntry) {
          documentoText = resolveDocumentoText(docEntry) || '';
        }
      }
      
      // Fecha de expedición (si existe)
      const fechaExp = licObj.fecha_expedicion || licObj.fecha_exped || licObj.expedicion || l.fecha_expedicion || l.fecha_exped || null;
      
      // Estado (vencimiento simple: si existe fecha vencimiento compararla)
      let estadoColor = '#10b981';
      let estadoTexto = 'VIGENTE';
      // (no cambiar estado si no hay fecha de vencimiento)
      
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
                        <div class="licencia-info-row">
                            <span class="info-label">Documento:</span>
                            <span class="info-value">${documentoText || '—'}</span>
                        </div>
                        ${fechaExp ? `<div class="licencia-info-row"><span class="info-label">Fecha Expedición:</span><span class="info-value">${fechaExp}</span></div>` : ''}
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
window.deleteLicencia = async function (id) {
  showConfirm(
    'Eliminar Asignación'
    , '¿Estás seguro que deseas eliminar esta asignación de licencia?'
    , async () => {
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
  
  // Función para convertir nombres de colores en español a CSS
  function convertirColorEspanolACSS(colorNombre) {
    if (!colorNombre) return '#ccc';
    
    const coloresEspañol = {
      'rojo': '#dc2626'
      , 'azul': '#2563eb'
      , 'amarillo': '#eab308'
      , 'verde': '#16a34a'
      , 'blanco': '#ffffff'
      , 'negro': '#000000'
      , 'gris': '#6b7280'
      , 'naranja': '#ea580c'
      , 'morado': '#9333ea'
      , 'rosa': '#ec4899'
      , 'cafe': '#92400e'
      , 'café': '#92400e'
      , 'marron': '#92400e'
      , 'marrón': '#92400e'
      , 'plateado': '#d1d5db'
      , 'dorado': '#ca8a04'
      , 'celeste': '#38bdf8'
      , 'turquesa': '#14b8a6'
      , 'beige': '#d4c5b9'
      , 'crema': '#fef3c7'
    };
    
    const colorLower = colorNombre.toLowerCase().trim();
    
    // Si es un color válido en el mapa, retornarlo
    if (coloresEspañol[colorLower]) {
      return coloresEspañol[colorLower];
    }
    
    // Si ya es un código hex válido o un color CSS, retornarlo tal cual
    if (colorLower.startsWith('#') || colorLower.startsWith('rgb')) {
      return colorNombre;
    }
    
    // Colores en inglés que CSS entiende directamente
    const coloresIngles = ['red', 'blue', 'yellow', 'green', 'white', 'black', 'gray', 'orange', 'purple', 'pink', 'brown', 'silver', 'gold'];
    if (coloresIngles.includes(colorLower)) {
      return colorNombre;
    }
    
    // Si no coincide con nada, retornar gris por defecto
    return '#9ca3af';
  }
  
  let html = '<div class="vehiculos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1rem;">';
  
  vehiculos.forEach((v) => {
    const tipo = v.tipo?.descripcion || 'Sin tipo';
    
    // Convertir el color del vehículo a CSS válido
    const colorCSS = convertirColorEspanolACSS(v.color);
    
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
                            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${colorCSS}; border: 2px solid #e5e7eb;"></span>
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
window.deleteVehiculo = async function (id) {
  showConfirm(
    'Eliminar Vehículo'
    , '¿Estás seguro que deseas eliminar este vehículo?'
    , async () => {
      const result = await apiDelete(`/vehiculos/${id}`);
      if (result) {
        showNotification('success', '¡Éxito!', 'Vehículo eliminado');
        loadVehiculos();
      }
    }
  );
};

// Editar vehículo
window.editVehiculo = async function (id) {
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
//  GESTIÓN DE RESOLUCIONES (NUEVO MÓDULO)
// ==========================
async function loadResoluciones() {
  const container = document.getElementById('resoluciones-table');
  container.innerHTML = '<div class="loading-state" style="padding:2rem; text-align:center; color:#666;"><p>Buscando resoluciones...</p></div>';
  
  let endpoint = '/documentos?include=tipo_documento';
  let filtros = [];
  
  // Filtro 1: Que sea tipo "Resolución" (por palabra clave en observaciones, similar a secretaría)
  filtros.push({
    "column": "observaciones"
    , "operator": "like"
    , "value": "%Resolución%"
  });
  // FILTRO AUTOMÁTICO: Si tengo empresa ID, solo traigo las mías
  if (myEmpresaId) {
    const filtro = encodeURIComponent(JSON.stringify([{
      "column": "empresa_id"
      , "operator": "="
      , "value": myEmpresaId
    }]));
    endpoint += `&filter=${filtro}`;
  }
  // Filtro 2: Que sea para MI empresa
  if (myEmpresaId) {
    filtros.push({
      "column": "empresa_id"
      , "operator": "="
      , "value": myEmpresaId
    });
  }
  
  const filtroJson = encodeURIComponent(JSON.stringify(filtros));
  endpoint += `&filter=${filtroJson}`;
  
  const res = await apiGet(endpoint);
  const docs = normalizeList(res);
  
  if (docs.length === 0) {
    container.innerHTML = '<div style="padding:3rem; text-align:center; background:#f9fafb; border-radius:8px; color:#6b7280;"><p>No tienes resoluciones asignadas actualmente.</p></div>';
    return;
  }
  
  let html = `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
        <thead style="background:#f3f4f6; border-bottom:2px solid #e5e7eb;">
            <tr>
                <th style="padding:1rem; text-align:left;">ID</th>
                <th style="padding:1rem; text-align:left;">Asunto / Detalle</th>
                <th style="padding:1rem; text-align:left;">Fecha</th>
                <th style="padding:1rem; text-align:left;">Archivo</th>
            </tr>
        </thead>
        <tbody>`;
  
  docs.forEach(d => {
    const fecha = d.created_at ? new Date(d.created_at).toLocaleDateString() : '-';
    
    html += `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:1rem;">#${d.id}</td>
            <td style="padding:1rem; font-weight:500;">${d.observaciones || 'Sin asunto'}</td>
            <td style="padding:1rem;">${fecha}</td>
            <td style="padding:1rem;">
                <button onclick="downloadDocumento(${d.id})" style="color:#2563eb; background:none; border:none; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:5px;">
                    <svg style="width:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar PDF
                </button>
            </td>
        </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Función para descargar PDF (Resoluciones)
window.downloadDocumento = async function (id) {
  showNotification('info', 'Descargando', 'Obteniendo documento...');
  const token = getToken();
  try {
    const response = await fetch(`/api/documentos/${id}/file`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Archivo no disponible");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (e) {
    showNotification('error', 'Error', 'No se pudo descargar el documento.');
  }
};
// ==========================
// 5. GESTIÓN DE RUTAS
// ==========================
async function loadRutas() {
  const container = document.getElementById('rutas-table');
  container.innerHTML = '<p class="text-center py-4 text-gray-500">Cargando rutas de la empresa...</p>';
  
  let endpoint = '/rutas?include=empresa';
  
  // FILTRO AUTOMÁTICO: Si tengo empresa ID, solo traigo las mías
  if (myEmpresaId) {
    const filtro = encodeURIComponent(JSON.stringify([{
      "column": "empresa_id"
      , "operator": "="
      , "value": myEmpresaId
    }]));
    endpoint += `&filter=${filtro}`;
  }
  
  const response = await apiGet(endpoint);
  const rutas = normalizeList(response);
  
  if (rutas.length === 0) {
    container.innerHTML = '<div class="text-center py-8 bg-gray-50 rounded text-gray-500">No tienes rutas registradas.</div>';
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
                ${codigo ? `<span class="ruta-code">${codigo}</span>` : ''}
                <span class="ruta-ext ${extension ? '' : 'ruta-ext-empty'}">${extension || 'FILE'}</span>
            </div>
            <h4 class="ruta-name">${nombre || 'Sin Nombre'}</h4>
            ${descripcion ? `<p class="ruta-desc">${descripcion}</p>` : ''}
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
        deleteRuta(parseInt(id, 10));
      } else if (action === 'download') {
        downloadRuta(id);
      } else if (action === 'edit') {
        openEditRuta(id);
      }
    });
  });
}

// Descargar archivo de ruta usando fetch con Authorization
async function downloadRuta(id) {
  try {
    const token = localStorage.getItem('auth_token');
    const resp = await fetch(`/api/rutas/${id}/file`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
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
async function openEditRuta(id) {
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
window.deleteRuta = async function (id) {
  showConfirm(
    'Eliminar Ruta'
    , '¿Estás seguro que deseas eliminar esta ruta?'
    , async () => {
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
  
  // Detectar si la API devolvió objetos anidados o solo IDs
  const needsVehiculoMap = asignaciones.some(a => !(a.vehiculo && a.vehiculo.placa));
  const needsRutaMap = asignaciones.some(a => !(a.ruta && (a.ruta.nombre || a.ruta.name)));
  const needsUsuarioMap = asignaciones.some(a => !(a.usuario && (a.usuario.name || a.usuario.nombre)));
  
  // Mapas por id
  const vehiculoMap = new Map(); // id -> placa
  const rutaMap = new Map(); // id -> nombre
  const usuarioMap = new Map(); // id -> nombre
  
  // Cargar catálogos solo si es necesario
  try {
    if (needsVehiculoMap) {
      const vehResp = await apiGet('/vehiculos');
      const vehiculos = normalizeList(vehResp);
      vehiculos.forEach(v => {
        if (v && v.id) vehiculoMap.set(v.id, v.placa || v.plate || v.placa);
      });
    }
  } catch (e) {
    console.debug('loadAsignaciones: no se pudo cargar vehiculos', e);
  }
  
  try {
    if (needsRutaMap) {
      const rutasResp = await apiGet('/rutas');
      const rutas = normalizeList(rutasResp);
      rutas.forEach(r => {
        if (r && r.id) rutaMap.set(r.id, r.nombre || r.name || r.title || `Ruta #${r.id}`);
      });
    }
  } catch (e) {
    console.debug('loadAsignaciones: no se pudo cargar rutas', e);
  }
  
  try {
    if (needsUsuarioMap) {
      // Intentar múltiples endpoints comunes para usuarios
      const userEndpoints = ['/users', '/usuarios', '/users?per_page=999', '/usuarios?per_page=999'];
      for (const ep of userEndpoints) {
        try {
          const uresp = await apiGet(ep);
          if (!uresp) continue;
          const users = normalizeList(uresp);
          if (users.length > 0) {
            users.forEach(u => {
              if (u && u.id) usuarioMap.set(u.id, u.name || u.nombre || u.email || `Usuario #${u.id}`);
            });
            break;
          }
        } catch (err) {
          // continuar intentando otros endpoints
        }
      }
    }
  } catch (e) {
    console.debug('loadAsignaciones: no se pudo cargar usuarios', e);
  }
  
  // Si aún faltan usuarios en el mapa, intentar solicitarlos por id individualmente
  try {
    // 1. Obtener IDs de usuario faltantes
    const missingUserIds = new Set();
    asignaciones.forEach(a => {
      const uid = a.usuario_id || (a.usuario && a.usuario.id) || null;
      if (uid && !usuarioMap.has(uid)) missingUserIds.add(uid);
    });
    
    // 2. Si hay IDs faltantes, consultarlos
    if (missingUserIds.size > 0) {
      for (const uid of missingUserIds) {
        
        // --- CORRECCIÓN APLICADA AQUÍ ---
        const tryPaths = [
          `/users/${uid}`, // <--- 1. Ruta correcta (Laravel standard)
          `/users/${uid}?include=persona`, // 2. Con datos de persona
          `/usuarios/${uid}`, // 3. Fallback (por si acaso)
          `/user/${uid}` // 4. Fallback
        ];
        
        let found = false;
        for (const p of tryPaths) {
          try {
            const r = await apiGet(p);
            if (!r) continue;
            
            const userObj = r.data || r;
            if (userObj && (userObj.id || userObj.user_id)) {
              const name = userObj.name || userObj.nombre || userObj.email || `Usuario #${uid}`;
              usuarioMap.set(Number(uid), name);
              found = true;
              break; // ¡Encontrado! Dejar de intentar otras rutas
            }
          } catch (err) {
            // Silenciar error 404 en consola si falla este intento
          }
        }
        
        // Si fallaron todas las rutas, poner nombre por defecto
        if (!found) {
          usuarioMap.set(Number(uid), `Usuario #${uid}`);
        }
      }
    }
  } catch (e) {
    console.debug('loadAsignaciones: error fetching users by id', e);
  }
  
  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Vehículo</th><th>Ruta</th><th>Kilometraje</th><th>Fecha/Hora</th><th>Usuario</th><th>Acciones</th>';
  html += '</tr></thead><tbody>';
  
  asignaciones.forEach(a => {
    // resolver placa
    let placa = 'N/A';
    if (a.vehiculo && a.vehiculo.placa) placa = a.vehiculo.placa;
    else if (a.vehiculo && a.vehiculo.id && vehiculoMap.has(a.vehiculo.id)) placa = vehiculoMap.get(a.vehiculo.id);
    else if (a.vehiculo_id && vehiculoMap.has(a.vehiculo_id)) placa = vehiculoMap.get(a.vehiculo_id);
    else if (typeof a.vehiculo === 'number' && vehiculoMap.has(a.vehiculo)) placa = vehiculoMap.get(a.vehiculo);
    
    // resolver ruta
    let rutaNombre = 'N/A';
    if (a.ruta && (a.ruta.nombre || a.ruta.name)) rutaNombre = a.ruta.nombre || a.ruta.name;
    else if (a.ruta_id && rutaMap.has(a.ruta_id)) rutaNombre = rutaMap.get(a.ruta_id);
    else if (a.ruta && a.ruta.id && rutaMap.has(a.ruta.id)) rutaNombre = rutaMap.get(a.ruta.id);
    else if (typeof a.ruta === 'number' && rutaMap.has(a.ruta)) rutaNombre = rutaMap.get(a.ruta);
    
    // resolver usuario
    let usuarioNombre = 'N/A';
    if (a.usuario && (a.usuario.name || a.usuario.nombre)) usuarioNombre = a.usuario.name || a.usuario.nombre;
    else if (a.usuario_id && usuarioMap.has(a.usuario_id)) usuarioNombre = usuarioMap.get(a.usuario_id);
    else if (a.usuario && a.usuario.id && usuarioMap.has(a.usuario.id)) usuarioNombre = usuarioMap.get(a.usuario.id);
    
    html += `<tr>\n            <td>${placa || 'N/A'}</td>\n            <td>${rutaNombre || 'N/A'}</td>\n            <td>${a.kilometraje || 'N/A'}</td>\n            <td>${a.fecha_hora || 'N/A'}</td>\n            <td>${usuarioNombre || 'N/A'}</td>\n            <td>\n                <button class="btn-delete" onclick="deleteAsignacion(${a.id})">Eliminar</button>\n            </td>\n        </tr>`;
  });
  
  html += '</tbody></table>';
  document.getElementById('asignaciones-table').innerHTML = html;
}

// Eliminar asignación
window.deleteAsignacion = async function (id) {
  showConfirm(
    'Eliminar Asignación'
    , '¿Estás seguro que deseas eliminar esta asignación?'
    , async () => {
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
async function initDashboard() {
  
  ('=== INIT DASHBOARD EMPRESA ===');
  
  let myEmpresaId = localStorage.getItem('user_empresa_id');
  const roleId = localStorage.getItem('user_role_id');
  
  // Seguridad: si es usuario empresa (role_id = 3) pero no tiene ID
  if (roleId === "3" && !myEmpresaId) {
    console.warn("Usuario empresa sin 'user_empresa_id' en localStorage. Intentando recuperar del backend...");
    
    try {
      const me = await apiGet('/api/auth/me');
      if (me.empresa_id) {
        myEmpresaId = me.empresa_id;
        localStorage.setItem('user_empresa_id', myEmpresaId);
        localStorage.setItem('empresa_id', myEmpresaId);
        ("empresa_id recuperado correctamente:", myEmpresaId);
      } else {
        console.error("El usuario no tiene empresa asignada en el backend.");
        alert("No tienes una empresa asignada. Contacta al administrador.");
        return;
      }
    } catch (err) {
      console.error("Error al recuperar datos del usuario:", err);
      alert("Error de sesión. Serás redirigido al login.");
      window.location.href = '/login';
      return;
    }
  }
  
  if (myEmpresaId && !localStorage.getItem('empresa_id')) {
    localStorage.setItem('empresa_id', myEmpresaId);
  }
  
  ('Empresa activa ID:', myEmpresaId);
  
  // Dejamos disponible globalmente (muy útil para listRutas(), listConductores(), etc.)
  window.getCurrentEmpresaId = () => myEmpresaId;
  
  buildEmpresaMenu();
  setupEventListeners();
  
  console.log('Botones después de setupEventListeners:', {
    conductor: document.getElementById('btn-add-conductor')
    , vehiculo: document.getElementById('btn-add-vehiculo')
    , ruta: document.getElementById('btn-add-ruta')
    , licencia: document.getElementById('btn-add-licencia')
    , asignacion: document.getElementById('btn-add-asignacion')
  });
  
  const validViews = ['dashboard', 'resoluciones', 'conductores', 'licencias', 'vehiculos', 'rutas', 'asignaciones', 'informes'];
  
  let hash = window.location.hash.substring(1) || 'dashboard';
  if (!validViews.includes(hash)) {
    hash = 'dashboard';
    window.location.hash = 'dashboard';
  }
  
  navigateTo(hash);
  
  window.addEventListener('hashchange', () => {
    let view = window.location.hash.substring(1) || 'dashboard';
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
  ('Conductores para licencia:', conductoresData);
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
      numero: numero
      , categoria_lic_id: categoriaId
      , restriccion_lic_id: restriccionId
      , documento_id: documentoId
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
      conductor_id: conductorId
      , licencia_id: licenciaId
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
    // Si la API devolvió el objeto creado, insertarlo en caché local para mostrarlo inmediatamente
    try {
      const created = asignacionResult.data || asignacionResult;
      const createdObj = (created && created.data) ? created.data : created;
      if (createdObj && window.informeConductoresCache && Array.isArray(informeConductoresCache.licencias)) {
        // evitar duplicados: comprobar por id
        const newId = createdObj.id || createdObj.conductores_licencia_id || createdObj.licencia_id;
        const exists = informeConductoresCache.licencias.some(x => (x.id || x.licencia_id) == newId);
        if (!exists) informeConductoresCache.licencias.unshift(createdObj);
      }
    } catch (e) {
      /* ignore */
    }
    
    // Recargar listas para garantizar consistencia (licencias y el informe de conductores)
    try {
      await loadLicencias();
    } catch (e) {
      console.warn('No se pudo recargar licencias inmediatamente', e);
    }
    try {
      await loadInformeConductores();
    } catch (e) {
      console.warn('No se pudo recargar informe de conductores inmediatamente', e);
    }
    
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
    placa: placa
    , tipo_veh_id: document.getElementById('vehiculo-tipo').value
    , propietario_id: document.getElementById('vehiculo-propietario').value
    , modelo: document.getElementById('vehiculo-modelo').value
    , marca: document.getElementById('vehiculo-marca').value
    , color: document.getElementById('vehiculo-color').value
    , servicio: document.getElementById('vehiculo-servicio').value === '1'
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
  
  // INYECCIÓN AUTOMÁTICA DE EMPRESA
  const hiddenEmpresa = document.getElementById('ruta-empresa-id');
  if (hiddenEmpresa) {
    if (myEmpresaId) {
      hiddenEmpresa.value = myEmpresaId;
    } else {
      // Fallback: Si no hay ID (por error), dejar que el backend falle o manejarlo
      console.error("No hay ID de empresa para asignar a la ruta.");
    }
  }
  
  document.getElementById('ruta-edit-id').value = '';
  document.getElementById('ruta-modal-title').textContent = 'Agregar Ruta';
  document.getElementById('ruta-submit-btn').textContent = 'Guardar';
  document.getElementById('ruta-current-file').style.display = 'none';
  document.getElementById('modal-ruta').style.display = 'flex';
}

async function saveRuta(e) {
  e.preventDefault();
  const nombre = document.getElementById('ruta-nombre').value.trim();
  const fileInput = document.getElementById('ruta-file');
  const editId = document.getElementById('ruta-edit-id').value;
  
  // Usar la variable global
  const empresaId = myEmpresaId || document.getElementById('ruta-empresa-id').value;
  
  if (!nombre) return showNotification('warning', 'Requerido', 'Nombre de ruta obligatorio.');
  if (!editId && (!fileInput || fileInput.files.length === 0)) return showNotification('warning', 'Requerido', 'Archivo obligatorio.');
  if (!empresaId) return showNotification('error', 'Error', 'No se identificó la empresa.');
  
  const formData = new FormData();
  formData.append('name', nombre);
  formData.append('empresa_id', empresaId); // Automático
  if (fileInput.files[0]) formData.append('file', fileInput.files[0]);
  
  let result;
  if (editId) {
    result = await apiPostFile(`/rutas/${editId}`, formData); // Tu backend usa POST para update con archivos
  } else {
    result = await apiPostFile('/rutas', formData);
  }
  
  if (result && result.status !== false) {
    showNotification('success', 'Éxito', 'Ruta guardada.');
    document.getElementById('modal-ruta').style.display = 'none';
    loadRutas();
  } else {
    showNotification('error', 'Error', 'No se pudo guardar.');
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
    // Algunos endpoints/dev DB usan 'name' en lugar de 'nombre'
    const label = (r && (r.nombre || r.name || r.nombre)) || (`Ruta #${r && r.id}`);
    selectRuta.innerHTML += `<option value="${r.id}">${label}</option>`;
  });
  
  // Establecer fecha y hora actuales por defecto
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  document.getElementById('asignacion-fecha').value = today;
  document.getElementById('asignacion-hora').value = time;
  
  // Mostrar info del usuario actual dentro del modal para mayor confianza
  try {
    const user = await resolveCurrentUser();
    const infoEl = document.getElementById('asignacion-usuario-info');
    if (infoEl) {
      if (user && (user.name || user.nombre || user.email || user.id)) {
        const displayName = user.name || user.nombre || user.email || `ID ${user.id}`;
        infoEl.textContent = `Asignando como: ${displayName}`;
        infoEl.style.display = 'block';
      } else {
        infoEl.style.display = 'none';
      }
    }
  } catch (e) {
    console.debug('openModalAsignacion: could not resolve user', e);
  }
  
  document.getElementById('modal-asignacion').style.display = 'flex';
}

// Resolver usuario actual (intenta cache local, luego endpoints comunes)
async function resolveCurrentUser() {
  // Revisar si hay un objeto auth_user en localStorage
  const possibleKeys = ['auth_user', 'authUser', 'user', 'usuario'];
  for (const k of possibleKeys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      if (obj && (obj.id || obj.name || obj.nombre)) return obj;
    } catch (e) {
      // no JSON, ignore
    }
  }
  
  // Try token decode
  const token = getToken();
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && (payload.sub || payload.id || payload.user_id)) {
      // Return minimal object
      return {
        id: payload.sub || payload.id || payload.user_id
        , name: payload.name || payload.nombre || null
      };
    }
  }
  
  // Fallback: ask the server via common endpoints
  const candidatePaths = ['/user', '/me', '/auth/user', '/auth/me', '/users/me'];
  for (const p of candidatePaths) {
    try {
      const r = await apiGet(p);
      if (!r) continue;
      const userObj = r.data || r;
      if (userObj && (userObj.id || userObj.user_id)) return userObj;
    } catch (e) {
      // ignore errors
    }
  }
  
  return null;
}

async function saveAsignacion(e) {
  e.preventDefault();
  
  // Intentar resolver el usuario primero desde localStorage/JWT
  let resolvedUserId = getUserId();
  console.debug('saveAsignacion: resolvedUserId (initial):', resolvedUserId);
  
  // Si no se resolvió, intentar pedir al backend el usuario actual en varios endpoints comunes
  if (!resolvedUserId) {
    showNotification('info', 'Obteniendo usuario', 'Intentando resolver usuario desde el servidor...');
    const candidatePaths = ['/user', '/me', '/auth/user', '/auth/me', '/users/me'];
    for (const p of candidatePaths) {
      try {
        const r = await apiGet(p);
        if (!r) continue;
        const userObj = r.data || r;
        if (userObj && (userObj.id || userObj.user_id || userObj.sub)) {
          resolvedUserId = parseInt(userObj.id || userObj.user_id || userObj.sub, 10);
          if (!isNaN(resolvedUserId)) {
            console.debug('saveAsignacion: resolvedUserId from API', p, resolvedUserId, userObj);
            break;
          }
        }
      } catch (err) {
        console.debug('saveAsignacion: apiGet failed for', p, err && err.message ? err.message : err);
      }
    }
  }
  
  if (!resolvedUserId) {
    // Registrar información útil en consola para depuración sin mostrar token en UI
    try {
      const lsKeys = Object.keys(localStorage || {}).slice(0, 200);
      const snapshot = {};
      lsKeys.forEach(k => {
        try {
          snapshot[k] = localStorage.getItem(k);
        } catch (e) {
          snapshot[k] = '[error]';
        }
      });
      console.debug('saveAsignacion: localStorage snapshot (safe):', snapshot);
    } catch (e) {
      console.debug('saveAsignacion: error reading localStorage snapshot', e);
    }
    
    try {
      const token = getToken();
      const payload = decodeJwtPayload(token);
      console.debug('saveAsignacion: decoded JWT payload:', payload);
    } catch (e) {
      console.debug('saveAsignacion: error decoding token', e);
    }
    
    showNotification('error', 'Error', 'No se pudo obtener el ID del usuario. Abre la consola (F12) y pega los logs para que lo revise.');
    return;
  }
  
  const asignacionData = {
    vehiculo_id: document.getElementById('asignacion-vehiculo').value
    , ruta_id: document.getElementById('asignacion-ruta').value
    , usuario_id: resolvedUserId
    , kilometraje: document.getElementById('asignacion-kilometraje').value || null
    , fecha_hora: document.getElementById('asignacion-fecha').value ? document.getElementById('asignacion-fecha').value + ' ' + (document.getElementById('asignacion-hora').value || '00:00:00') : null
    , observaciones: document.getElementById('asignacion-observaciones').value || null
  };
  
  const result = await apiPost('/seguim-estado-veh', asignacionData);
  if (result) {
    showNotification('success', '¡Éxito!', 'Asignación creada exitosamente');
    document.getElementById('modal-asignacion').style.display = 'none';
    loadAsignaciones();
  }
}

// --- INFORMES ---
let informeConductoresCache = {
  conductores: []
  , licencias: []
};
let licenciasDetallesMap = new Map(); // licencia_id -> detalle completo
let informeVehiculosRutaCache = {
  asignaciones: []
};
let informeAvailableFields = {
  numero: false
  , fecha: false
  , categoria: false
};
let informeRestriccionesMap = new Map();
let informeDocumentosMap = new Map();

function exportCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const csvContent = rows.map(r => r.map(v => '"' + (v ?? '') + '"').join(',')).join('\n');
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildResumenConductores() {
  const {
    conductores
    , licencias
  } = informeConductoresCache;
  const totalConductores = conductores.length;
  const licenciasPorConductor = new Map();
  licencias.forEach(l => {
    const cid = (l.conductor_id ?? l.conductorId ?? l.conductor?.id);
    const arr = licenciasPorConductor.get(cid) || [];
    arr.push(l);
    licenciasPorConductor.set(cid, arr);
  });
  let conLicencia = 0
    , sinLicencia = 0
    , vigentes = 0
    , vencidas = 0;
  const hoy = new Date();
  conductores.forEach(c => {
    const lista = licenciasPorConductor.get(c.id) || [];
    if (lista.length === 0) {
      sinLicencia++;
    } else {
      conLicencia++;
      lista.forEach(l => {
        const lic = l.licencia || l || {};
        const fecha = extractFechaVencimiento(lic);
        if (!fecha) return; // sin fecha no suma a vigentes/vencidas
        if (fecha < hoy) vencidas++;
        else vigentes++;
      });
    }
  });
  return {
    totalConductores
    , conLicencia
    , sinLicencia
    , vigentes
    , vencidas
  };
}
// Extrae numero y fecha de vencimiento buscando múltiples variantes de nombres
function extractNumeroLicencia(lic) {
  if (!lic || typeof lic !== 'object') return '—';
  // Buscar primero en el propio objeto
  const direct = lic.numero || lic.num_licencia || lic.numero_licencia || lic.nro || lic.num || lic.licencia_numero;
  if (direct) return direct;
  // Luego intentar catálogo
  const detalle = licenciasDetallesMap.get(lic.id || lic.licencia_id);
  if (detalle) {
    const detNum = detalle.numero || detalle.num_licencia || detalle.numero_licencia || detalle.nro || detalle.num || detalle.licencia_numero;
    if (detNum) return detNum;
  }
  // Como fallback mostrar id para tener algo visible
  const fallbackId = lic.licencia_id || lic.id;
  if (fallbackId) return fallbackId;
  // Búsqueda flexible
  for (const k of Object.keys(lic)) {
    const lower = k.toLowerCase();
    if (lower.includes('lic') && (lower.includes('num') || lower.includes('nro'))) {
      const val = lic[k];
      if (val) return val;
    }
    if ((lower === 'numero' || lower === 'num')) {
      const val = lic[k];
      if (val) return val;
    }
  }
  // Búsqueda profunda (documento, restriccion, etc.)
  const deep = deepSearch(lic, (key, val) => {
    if (val && typeof val === 'string') {
      const lk = key.toLowerCase();
      if ((lk.includes('lic') && (lk.includes('num') || lk.includes('nro'))) || lk === 'numero' || lk === 'num') return true;
    }
    return false;
  });
  if (deep) return deep;
  return '—';
}

function extractFechaVencimiento(lic) {
  if (!lic || typeof lic !== 'object') return null;
  const raw = lic.fecha_vencimiento || lic.vencimiento || lic.fecha_venc || lic.fec_venc || lic.expira || lic.expiracion;
  if (raw) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  // Intentar catálogo
  const detalle = licenciasDetallesMap.get(lic.id || lic.licencia_id);
  if (detalle) {
    const rawDet = detalle.fecha_vencimiento || detalle.vencimiento || detalle.fecha_venc || detalle.fec_venc || detalle.expira || detalle.expiracion;
    if (rawDet) {
      const d = new Date(rawDet);
      if (!isNaN(d.getTime())) return d;
    }
  }
  for (const k of Object.keys(lic)) {
    const lower = k.toLowerCase();
    if (lower.includes('venc') || lower.includes('expir')) {
      const val = lic[k];
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // Búsqueda profunda
  const deepDateStr = deepSearch(lic, (key, val) => {
    if (!val) return false;
    if (typeof val !== 'string') return false;
    const lk = key.toLowerCase();
    if (lk.includes('venc') || lk.includes('expir')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return true;
    }
    return false;
  });
  if (deepDateStr) {
    const d = new Date(deepDateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
// Búsqueda recursiva limitada para encontrar valores que cumplen un predicado
function deepSearch(obj, predicate, depth = 0, maxDepth = 4) {
  if (!obj || typeof obj !== 'object' || depth > maxDepth) return null;
  for (const [k, v] of Object.entries(obj)) {
    try {
      if (predicate(k, v)) return v;
    } catch (e) {
      /* ignorar */
    }
    if (v && typeof v === 'object') {
      const found = deepSearch(v, predicate, depth + 1, maxDepth);
      if (found) return found;
    }
  }
  return null;
}

function extractFechaVencimientoStr(lic) {
  const d = extractFechaVencimiento(lic);
  if (!d) return '—';
  // Formato AAAA-MM-DD
  return d.toISOString().slice(0, 10);
}

// Extrae fecha de expedición (si existe) buscando variantes comunes
function extractFechaExpedicion(lic) {
  if (!lic || typeof lic !== 'object') return null;
  const raw = lic.fecha_expedicion || lic.fecha_exped || lic.expedicion || lic.fecha_expe || lic.fecha_expedicion;
  if (raw) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  // Intentar catálogo
  const detalle = licenciasDetallesMap.get(lic.id || lic.licencia_id);
  if (detalle) {
    const rawDet = detalle.fecha_expedicion || detalle.fecha_exped || detalle.expedicion || detalle.fecha_expe;
    if (rawDet) {
      const d = new Date(rawDet);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // Búsqueda por claves que contengan 'exped'
  for (const k of Object.keys(lic)) {
    const lower = k.toLowerCase();
    if (lower.includes('exped')) {
      const val = lic[k];
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const deepDateStr = deepSearch(lic, (key, val) => {
    if (!val) return false;
    if (typeof val !== 'string') return false;
    const lk = key.toLowerCase();
    if (lk.includes('exped')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return true;
    }
    return false;
  });
  if (deepDateStr) {
    const d = new Date(deepDateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function extractFechaExpedicionStr(lic) {
  const d = extractFechaExpedicion(lic);
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

// Resolver detalle (restricción, documento, fecha) disponible globalmente
function resolveDetalleInfo(maybeLicObj, wrapperObj) {
  const result = {
    restrText: ''
    , docText: ''
    , fechaExp: '—'
  };
  if (!maybeLicObj && !wrapperObj) return result;
  
  let detKey = (maybeLicObj && (maybeLicObj.id || maybeLicObj.licencia_id)) || (wrapperObj && (wrapperObj.licencia_id || wrapperObj.id));
  let det = null;
  if (detKey !== undefined && detKey !== null) {
    det = licenciasDetallesMap.get(detKey) || licenciasDetallesMap.get(String(detKey)) || licenciasDetallesMap.get(Number(detKey));
  }
  if (!det && maybeLicObj && maybeLicObj.licencia) det = maybeLicObj.licencia;
  if (!det) det = maybeLicObj || wrapperObj || {};
  
  // Restricción
  const restrId = det.restriccion_lic_id || det.restriccion_id || (det.restriccion && (det.restriccion.id || det.restriccion.restriccion_lic_id)) || maybeLicObj?.restriccion_lic_id || wrapperObj?.restriccion_lic_id;
  if (restrId !== undefined && restrId !== null) {
    const restrObj = informeRestriccionesMap.get(restrId) || informeRestriccionesMap.get(String(restrId)) || informeRestriccionesMap.get(Number(restrId));
    if (restrObj) result.restrText = (typeof restrObj === 'string') ? restrObj : (restrObj.descripcion || restrObj.nombre || restrObj.descripcion_corta || String(restrObj.id));
    else result.restrText = String(restrId);
  }
  
  // Documento
  const docId = det.documento_id || det.documentoId || det.documento || maybeLicObj?.documento_id || wrapperObj?.documento_id;
  if (docId !== undefined && docId !== null) {
    let docObj = informeDocumentosMap.get(docId) || informeDocumentosMap.get(String(docId)) || informeDocumentosMap.get(Number(docId));
    if (!docObj && typeof docId === 'object') docObj = docId;
    if (docObj) result.docText = (docObj.nombre || docObj.descripcion || docObj.titulo || (docObj.numero || docObj.nro || docObj.numero_documento) || String(docObj.id));
    else result.docText = String(docId);
  }
  
  // Fecha expedición
  result.fechaExp = extractFechaExpedicionStr(det);
  if (result.fechaExp === '—') result.fechaExp = extractFechaExpedicionStr(maybeLicObj);
  if (result.fechaExp === '—' && wrapperObj) result.fechaExp = extractFechaExpedicionStr(wrapperObj);
  
  return result;
}

function renderTablaConductores(filtroCategoria = 'todas') {
  const {
    conductores
    , licencias
  } = informeConductoresCache;
  const cols = ['Conductor', 'Identificación'];
  const colKeys = ['conductor', 'identificacion'];
  // Decidir columna de licencia: mostrar número si existe, sino mostrar ID
  if (informeAvailableFields.numero) {
    cols.push('Licencia Nº');
    colKeys.push('numero');
  } else if (informeAvailableFields.restriccion) {
    cols.push('Restricción');
    colKeys.push('restriccion');
  } else if (informeAvailableFields.documento) {
    cols.push('Documento');
    colKeys.push('documento');
  } else {
    cols.push('Licencia ID');
    colKeys.push('licencia_id');
  }
  if (informeAvailableFields.categoria) {
    cols.push('Categoría');
    colKeys.push('categoria');
  }
  if (informeAvailableFields.expedicion) {
    cols.push('Fecha Expedición');
    colKeys.push('fecha_expedicion');
  }
  // Construir header
  let html = '<table class="data-table"><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
  let added = 0;
  conductores.forEach(c => {
    const persona = c.persona || {};
    const firstName = (persona.name || persona.nombres || persona.nombre || '').trim();
    const lastName = (persona.last_name || persona.apellidos || persona.apellido || '').trim();
    const fullName = `${firstName || '—'} ${lastName || ''}`.trim();
    const idDisplay = persona.nui || persona.identificacion || persona.documento || persona.cc || persona.cedula || '—';
    const licCond = licencias.filter(l => (l.conductor_id ?? l.conductorId ?? l.conductor?.id) == c.id);
    if (licCond.length === 0) {
      html += `<tr class="row-sin"><td>${fullName}</td><td>${idDisplay}</td><td colspan="${cols.length-2}" class="text-center"><span class="badge badge-error">Sin licencia</span></td></tr>`;
      added++;
    } else {
      licCond.forEach(l => {
        const lic = l.licencia || l || {};
        const numeroLic = extractNumeroLicencia(lic);
        const categoriaObj = lic.categoria || lic.categoria_licencia;
        const categoria = (categoriaObj?.descripcion || categoriaObj?.nombre || categoriaObj?.codigo || lic.categoria || lic.categoria_licencia) || '—';
        
        // Resolver restricción, documento y fecha de expedición desde el catálogo si está disponible
        const info = resolveDetalleInfo(lic, l);
        const restriccionText = info.restrText;
        const documentoText = info.docText;
        const fechaExpStr = info.fechaExp;
        
        if (filtroCategoria !== 'todas' && informeAvailableFields.categoria && filtroCategoria !== categoria) return;
        // Construir fila según columnas detectadas
        let row = `<td>${fullName}</td><td>${idDisplay}</td>`;
        if (informeAvailableFields.numero) row += `<td>${numeroLic}</td>`;
        else if (informeAvailableFields.restriccion) row += `<td>${restriccionText || '—'}</td>`;
        else if (informeAvailableFields.documento) row += `<td>${documentoText || '—'}</td>`;
        else row += `<td>${lic.licencia_id || lic.id || '—'}</td>`;
        if (informeAvailableFields.categoria) row += `<td>${categoria}</td>`;
        if (informeAvailableFields.expedicion) row += `<td>${fechaExpStr}</td>`;
        html += `<tr>${row}</tr>`;
        added++;
      });
    }
  });
  if (added === 0) html += `<tr><td colspan="${cols.length}" class="text-center" style="font-weight:600; color:#64748b;">No hay registros (verifica filtros o que existan conductores)</td></tr>`;
  html += '</tbody></table>';
  return html;
}

async function loadInformeConductores() {
  // Incluir persona para nombres/documentos; intentar incluir categoría en licencias si la API lo soporta
  const conductoresResp = await apiGet('/conductores?include=persona');
  const licenciasResp = await apiGet('/conductores-licencias?include=licencia.categoria');
  // Nuevo: traer catálogo de licencias completo para intentar extraer numero y fecha reales
  const licenciasCatalogResp = await apiGet('/licencias?include=categoria,restriccion,documento');
  
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
  const licenciasCatalogList = normalizeList(licenciasCatalogResp);
  
  // Cargar restricciones y documentos para mostrar información más relevante en el informe
  let restriccionesResp = null
    , documentosResp = null;
  try {
    restriccionesResp = await apiGet('/restriccion_lic');
  } catch (e) {
    /* ignore */
  }
  try {
    documentosResp = await apiGet('/documentos');
  } catch (e) {
    /* ignore */
  }
  const restriccionesList = normalizeList(restriccionesResp);
  const documentosList = normalizeList(documentosResp);
  // Rellenar mapas globales para que los helpers globales puedan acceder a ellos
  informeRestriccionesMap.clear();
  informeDocumentosMap.clear();
  restriccionesList.forEach(r => {
    if (r && (r.id || r.restriccion_lic_id)) informeRestriccionesMap.set(r.id || r.restriccion_lic_id, r);
  });
  documentosList.forEach(d => {
    if (d && (d.id || d.documento_id)) informeDocumentosMap.set(d.id || d.documento_id, d);
  });
  
  // Intentar obtener catálogo de categorías directamente desde el API
  let categoriasResp = null;
  try {
    categoriasResp = await apiGet('/categorias_licencia');
  } catch (e) {
    /* no fatal */
  }
  const categoriasListFromApi = normalizeList(categoriasResp);
  
  informeConductoresCache.conductores = conductoresList;
  informeConductoresCache.licencias = licenciasList;
  licenciasDetallesMap.clear();
  licenciasCatalogList.forEach(det => {
    if (det && (det.id || det.licencia_id)) {
      const key = det.id || det.licencia_id;
      licenciasDetallesMap.set(key, det);
    }
  });
  
  // Detectar qué campos están realmente presentes en la API
  (function detectAvailable() {
    let hasNum = false
      , hasDate = false
      , hasCat = false;
    let hasRestr = false
      , hasDoc = false
      , hasExped = false;
    const scan = (o) => {
      if (!o || typeof o !== 'object') return;
      const keys = Object.keys(o).map(k => k.toLowerCase());
      if (keys.some(k => k.includes('num') || k.includes('numero') || k.includes('nro'))) hasNum = true;
      if (keys.some(k => k.includes('venc') || k.includes('expir') || k.includes('fecha'))) hasDate = true;
      if (keys.some(k => k.includes('categoria') || k.includes('cat') || k === 'codigo' || k === 'descripcion')) hasCat = true;
      if (o.categoria || o.categoria_licencia) hasCat = true;
      if (keys.some(k => k.includes('restric') || k.includes('restriccion'))) hasRestr = true;
      if (keys.some(k => k.includes('document') || k.includes('documento') || k.includes('doc'))) hasDoc = true;
      if (keys.some(k => k.includes('exped') || k.includes('fecha_exped') || k.includes('fecha_expedicion'))) hasExped = true;
    };
    for (const it of licenciasCatalogList) {
      scan(it);
      if (hasNum && hasDate && hasCat) break;
    }
    if (!(hasNum && hasDate && hasCat))
      for (const it of licenciasList) {
        scan(it);
        if (hasNum && hasDate && hasCat) break;
      }
    informeAvailableFields.numero = hasNum;
    informeAvailableFields.fecha = hasDate;
    informeAvailableFields.categoria = hasCat;
    informeAvailableFields.restriccion = hasRestr || (restriccionesList && restriccionesList.length > 0);
    informeAvailableFields.documento = hasDoc || (documentosList && documentosList.length > 0);
    informeAvailableFields.expedicion = hasExped;
    console.log('[DEBUG informe conductores] availableFields:', informeAvailableFields);
  })();
  
  console.log('[DEBUG informe conductores] rawConductores:', conductoresResp);
  console.log('[DEBUG informe conductores] rawLicencias:', licenciasResp);
  console.log('[DEBUG informe conductores] rawLicenciasCatalog:', licenciasCatalogResp);
  console.log('[DEBUG informe conductores] normalized lengths:', {
    conductores: conductoresList.length
    , licencias: licenciasList.length
    , licenciasCatalog: licenciasCatalogList.length
  });
  
  // LOGGING TEMPORAL: Mostrar primeras entradas para depuración de categorías
  try {
    console.log('[DEBUG informe conductores] sample licenciasCatalogList (first 6):', (Array.isArray(licenciasCatalogList) ? licenciasCatalogList.slice(0, 6) : licenciasCatalogList));
    console.log('[DEBUG informe conductores] sample licenciasList (first 6):', (Array.isArray(licenciasList) ? licenciasList.slice(0, 6) : licenciasList));
    console.log('[DEBUG informe conductores] sample informeConductoresCache.licencias (first 6):', (Array.isArray(informeConductoresCache.licencias) ? informeConductoresCache.licencias.slice(0, 6) : informeConductoresCache.licencias));
  } catch (e) {
    console.warn('[DEBUG informe conductores] error printing samples', e);
  }
  
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
  // Obtener lista de categorías únicas (fuente preferida: /categorias_licencia)
  const categoriasSet = new Set();
  
  // Si la API devuelve el catálogo de categorías, usarlo primero (más fiable)
  if (Array.isArray(categoriasListFromApi) && categoriasListFromApi.length) {
    // Preferir mostrar la descripción/nombre de la categoría en lugar del código
    categoriasListFromApi.forEach(c => {
      if (!c) return;
      const label = (c.descripcion || c.nombre || c.codigo || c.name);
      if (label && typeof label === 'string' && label.trim()) {
        categoriasSet.add(label.trim());
        return;
      }
    });
    
    // Si no se detecta descripción, como fallback intentar extraer código o nombre
    if (categoriasSet.size === 0) {
      categoriasListFromApi.forEach(c => {
        const name = (c && (c.nombre || c.descripcion || c.codigo || c.name));
        if (name && typeof name === 'string' && name.trim()) categoriasSet.add(name.trim());
      });
      console.warn('[DEBUG categoria licencia] catálogo sin descripción, usando el primer campo disponible', categoriasListFromApi.slice(0, 6));
    }
  }
  
  // Helper: intenta extraer nombre de categoría desde distintos formatos
  const pushCategoriaFrom = (item, idx, sourceLabel) => {
    if (!item) return;
    // Normalizar a posible objeto 'licencia'
    const lic = item.licencia || item;
    
    // 1) buscar objetos categoría directos
    const candidates = [];
    if (lic.categoria) candidates.push(lic.categoria);
    if (lic.categoria_licencia) candidates.push(lic.categoria_licencia);
    
    // 2) propiedades directas que pueden contener el nombre
    ['nombre', 'codigo', 'descripcion', 'categoria', 'categoria_nombre', 'categoriaCodigo', 'categoria_codigo', 'categoria_descripcion', 'name'].forEach(k => {
      if (typeof lic[k] === 'string' && lic[k].trim()) candidates.push(lic[k].trim());
    });
    
    // 3) si existe un objeto 'categoria' dentro de objetos anidados
    if (lic.licencia && lic.licencia.categoria) candidates.push(lic.licencia.categoria);
    
    // Evaluar candidatos
    for (const c of candidates) {
      if (!c) continue;
      let name = '';
      if (typeof c === 'string') name = c;
      else if (typeof c === 'object') name = c.nombre || c.codigo || c.descripcion || c.name || c?.codigo || '';
      if (typeof name === 'string' && name.trim()) {
        categoriasSet.add(name.trim());
        return;
      }
    }
    
    // 4) fallback: búsqueda profunda en el objeto para encontrar cualquier string cuyo key incluya 'categoria'/'cat'/'codigo'/'descripcion'/'nombre'
    const found = deepSearch(lic, (k, v) => {
      if (!v) return false;
      if (typeof v !== 'string') return false;
      const lk = k.toLowerCase();
      if (lk.includes('categoria') || lk.includes('cat') || lk.includes('codigo') || lk.includes('descripcion') || lk === 'nombre' || lk === 'name') {
        return v.trim().length > 0;
      }
      return false;
    });
    if (found && typeof found === 'string' && found.trim()) categoriasSet.add(found.trim());
    
    // Debug para primeros registros
    if (idx < 3) {
      console.log('[DEBUG categoria licencia] source:', sourceLabel, 'registro', idx, {
        original: item
        , extracted: Array.from(categoriasSet).slice(-3)
      });
    }
  };
  
  // Revisar en varios lugares: licencias relacionadas, catálogo de licencias y la respuesta original de licencias
  try {
    if (Array.isArray(licenciasCatalogList)) licenciasCatalogList.forEach((it, i) => pushCategoriaFrom(it, i, 'catalog'));
  } catch (e) {
    /* ignore */
  }
  try {
    if (Array.isArray(licenciasList)) licenciasList.forEach((it, i) => pushCategoriaFrom(it, i, 'licenciasResp'));
  } catch (e) {
    /* ignore */
  }
  try {
    if (Array.isArray(informeConductoresCache.licencias)) informeConductoresCache.licencias.forEach((it, i) => pushCategoriaFrom(it, i, 'conductores_lic'));
  } catch (e) {
    /* ignore */
  }
  
  if (categoriasSet.size === 0) {
    console.warn('No se detectaron categorías de licencia. Revisa estructura de /conductores-licencias');
  }
  const categorias = Array.from(categoriasSet).sort();
  
  // Si detectamos menos categorías de las esperadas, intentar heurística: buscar strings que parezcan códigos de categoría (A, B, C, AB)
  if (categorias.length < 3) {
    const potentialSet = new Set();
    const collectPotentialCats = (obj) => {
      if (!obj) return;
      if (typeof obj === 'string') {
        const s = obj.trim();
        if (/^[A-Za-z]{1,3}$/.test(s)) potentialSet.add(s.toUpperCase());
        return;
      }
      if (Array.isArray(obj)) return obj.forEach(collectPotentialCats);
      if (typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
          try {
            collectPotentialCats(v);
          } catch (e) {}
        }
      }
    };
    try {
      if (Array.isArray(licenciasCatalogList)) licenciasCatalogList.forEach(collectPotentialCats);
    } catch (e) {}
    try {
      if (Array.isArray(licenciasList)) licenciasList.forEach(collectPotentialCats);
    } catch (e) {}
    try {
      if (Array.isArray(informeConductoresCache.licencias)) informeConductoresCache.licencias.forEach(collectPotentialCats);
    } catch (e) {}
    // añadir a set principal
    potentialSet.forEach(s => categoriasSet.add(s));
  }
  // recomponer array final ordenado
  const categoriasFinal = Array.from(categoriasSet).sort();
  // Filtrar códigos de una sola letra (A, B, C, etc.) para no mostrarlos en el select
  const categoriasFinalFiltered = categoriasFinal.filter(c => !/^[A-Za-z]$/.test(c));
  
  // Construir dinámicamente el HTML de controles según campos disponibles
  const resumenItems = [];
  resumenItems.push(`<div class="resumen-item resumen-item--total"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div><div class="resumen-text"><span>Total Conductores</span><strong>${resumen.totalConductores}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--lic"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19l12-12L19.6 5.6z"/></svg></div><div class="resumen-text"><span>Con Licencia</span><strong>${resumen.conLicencia}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--sin"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></div><div class="resumen-text"><span>Sin Licencia</span><strong>${resumen.sinLicencia}</strong></div></div>`);
  if (informeAvailableFields.fecha) {
    resumenItems.push(`<div class="resumen-item resumen-item--vig"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm1 12.59V6h-2v7l6.25 3.75 1-1.66L13 13.59z"/></svg></div><div class="resumen-text"><span>Licencias Vigentes</span><strong>${resumen.vigentes}</strong></div></div>`);
    resumenItems.push(`<div class="resumen-item resumen-item--ven"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div><div class="resumen-text"><span>Licencias Vencidas</span><strong>${resumen.vencidas}</strong></div></div>`);
  }
  
  const filtroEstadoHtml = informeAvailableFields.fecha ? `
            <div class="filtro-group">
                <label for='filtro-estado-lic' class='filtro-label'>Estado</label>
                <select id="filtro-estado-lic" class="filtro-select filtro-select--wide">
                    <option value="todos">Todos</option>
                    <option value="vigente">Vigente</option>
                    <option value="vencida">Vencida</option>
                    <option value="sin">Sin licencia</option>
                </select>
            </div>
    ` : '';
  
  let controls = `<div class="informe-controls">
        <div class="resumen-grid resumen-grid-enhanced">
            ${resumenItems.join('\n')}
        </div>
        <div class="filtros-grid filtros-grid-enhanced">
            ${filtroEstadoHtml}
            <div class="filtro-group">
                <label for='filtro-categoria-lic' class='filtro-label'>Categoría</label>
                <select id="filtro-categoria-lic" class="filtro-select filtro-select--wide">
                    <option value="todas">Todas</option>
                    ${categoriasFinalFiltered.map(c => `<option value="${c}">${c}</option>`).join('')}
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
  
  // Solo filtrar por categoría si existe
  document.getElementById('filtro-categoria-lic').addEventListener('change', () => {
    const categoria = document.getElementById('filtro-categoria-lic').value;
    cont.querySelector('table').outerHTML = renderTablaConductores(categoria);
  });
  document.getElementById('btn-export-conductores').addEventListener('click', () => {
    const categoria = document.getElementById('filtro-categoria-lic').value;
    const rows = [];
    // Armar encabezado dinámico (preferir número, luego restricción, luego documento, luego id)
    const headers = ['Conductor', 'Identificación'];
    if (informeAvailableFields.numero) headers.push('Licencia Nº');
    else if (informeAvailableFields.restriccion) headers.push('Restricción');
    else if (informeAvailableFields.documento) headers.push('Documento');
    else headers.push('Licencia ID');
    if (informeAvailableFields.categoria) headers.push('Categoría');
    rows.push(headers);
    
    informeConductoresCache.conductores.forEach(c => {
      const persona = c.persona || {};
      const firstName = (persona.name || persona.nombres || persona.nombre || '').trim();
      const lastName = (persona.last_name || persona.apellidos || persona.apellido || '').trim();
      const fullName = `${firstName || '—'} ${lastName || ''}`.trim();
      const idDisplay = persona.nui || persona.identificacion || persona.documento || persona.cc || persona.cedula || '—';
      const licCond = informeConductoresCache.licencias.filter(l => (l.conductor_id ?? l.conductorId ?? l.conductor?.id) == c.id);
      if (licCond.length === 0) {
        const emptyRow = [fullName, idDisplay];
        while (emptyRow.length < headers.length) emptyRow.push('');
        rows.push(emptyRow);
      } else {
        licCond.forEach(l => {
          const lic = l.licencia || {};
          const numeroLic = extractNumeroLicencia(lic);
          const categoriaObj = lic.categoria || lic.categoria_licencia;
          const categoriaLic = (categoriaObj?.descripcion || categoriaObj?.nombre || categoriaObj?.codigo) || '';
          
          // obtener restricción/documento y fecha de expedición desde el catálogo si existe
          let restriccionText = '';
          let documentoText = '';
          let fechaExpStr = '';
          try {
            const detKey = lic.id || lic.licencia_id || l.licencia_id || l.id;
            const det = licenciasDetallesMap.get(detKey) || lic;
            if (det) {
              const restrId = det.restriccion_lic_id || det.restriccion_id;
              const restrObj = restriccionesMap.get(restrId);
              if (restrObj) {
                restriccionText = (typeof restrObj === 'string') ? restrObj : (restrObj.descripcion || restrObj.nombre || restrObj.descripcion_corta || String(restrObj.id));
              } else if (restrId) restriccionText = String(restrId);
              
              const docId = det.documento_id || det.documentoId || det.documento;
              if (docId) {
                const doc = documentosMap.get(docId);
                documentoText = doc ? (doc.nombre || doc.descripcion || doc.titulo || String(doc.id)) : String(docId);
              }
              
              fechaExpStr = extractFechaExpedicionStr(det);
              if (fechaExpStr === '—') fechaExpStr = extractFechaExpedicionStr(lic);
            }
          } catch (e) {
            /* ignore */
          }
          
          if ((categoria === 'todas' || !informeAvailableFields.categoria) || categoria === categoriaLic) {
            const row = [fullName, idDisplay];
            if (informeAvailableFields.numero) row.push(numeroLic === '—' ? '' : numeroLic);
            else if (informeAvailableFields.restriccion) row.push(restriccionText || '');
            else if (informeAvailableFields.documento) row.push(documentoText || '');
            else row.push(lic.licencia_id || lic.id || '');
            if (informeAvailableFields.categoria) row.push(categoriaLic);
            if (informeAvailableFields.expedicion) row.push(fechaExpStr || '—');
            rows.push(row);
          }
        });
      }
    });
    exportCSV('informe_conductores.csv', rows);
  });
}

function renderTablaVehiculosRutaDetalle(routeId = null) {
  const asignaciones = informeVehiculosRutaCache.asignaciones || [];
  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Ruta</th><th>Vehículo (Placa)</th><th>Tipo</th><th>Kilometraje</th><th>Fecha/Hora</th>';
  html += '</tr></thead><tbody>';
  const filtered = routeId ? asignaciones.filter(a => (a.ruta && (a.ruta.id == routeId || a.ruta.id === Number(routeId)))) : asignaciones;
  if (filtered.length === 0) {
    html += '<tr><td colspan="5" class="text-center">No hay asignaciones registradas</td></n></tr>';
  } else {
    filtered.forEach(a => {
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
  return html;
}

async function loadInformeVehiculosRuta() {
  // Cargar asignaciones y recursos necesarios
  const asignacionesResp = await apiGet('/seguim-estado-veh');
  const rutasResp = await apiGet('/rutas');
  const vehiculosResp = await apiGet('/vehiculos');
  
  const asignacionesList = normalizeList(asignacionesResp);
  const rutasList = normalizeList(rutasResp);
  const vehiculosList = normalizeList(vehiculosResp);
  
  // Mapear objetos de vehículo/ruta a las asignaciones cuando la API devuelve solo IDs
  // Construir mapas rápidos por id (usar llave string para evitar mismatch entre "1" y 1)
  const vehiculoMap = new Map();
  if (Array.isArray(vehiculosList)) vehiculosList.forEach(v => {
    if (v && (v.id !== undefined && v.id !== null)) vehiculoMap.set(String(v.id), v);
  });
  const rutaMap = new Map();
  if (Array.isArray(rutasList)) rutasList.forEach(r => {
    if (r && (r.id !== undefined && r.id !== null)) rutaMap.set(String(r.id), r);
  });
  
  // Intentar cargar tipos de vehículo para mapear tipo_veh_id -> descripcion
  let tiposVehList = [];
  try {
    const tiposResp = await apiGet('/tipo-vehiculo');
    tiposVehList = normalizeList(tiposResp) || [];
  } catch (e) {
    console.debug('No se pudo cargar /tipo-vehiculo:', e);
  }
  const tipoMap = new Map();
  if (Array.isArray(tiposVehList)) tiposVehList.forEach(t => {
    if (t && (t.id !== undefined && t.id !== null)) tipoMap.set(String(t.id), t);
  });
  
  // Normalizar asignaciones: adjuntar `vehiculo` y `ruta` cuando falten y exista el id
  if (Array.isArray(asignacionesList)) {
    asignacionesList.forEach(a => {
      try {
        // Vehículo: soporte varios nombres de campo (vehiculo_id, vehiculoId, vehiculo)
        if ((!a.vehiculo || Object.keys(a.vehiculo).length === 0) && (a.vehiculo_id || a.vehiculoId)) {
          const vid = String(a.vehiculo_id || a.vehiculoId);
          if (vehiculoMap.has(vid)) a.vehiculo = Object.assign({}, vehiculoMap.get(vid));
        } else if (a.vehiculo && a.vehiculo.id) {
          const vid = String(a.vehiculo.id);
          if (vehiculoMap.has(vid)) a.vehiculo = Object.assign({}, vehiculoMap.get(vid), a.vehiculo);
        }
        
        // Si existe tipo id en el vehículo, mapear a objeto tipo con campo legible
        if (a.vehiculo) {
          // Normalizar nombre de placa
          if (!a.vehiculo.placa && (a.placa || a.vehiculo_placa)) {
            a.vehiculo.placa = a.placa || a.vehiculo_placa;
          }
          
          const tipoId = a.vehiculo.tipo_veh_id || a.vehiculo.tipoVehId || a.vehiculo.tipo_id || (a.vehiculo.tipo && a.vehiculo.tipo.id);
          if (!a.vehiculo.tipo && tipoId && tipoMap.has(String(tipoId))) {
            const tipoObj = tipoMap.get(String(tipoId));
            a.vehiculo.tipo = {
              nombre: tipoObj.descripcion || tipoObj.nombre || tipoObj.descripcion_corta || String(tipoObj.id)
            };
          }
          
          // Aceptar si el API devolvió 'tipo_vehiculo' anidado
          if (!a.vehiculo.tipo && a.vehiculo.tipo_vehiculo) {
            a.vehiculo.tipo = {
              nombre: a.vehiculo.tipo_vehiculo.descripcion || a.vehiculo.tipo_vehiculo.nombre
            };
          }
        }
        
        // Ruta: soporte ruta_id, rutaId, y objeto ruta
        if ((!a.ruta || Object.keys(a.ruta).length === 0) && (a.ruta_id || a.rutaId)) {
          const rid = String(a.ruta_id || a.rutaId);
          if (rutaMap.has(rid)) a.ruta = Object.assign({}, rutaMap.get(rid));
        } else if (a.ruta && a.ruta.id) {
          const rid = String(a.ruta.id);
          if (rutaMap.has(rid)) a.ruta = Object.assign({}, rutaMap.get(rid), a.ruta);
        }
        
        // Normalizar nombre de ruta (nombre vs name)
        if (a.ruta) {
          if (!a.ruta.nombre && a.ruta.name) a.ruta.nombre = a.ruta.name;
        }
      } catch (e) {
        // No bloquear si hay estructura inesperada
        console.debug('Normalizar asignación falló para item', a, e);
      }
    });
  }
  
  informeVehiculosRutaCache.asignaciones = asignacionesList;
  
  // Resumen: total vehículos (catalog), asignados (únicos en asignaciones) y sin asignar
  const totalVehiculos = vehiculosList.length;
  const vehiculosAsignadosSet = new Set();
  asignacionesList.forEach(a => {
    if (a.vehiculo && a.vehiculo.id) vehiculosAsignadosSet.add(a.vehiculo.id);
  });
  const assignedCount = vehiculosAsignadosSet.size;
  const unassignedCount = Math.max(0, totalVehiculos - assignedCount);
  
  // Conteo por ruta
  const conteoPorRuta = new Map();
  asignacionesList.forEach(a => {
    const nombreRuta = a.ruta?.nombre || 'Sin nombre';
    conteoPorRuta.set(nombreRuta, (conteoPorRuta.get(nombreRuta) || 0) + 1);
  });
  const resumenRows = Array.from(conteoPorRuta.entries()).sort((a, b) => b[1] - a[1]);
  
  // Construir controles y resumen con el mismo estilo visual que Informe Conductores
  const resumenItems = [];
  resumenItems.push(`<div class="resumen-item resumen-item--total"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z"/></svg></div><div class="resumen-text"><span>Total Vehículos</span><strong>${totalVehiculos}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--lic"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19l12-12L19.6 5.6z"/></svg></div><div class="resumen-text"><span>Vehículos Asignados</span><strong>${assignedCount}</strong></div></div>`);
  resumenItems.push(`<div class="resumen-item resumen-item--sin"><div class="resumen-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></div><div class="resumen-text"><span>Sin Asignar</span><strong>${unassignedCount}</strong></div></div>`);
  
  // Filtro de rutas
  const rutasOptions = ['<option value="todas">Todas</option>'];
  // Preferir catálogo /rutas si está disponible
  if (Array.isArray(rutasList) && rutasList.length) {
    rutasList.forEach(r => {
      if (r && r.id) rutasOptions.push(`<option value="${r.id}">${r.nombre || r.name || 'Ruta #' + r.id}</option>`);
    });
  } else {
    // Fallback: usar nombres detectados en asignaciones
    const seen = new Set();
    resumenRows.forEach(([nombre, count], idx) => {
      if (!seen.has(nombre)) {
        rutasOptions.push(`<option value="${nombre}">${nombre}</option>`);
        seen.add(nombre);
      }
    });
  }
  
  const filtroEstadoHtml = '';
  const controls = `<div class="informe-controls">
        <div class="resumen-grid resumen-grid-enhanced">
            ${resumenItems.join('\n')}
        </div>
        <div class="filtros-grid filtros-grid-enhanced" style="align-items:center;">
            ${filtroEstadoHtml}
            <div class="filtro-group">
                <label for='filtro-ruta-veh' class='filtro-label'>Ruta</label>
                <select id="filtro-ruta-veh" class="filtro-select filtro-select--wide">
                    ${rutasOptions.join('\n')}
                </select>
            </div>
            <div class="export-buttons">
                <button id="btn-export-vehiculos-ruta" class="btn-export btn-export--primary"><svg viewBox='0 0 24 24' fill='none' stroke='currentColor'><path d='M4 17.5C4 16.672 4.672 16 5.5 16h13c.828 0 1.5.672 1.5 1.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5Z'/><path d='M12 3v11'/><path d='M8 10.5l4 3.5 4-3.5'/></svg> Exportar CSV</button>
            </div>
        </div>
    </div>`;
  
  const tabla = `<div class="tabla-wrapper">${renderTablaVehiculosRutaDetalle()}</div>`;
  const html = '<h3 class="informe-title">Informe: Vehículos por Ruta</h3>' + controls + tabla;
  const cont = document.getElementById('informe-result');
  cont.innerHTML = html;
  
  // Listener para cambio de ruta
  const filtroRutaEl = document.getElementById('filtro-ruta-veh');
  filtroRutaEl.addEventListener('change', (e) => {
    const val = e.target.value;
    const tableWrap = cont.querySelector('.tabla-wrapper');
    if (!tableWrap) return;
    if (val === 'todas') tableWrap.innerHTML = renderTablaVehiculosRutaDetalle();
    else tableWrap.innerHTML = renderTablaVehiculosRutaDetalle(val);
  });
  
  // Exportar CSV (respeta filtro)
  document.getElementById('btn-export-vehiculos-ruta').addEventListener('click', () => {
    const rutaVal = document.getElementById('filtro-ruta-veh').value;
    const rows = [
      ['Ruta', 'Placa', 'Tipo', 'Kilometraje', 'Fecha/Hora']
    ];
    const source = informeVehiculosRutaCache.asignaciones || [];
    const filtered = (rutaVal && rutaVal !== 'todas') ? source.filter(a => (a.ruta && (a.ruta.id == rutaVal || a.ruta.nombre == rutaVal))) : source;
    filtered.forEach(a => {
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
  
  console.log(' Event listeners con delegación configurados');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}