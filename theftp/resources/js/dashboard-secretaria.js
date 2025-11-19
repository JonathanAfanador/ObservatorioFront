// Dashboard Secretaría de Tránsito - Lógica de Supervisión (Versión Mejorada)
// ===========================================================================

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
    if(type === 'success') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if(type === 'error') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if(type === 'warning') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if(type === 'info') icon = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

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
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
    if (!isFile && body) headers['Content-Type'] = 'application/json';

    const config = { method, headers };
    if (body) config.body = isFile ? body : JSON.stringify(body);

    try {
        const url = `/api${endpoint}`;
        const res = await fetch(url, config);
        const contentType = res.headers.get("content-type");
        
        if (contentType && !contentType.includes("application/json")) return res;

        const json = await res.json();
        if (!res.ok) {
            if (res.status === 422 && json.errors) {
                console.error("Errores:", json.errors);
                const errorMsg = Object.entries(json.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
                throw new Error(`Validación fallida:\n${errorMsg}`);
            }
            throw new Error(json.message || `Error HTTP: ${res.status}`);
        }
        return json;
    } catch (err) {
        console.error("Fallo en API:", err);
        showNotification('error', 'Error de Sistema', err.message);
        return null;
    }
}

async function apiPatch(path, data) {
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' };

    try {
        const response = await fetch(`/api${path}`, { method: 'PATCH', headers: headers, body: JSON.stringify(data) });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || `Error (${response.status})`);
        return json;
    } catch (error) {
        showNotification('error', 'Error Actualización', error.message);
        return null;
    }
}

// --- 1. Menú Lateral ---
function buildSecretariaMenu() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;
    
    sidebarNav.innerHTML = `
        <p class="nav-section-title">Supervisión</p>
        <a href="#resumen" class="nav-link active" data-view="resumen">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span>Resumen General</span>
        </a>
        <a href="#resoluciones" class="nav-link" data-view="resoluciones">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>Gestión Resoluciones</span>
        </a>
        <a href="#rutas" class="nav-link" data-view="rutas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            <span>Validación Rutas</span>
        </a>
        <a href="#empresas" class="nav-link" data-view="empresas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
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
            if(view) {
                e.preventDefault();
                document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
                const target = document.getElementById(`view-${view}`);
                if(target) target.style.display = 'block';
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const headerTitle = document.getElementById('header-title');
                if(headerTitle) {
                    const titles = {'resumen': 'Panel de Supervisión', 'resoluciones': 'Gestión de Resoluciones', 'rutas': 'Validación de Rutas', 'empresas': 'Supervisión de Empresas'};
                    headerTitle.textContent = titles[view] || 'Dashboard';
                }
                loadViewData(view);
            }
        });
    });
}

async function loadViewData(view) {
    switch(view) {
        case 'resumen': loadStats(); break;
        case 'resoluciones': loadResoluciones(); break;
        case 'rutas': loadRutasParaValidar(); break;
        case 'empresas': loadEmpresas(); break;
    }
}

// --- 2. Estadísticas (Diseño Llamativo) ---
async function loadStats() {
    const filtroRes = encodeURIComponent(JSON.stringify([{ "column": "observaciones", "operator": "like", "value": "%Resolución%" }]));
    try {
        // Obtenemos datos (limit 1 para optimizar, solo queremos el total)
        const [empresas, rutas, resoluciones] = await Promise.all([
            apiCall('/empresas?limit=1'),
            apiCall('/rutas?limit=1'),
            apiCall(`/documentos?filter=${filtroRes}&limit=1`)
        ]);

        const totalEmpresas = empresas.total || 0;
        const totalRutas = rutas.total || 0;
        const totalResoluciones = resoluciones.total || 0;

        // Inyectamos HTML 
    
        const container = document.querySelector('#view-resumen .stat-grid'); 
        if(container) {
            container.innerHTML = `
                <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                    <div class="relative z-10">
                        <div class="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Empresas</div>
                        <div class="text-4xl font-bold">${totalEmpresas}</div>
                        <div class="mt-4 text-blue-200 text-xs">Entidades vigiladas activas</div>
                    </div>
                    <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-2 translate-y-2">
                         <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                </div>

                <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                    <div class="relative z-10">
                        <div class="text-purple-100 text-sm font-medium uppercase tracking-wider mb-1">Rutas</div>
                        <div class="text-4xl font-bold">${totalRutas}</div>
                        <div class="mt-4 text-purple-200 text-xs">Trazados registrados</div>
                    </div>
                    <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-2 translate-y-2">
                         <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    </div>
                </div>

                <div class="stat-card bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                    <div class="relative z-10">
                        <div class="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">Resoluciones</div>
                        <div class="text-4xl font-bold">${totalResoluciones}</div>
                        <div class="mt-4 text-emerald-200 text-xs">Documentos emitidos</div>
                    </div>
                    <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-2 translate-y-2">
                         <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                </div>
            `;
        }
    } catch(e) { console.error("Error stats:", e); }
}

// --- 3. Utilidad de Búsqueda ---
function renderTable(data, columns, containerId, emptyMsg = "No se encontraron datos.") {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="empty-state py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300"><p>${emptyMsg}</p></div>`;
        return;
    }

    let html = `<div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table class="min-w-full divide-y divide-gray-200 bg-white text-sm">
                    <thead class="bg-gray-50"><tr>`;
    
    columns.forEach(col => html += `<th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">${col.header}</th>`);
    
    html += `</tr></thead><tbody class="divide-y divide-gray-200">`;

    data.forEach(row => {
        html += `<tr class="hover:bg-gray-50 transition-colors">`;
        columns.forEach(col => {
            let val = col.key ? (row[col.key] || '') : col.render(row);
            html += `<td class="px-4 py-3 text-gray-700 whitespace-nowrap">${val}</td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// --- 4. Gestión de Resoluciones (Con Buscador) ---
async function loadResoluciones() {
    const container = document.getElementById('lista-resoluciones');
    container.innerHTML = '<div class="loading-state"><p>Cargando...</p></div>';

    // Inyectar input de búsqueda si no existe
    if (!document.getElementById('search-resoluciones')) {
        const controls = document.createElement('div');
        controls.className = "mb-4 flex justify-end";
        controls.innerHTML = `
            <div class="relative">
                <input type="text" id="search-resoluciones" placeholder="Buscar resolución..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        `;
        container.parentElement.insertBefore(controls, container);
        
        document.getElementById('search-resoluciones').addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = dashboardDataStore.resoluciones.filter(d => 
                (d.observaciones && d.observaciones.toLowerCase().includes(term)) ||
                (d.id && d.id.toString().includes(term))
            );
            renderResolucionesTable(filtered);
        });
    }

    const filtroRes = encodeURIComponent(JSON.stringify([{ "column": "observaciones", "operator": "like", "value": "%Resolución%" }]));
    const res = await apiCall(`/documentos?include=tipo_documento&filter=${filtroRes}&limit=100`);
    
    if (res && res.data) {
        // Guardamos los datos planos si viene paginado o no
        dashboardDataStore.resoluciones = res.data.data || res.data;
        renderResolucionesTable(dashboardDataStore.resoluciones);
    }
}

