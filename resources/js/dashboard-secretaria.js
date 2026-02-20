// Dashboard Secretaría de Tránsito - Lógica de Supervisión
// ====================================================================================

// --- Configuración Global ---
let dashboardDataStore = {
  empresas: [],
  rutas: [],
  resoluciones: []
};

// --- Utilidades API ---
function getToken() {
  return localStorage.getItem('auth_token');
}

function showNotification(type, title, message) {
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
}

async function apiCall(endpoint, method = 'GET', body = null, isFile = false) {
  const token = getToken();
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  // Si NO es archivo, agregamos Content-Type JSON
  if (!isFile && body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers
  };

  if (body) {
    // Si es FormData (archivo), el navegador pone el Content-Type
    config.body = (isFile || body instanceof FormData) ? body : JSON.stringify(body);
  }

  try {
    const url = `/api${endpoint}`;
    const res = await fetch(url, config);

    // Manejo de token expirado
    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return null;
    }

    // Manejo especial para descargas (blobs)
    const contentType = res.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      return res;
    }

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 422 && json.errors) {
        console.error("Errores de validación:", json.errors);
        const errorMsg = Object.entries(json.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        throw new Error(`Validación fallida:\n${errorMsg}`);
      }
      throw new Error(json.message || `Error HTTP: ${res.status}`);
    }
    return json;
  } catch (err) {
    console.error("Fallo en API:", err);
    // Solo mostrar notificación si no es redirección
    if (err.message !== 'Failed to fetch' && !err.message.includes('401')) {
        showNotification('error', 'Error de Sistema', err.message);
    }
    return null;
  }
}

// --- 1. Construcción del Menú ---
function buildSecretariaMenu() {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav) return;

  sidebarNav.innerHTML = `
        <p class="nav-section-title">Supervisión</p>
        <a href="#resumen" class="nav-link active" data-view="resumen">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span>Resumen General</span>
        </a>
        <a href="#resoluciones" class="nav-link" data-view="resoluciones">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Gestión Resoluciones</span>
        </a>
        <a href="#rutas" class="nav-link" data-view="rutas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <span>Validación Rutas</span>
        </a>
        <a href="#empresas" class="nav-link" data-view="empresas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span>Reporte Empresas</span>
        </a>
    `;
  setupNavigation();
}

function setupNavigation() {
  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const view = link.getAttribute('data-view');
      if (view) {
        e.preventDefault();
        document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
        const target = document.getElementById(`view-${view}`);
        if (target) target.style.display = 'block';
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const headerTitle = document.getElementById('header-title');
        if (headerTitle) {
          const titles = {
            'resumen': 'Panel de Supervisión',
            'resoluciones': 'Gestión de Resoluciones',
            'rutas': 'Validación de Rutas',
            'empresas': 'Supervisión de Empresas'
          };
          headerTitle.textContent = titles[view] || 'Dashboard';
        }
        loadViewData(view);
      }
    });
  });
}

async function loadViewData(view) {
  switch (view) {
  case 'resumen':
    loadStats();
    break;
  case 'resoluciones':
    loadResoluciones();
    break;
  case 'rutas':
    loadRutasParaValidar();
    break;
  case 'empresas':
    loadEmpresas();
    break;
  }
}

// --- 2. Estadísticas (Resumen) ---
async function loadStats() {
  const filtroRes = encodeURIComponent(JSON.stringify([{
    "column": "observaciones",
    "operator": "like",
    "value": "%Resolución%"
  }]));
  try {
    const [empresas, rutas, resoluciones] = await Promise.all([
      apiCall('/empresas?limit=1'),
      apiCall('/rutas?limit=1'),
      apiCall(`/documentos?filter=${filtroRes}&limit=1`)
    ]);

    if (empresas) document.getElementById('stat-empresas').innerText = empresas.total || 0;
    if (rutas) document.getElementById('stat-rutas').innerText = rutas.total || 0;
    if (resoluciones) document.getElementById('stat-resoluciones').innerText = resoluciones.total || 0;
  } catch (e) {
    console.error("Error stats:", e);
  }
}