function renderResolucionesTable(data) {
    renderTable(data, [
        { header: 'ID', key: 'id' },
        { header: 'Detalle / Asunto', key: 'observaciones' },
        { header: 'Fecha', render: (row) => new Date(row.created_at).toLocaleDateString() },
        { header: 'Acción', render: (row) => `
            <button onclick="downloadDocumento(${row.id})" class="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> 
                Descargar
            </button>` 
        }
    ], 'lista-resoluciones');
}

// --- 5. Validación de Rutas (Con Buscador) ---
async function loadRutasParaValidar() {
    const container = document.getElementById('rutas-validation-table');
    
    // Inyectar input de búsqueda si no existe
    if (!document.getElementById('search-rutas')) {
        const controls = document.createElement('div');
        controls.className = "mb-4 flex justify-end";
        controls.innerHTML = `
            <div class="relative">
                <input type="text" id="search-rutas" placeholder="Buscar ruta o empresa..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        `;
        container.parentElement.insertBefore(controls, container);

        document.getElementById('search-rutas').addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = dashboardDataStore.rutas.filter(r => 
                (r.name && r.name.toLowerCase().includes(term)) ||
                (r.empresa && r.empresa.name.toLowerCase().includes(term))
            );
            renderRutasTable(filtered);
        });
    }

    const res = await apiCall('/rutas?include=empresa&limit=100');
    if (res && res.data) {
        dashboardDataStore.rutas = res.data.data || res.data;
        renderRutasTable(dashboardDataStore.rutas);
    }
}

function renderRutasTable(data) {
    renderTable(data, [
        { header: 'Empresa', render: (r) => r.empresa ? `<span class="font-semibold text-gray-800">${r.empresa.name}</span>` : 'N/A' },
        { header: 'Nombre Ruta', render: (r) => r.name.replace('✅', '').replace('[OK]', '') },
        { header: 'Archivo KML', render: (r) => r.file_name ? 
            `<button onclick="downloadRutaFile(${r.id})" class="text-blue-600 hover:text-blue-800" title="Descargar KML"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>` : 
            '<span class="text-gray-400 text-xs italic">Sin archivo</span>' 
        },
        { header: 'Estado', render: (r) => {
            const isVerified = r.name.includes('✅');
            return isVerified 
                ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><svg class="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg> Verificada</span>`
                : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><svg class="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg> Pendiente</span>`;
        }},
        { header: 'Acción', render: (r) => {
            const isVerified = r.name.includes('✅');
            const cleanName = r.name.replace('✅', '').trim();
            return isVerified
                ? `<button disabled class="text-gray-400 cursor-not-allowed text-xs font-medium">Aprobada</button>`
                : `<button onclick="verificarRuta(${r.id}, '${cleanName}', ${r.empresa_id})" class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium transition-colors shadow-sm">Aprobar</button>`;
        }}
    ], 'rutas-validation-table');
}