// --- 3. Gestión de Resoluciones ---
async function loadResoluciones() {
  const container = document.getElementById('lista-resoluciones');
  container.innerHTML = '<div class="loading-state"><p>Cargando...</p></div>';

  const filtroRes = encodeURIComponent(JSON.stringify([{
    "column": "observaciones",
    "operator": "like",
    "value": "%Resolución%"
  }]));
  
  const res = await apiCall(`/documentos?include=tipo_documento,empresa&filter=${filtroRes}&limit=100`);

  loadEmpresasSelect(); // Llenar select del modal

  if (!res || !res.data || !res.data.data || res.data.data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No hay resoluciones cargadas.</p></div>';
    return;
  }

  let html = `<table class="modern-table">
        <thead><tr><th>ID</th><th>Detalle / Asunto</th><th>Empresa Asignada</th><th>Fecha</th><th>Acción</th></tr></thead>
        <tbody>`;

  res.data.data.forEach(doc => {
    const fecha = doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A';
    const nombreEmpresa = doc.empresa ? `<span class="badge badge-info">${doc.empresa.name}</span>` : '<span class="text-gray-400">General</span>';

    html += `
            <tr>
                <td>${doc.id}</td>
                <td>${doc.observaciones || 'Sin detalle'}</td>
                <td>${nombreEmpresa}</td>
                <td>${fecha}</td>
                <td>
                    <button onclick="downloadDocumento(${doc.id})" class="btn-action text-blue-600 hover:text-blue-800" title="Ver PDF">
                        <svg style="width:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Ver
                    </button>
                </td>
            </tr>
        `;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

async function loadEmpresasSelect() {
  const select = document.getElementById('res-empresa');
  if (!select || select.options.length > 1) return;

  const res = await apiCall('/empresas?limit=1000');
  select.innerHTML = '<option value="">-- General (Para todas) --</option>';

  if (res && res.data) {
    const list = res.data.data || res.data;
    list.forEach(e => {
      const option = document.createElement('option');
      option.value = e.id;
      option.textContent = e.name;
      select.appendChild(option);
    });
  }
}

window.downloadDocumento = async function (id) {
  showNotification('info', 'Descargando', 'Obteniendo archivo seguro...');
  const token = getToken();
  try {
    const response = await fetch(`/api/documentos/${id}/file`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("No se pudo acceder al archivo.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (err) {
    showNotification('error', 'Error', 'No se pudo abrir el documento.');
    console.error(err);
  }
};

async function handleSubirResolucion(e) {
  e.preventDefault();
  const fileInput = document.getElementById('res-file');
  const obsInput = document.getElementById('res-obs');
  const empresaInput = document.getElementById('res-empresa');

  if (fileInput.files.length === 0) return showNotification('warning', 'Requerido', 'Selecciona un archivo PDF.');
  if (!obsInput.value.trim()) return showNotification('warning', 'Requerido', 'Escribe el detalle de la resolución.');

  // ID Fijo para resoluciones o búsqueda
  let tipoId = 1; 
  // (Opcional: buscar dinámicamente como antes)

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('observaciones', `Resolución: ${obsInput.value}`);
  formData.append('tipo_doc_id', tipoId);

  if (empresaInput.value) {
    formData.append('empresa_id', empresaInput.value);
  }

  const result = await apiCall('/documentos', 'POST', formData, true);

  if (result && result.status) {
    showNotification('success', 'Éxito', 'Resolución subida correctamente.');
    document.getElementById('form-resolucion').reset();
    loadResoluciones();
  }
}

// --- 5. Validación de Rutas (CORE) ---

// Variable local para guardar los datos y poder filtrarlos sin recargar la API
let rutasCache = [];

async function loadRutasParaValidar() {
  const container = document.getElementById('rutas-validation-table');
  
  // 1. Estructura base con el Filtro (Asegurando w-full y espaciado)
  container.innerHTML = `
    <div class="bg-white p-4 rounded-t-lg border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h3 class="text-lg font-bold text-gray-800">Listado de Rutas</h3>
            <p class="text-sm text-gray-500">Gestione la aprobación de rutas subidas por las empresas.</p>
        </div>
        
        <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <label for="rutas-filter" class="text-sm font-bold text-gray-700">Mostrar:</label>
            <select id="rutas-filter" onchange="applyRutasFilter()" class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-1.5 px-3 bg-white cursor-pointer">
                <option value="all"> Todas</option>
                <option value="pending" selected> Pendientes</option>
                <option value="verified"> Aprobadas</option>
            </select>
        </div>
    </div>
    
    <div id="rutas-list-container" class="w-full bg-white rounded-b-lg shadow-sm min-h-[200px]">
        <div class="loading-state p-8"><p>Cargando rutas...</p></div>
    </div>
  `;

  // 2. Carga de Datos
  const res = await apiCall('/rutas?include=empresa&limit=200');

  if (!res || !res.data || !res.data.data) {
    document.getElementById('rutas-list-container').innerHTML = '<div class="empty-state p-8"><p>Error al cargar datos.</p></div>';
    return;
  }

  rutasCache = res.data.data;
  
  if (rutasCache.length === 0) {
    document.getElementById('rutas-list-container').innerHTML = '<div class="empty-state p-8"><p>No se encontraron rutas registradas.</p></div>';
    return;
  }

  applyRutasFilter();
}

/**
 * Función para aplicar el filtro y redibujar la tabla
 */
window.applyRutasFilter = function() {
    const filterValue = document.getElementById('rutas-filter').value;
    const container = document.getElementById('rutas-list-container');
    
    // Lógica de filtrado local
    const filteredData = rutasCache.filter(r => {
        const isVerified = r.name.includes('✅') || r.name.includes('[OK]');
        if (filterValue === 'pending') return !isVerified;
        if (filterValue === 'verified') return isVerified;
        return true; // 'all'
    });

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="p-6 text-center bg-gray-50 rounded border border-dashed text-gray-500">
            No hay rutas <strong>${filterValue === 'pending' ? 'pendientes' : filterValue === 'verified' ? 'verificadas' : ''}</strong> para mostrar.
        </div>`;
        return;
    }

    renderRutasTable(filteredData, container);
};

/**
 * Renderizador de la tabla (DISEÑO AMPLIADO)
 */
function renderRutasTable(data, container) {
  // Usamos w-full y min-w-full para forzar el ancho
  let html = `<div class="overflow-x-auto w-full">
    <table class="min-w-full divide-y divide-gray-200 table-fixed">
        <thead class="bg-gray-100">
            <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">
                    Empresa
                </th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/3">
                    Nombre Ruta
                </th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">
                    Archivo
                </th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">
                    Estado
                </th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">
                    Acción
                </th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">`;

  data.forEach(r => {
    const isVerified = r.name.includes('✅') || r.name.includes('[OK]');
    const cleanName = r.name.replace('✅', '').replace('[OK]', '').trim();
    const safeName = cleanName.replace(/'/g, "\\'");
    
    const empresaName = r.empresa 
        ? `<span class="font-semibold text-gray-900 text-sm">${r.empresa.name}</span>` 
        : '<span class="text-red-400 text-sm italic">Sin Empresa</span>';
    
    const hasFile = r.file_name !== null && r.file_name !== "";

    // Badges más grandes (text-sm en vez de text-xs)
    const statusBadge = isVerified ?
      `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
        Verificada
       </span>` :
      `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        Pendiente
       </span>`;

    // Botones más grandes y legibles
    let btnAction = '';
    if (isVerified) {
        btnAction = `<button class="inline-flex items-center justify-center w-full px-3 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition" 
                             onclick="cancelarVerificacion(${r.id}, '${safeName}', ${r.empresa_id})">
                        Desaprobar
                     </button>`;
    } else {
        btnAction = `<button class="inline-flex items-center justify-center w-full px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition" 
                             onclick="verificarRuta(${r.id}, '${safeName}', ${r.empresa_id})">
                        ✅ Aprobar
                     </button>`;
    }

    const btnFile = hasFile ?
      `<button onclick="downloadRutaFile(${r.id})" class="text-blue-600 hover:text-blue-900 font-medium text-sm flex flex-col items-center group">
          <svg class="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span class="text-xs">Descargar</span>
       </button>` :
      `<span class="text-gray-300 text-sm italic">--</span>`;

    html += `
            <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 align-middle">
                    ${empresaName}
                    <div class="text-xs text-gray-500 mt-1">NIT: ${r.empresa ? r.empresa.nit : 'N/A'}</div>
                </td>
                <td class="px-6 py-4 align-middle">
                    <div class="text-sm text-gray-900 font-medium">${cleanName}</div>
                </td>
                <td class="px-6 py-4 align-middle text-center">${btnFile}</td>
                <td class="px-6 py-4 align-middle text-center">${statusBadge}</td>
                <td class="px-6 py-4 align-middle text-center">${btnAction}</td>
            </tr>
        `;
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}
// Descarga de rutas
window.downloadRutaFile = async function (id) {
  showNotification('info', 'Solicitando KML', 'Iniciando descarga de ruta...');
  const token = getToken();

  try {
    const response = await fetch(`/api/rutas/${id}/file`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("El archivo KML no está disponible.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruta_${id}.kml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch {
    showNotification('error', 'Archivo no encontrado', 'Esta ruta no tiene un archivo KML asociado.');
  }
}

/**
 * APROBAR RUTA (Agrega Check)
 */
window.verificarRuta = async function (id, currentName, empresaId) {
  if (!confirm(`¿Aprobar la ruta "${currentName}"?`)) return;

  const newName = `${currentName} ✅`;
  
  const formData = new FormData();
  formData.append('name', newName);
  formData.append('empresa_id', empresaId);

  const result = await apiCall(`/rutas/${id}`, 'POST', formData);

  if (result && result.status) {
    showNotification('success', 'Verificada', 'Ruta marcada como verificada.');
    
    // Actualizamos el cache local y repintamos para no recargar toda la API
    updateLocalCache(id, newName);
    applyRutasFilter(); // Refresca la vista actual
  }
};

/**
 * CANCELAR VERIFICACIÓN (Quita Check)
 */
window.cancelarVerificacion = async function (id, currentName, empresaId) {
    if (!confirm(`¿Desaprobar la ruta "${currentName}"?`)) return;

    const formData = new FormData();
    formData.append('name', currentName); // El nombre ya viene limpio desde el render
    formData.append('empresa_id', empresaId);

    const result = await apiCall(`/rutas/${id}`, 'POST', formData);

    if (result && result.status) {
      showNotification('info', 'Actualizado', 'La ruta ha vuelto a estado pendiente.');
      
      // Actualizamos cache local
      updateLocalCache(id, currentName);
      applyRutasFilter();
    }
};

/**
 * Helper para actualizar el array local y que la UI sea rápida
 */
function updateLocalCache(id, newName) {
    const idx = rutasCache.findIndex(r => r.id === id);
    if (idx !== -1) {
        rutasCache[idx].name = newName;
    }
}

// --- 6. Reportes Empresas ---
async function loadEmpresas() {
  const container = document.getElementById('empresas-report-table');
  container.innerHTML = '<div class="loading-state"><p>Generando reporte...</p></div>';

  try {
    const [empresasRes, rutasRes] = await Promise.all([
        apiCall('/empresas?limit=100'),
        apiCall('/rutas?limit=100')
    ]);

    const empresas = empresasRes?.data?.data || [];
    const rutas = rutasRes?.data?.data || [];

    let html = `<table class="modern-table"><thead><tr><th>NIT</th><th>Empresa</th><th>Rutas Registradas</th></tr></thead><tbody>`;

    empresas.forEach(e => {
      const count = rutas.filter(r => r.empresa_id === e.id).length;
      html += `
                <tr>
                    <td>${e.nit}</td>
                    <td>${e.name}</td>
                    <td><strong>${count}</strong></td>
                </tr>
            `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p style="color:red">Error al cargar datos: ${e.message}</p>`;
  }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  buildSecretariaMenu();
  loadStats();
  const defView = document.getElementById('view-resumen');
  if (defView) defView.style.display = 'block';
  const fRes = document.getElementById('form-resolucion');
  if (fRes) fRes.addEventListener('submit', handleSubirResolucion);
});