// --- 6. Reportes Empresas (Con Buscador) ---
async function loadEmpresas() {
    const container = document.getElementById('empresas-report-table');
    
    // Inyectar buscador
    if (!document.getElementById('search-empresas')) {
        const controls = document.createElement('div');
        controls.className = "mb-4 flex justify-end";
        controls.innerHTML = `
            <div class="relative">
                <input type="text" id="search-empresas" placeholder="Buscar por nombre o NIT..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm w-64">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        `;
        container.parentElement.insertBefore(controls, container);

        document.getElementById('search-empresas').addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = dashboardDataStore.empresas.filter(ent => 
                (ent.name && ent.name.toLowerCase().includes(term)) ||
                (ent.nit && ent.nit.includes(term))
            );
            renderEmpresasTable(filtered);
        });
    }

    try {
        const [empRes, rutRes] = await Promise.all([
            apiCall('/empresas?limit=100'),
            apiCall('/rutas?limit=100')
        ]);
        
        const empresasList = empRes?.data?.data || [];
        const rutasList = rutRes?.data?.data || [];
        
        // Enriquecer datos de empresas con conteo de rutas
        dashboardDataStore.empresas = empresasList.map(e => {
            e.totalRutas = rutasList.filter(r => r.empresa_id === e.id).length;
            return e;
        });
        
        renderEmpresasTable(dashboardDataStore.empresas);
    } catch (e) { console.error(e); }
}

function renderEmpresasTable(data) {
    renderTable(data, [
        { header: 'NIT', key: 'nit' },
        { header: 'Nombre Empresa', render: (e) => `<span class="font-semibold text-gray-700">${e.name}</span>` },
        { header: 'Rutas Registradas', render: (e) => `<span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">${e.totalRutas}</span>` }
    ], 'empresas-report-table');
}

// --- Lógica Negocio (Descargas y Acciones) ---
window.downloadDocumento = async function(id) {
    showNotification('info', 'Descargando', 'Solicitando archivo...');
    const token = getToken();
    try {
        const response = await fetch(`/api/documentos/${id}/file`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (e) { showNotification('error', 'Error', 'No se pudo descargar.'); }
};

window.downloadRutaFile = async function(id) {
    showNotification('info', 'Descargando', 'Solicitando KML...');
    const token = getToken();
    try {
        const response = await fetch(`/api/rutas/${id}/file`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ruta_${id}.kml`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (e) { showNotification('error', 'Error', 'Archivo no disponible.'); }
};

window.verificarRuta = async function(id, name, empresaId) {
    if(!confirm(`¿Aprobar ruta "${name}"?`)) return;
    const newName = `${name} ✅`;
    const payload = { name: newName, empresa_id: empresaId };
    const result = await apiPatch(`/rutas/${id}`, payload);
    if(result && result.status) {
        showNotification('success', 'Aprobada', 'Estado actualizado.');
        loadRutasParaValidar();
    }
};

async function handleSubirResolucion(e) {
    e.preventDefault();
    const fileInput = document.getElementById('res-file');
    const obsInput = document.getElementById('res-obs');
    if(fileInput.files.length === 0) return showNotification('warning', '!', 'Falta archivo.');
    
    const filtroTipo = encodeURIComponent(JSON.stringify([{ "column": "descripcion", "operator": "like", "value": "%Resolución%" }]));
    const tipos = await apiCall(`/tipo_doc?filter=${filtroTipo}`);
    let tipoId = (tipos?.data?.data?.length > 0) ? tipos.data.data[0].id : 1;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('observaciones', `Resolución: ${obsInput.value}`);
    formData.append('tipo_doc_id', tipoId);

    const result = await apiCall('/documentos', 'POST', formData, true);
    if (result?.status) {
        showNotification('success', 'Éxito', 'Resolución guardada.');
        document.getElementById('form-resolucion').reset();
        loadResoluciones();
    }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    buildSecretariaMenu();
    loadStats();
    const defView = document.getElementById('view-resumen');
    if(defView) defView.style.display = 'block';
    const fRes = document.getElementById('form-resolucion');
    if(fRes) fRes.addEventListener('submit', handleSubirResolucion);
});