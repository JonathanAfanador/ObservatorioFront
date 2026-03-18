// ============================================================
// secretaria-rutas.js
// Validación de Rutas: cargar, filtrar, aprobar y desaprobar
// ============================================================

// Cache local de rutas (para filtrar sin volver a llamar la API)
let rutasCache = [];

// --- Cargar rutas con filtro y tabla ---
window.loadRutasParaValidar = async function () {
    const container = document.getElementById('rutas-validation-table');

    // 1. Estructura base con el Filtro
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
        document.getElementById('rutas-list-container').innerHTML =
            '<div class="empty-state p-8"><p>Error al cargar datos.</p></div>';
        return;
    }

    rutasCache = res.data.data;

    if (rutasCache.length === 0) {
        document.getElementById('rutas-list-container').innerHTML =
            '<div class="empty-state p-8"><p>No se encontraron rutas registradas.</p></div>';
        return;
    }

    applyRutasFilter();
};

// --- Aplicar filtro y redibujar la tabla ---
window.applyRutasFilter = function () {
    const filterValue = document.getElementById('rutas-filter').value;
    const container = document.getElementById('rutas-list-container');

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

// --- Renderizar la tabla de rutas ---
function renderRutasTable(data, container) {
    let html = `<div class="overflow-x-auto w-full">
    <table class="min-w-full divide-y divide-gray-200 table-fixed">
        <thead class="bg-gray-100">
            <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">Empresa</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/3">Nombre Ruta</th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">Archivo</th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">Estado</th>
                <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">Acción</th>
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

        const hasFile = r.file_name !== null && r.file_name !== '';

        const statusBadge = isVerified
            ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">Verificada</span>`
            : `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Pendiente</span>`;

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

        const btnFile = hasFile
            ? `<button onclick="downloadRutaFile(${r.id})" class="text-blue-600 hover:text-blue-900 font-medium text-sm flex flex-col items-center group">
            <svg class="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span class="text-xs">Descargar</span>
         </button>`
            : `<span class="text-gray-300 text-sm italic">--</span>`;

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

// --- Descargar archivo KML de la ruta ---
window.downloadRutaFile = async function (id) {
    showNotification('info', 'Solicitando KML', 'Iniciando descarga de ruta...');
    const token = getToken();

    try {
        const response = await fetch(`/api/rutas/${id}/file`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('El archivo KML no está disponible.');

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
};

// --- Aprobar ruta (agrega ✅) ---
window.verificarRuta = async function (id, currentName, empresaId) {
    if (!confirm(`¿Aprobar la ruta "${currentName}"?`)) return;

    const newName = `${currentName} ✅`;
    const formData = new FormData();
    formData.append('name', newName);
    formData.append('empresa_id', empresaId);

    const result = await apiCall(`/rutas/${id}`, 'POST', formData);

    if (result && result.status) {
        showNotification('success', 'Verificada', 'Ruta marcada como verificada.');
        updateLocalCache(id, newName);
        applyRutasFilter();
    }
};

// --- Desaprobar ruta (quita ✅) ---
window.cancelarVerificacion = async function (id, currentName, empresaId) {
    if (!confirm(`¿Desaprobar la ruta "${currentName}"?`)) return;

    const formData = new FormData();
    formData.append('name', currentName);
    formData.append('empresa_id', empresaId);

    const result = await apiCall(`/rutas/${id}`, 'POST', formData);

    if (result && result.status) {
        showNotification('info', 'Actualizado', 'La ruta ha vuelto a estado pendiente.');
        updateLocalCache(id, currentName);
        applyRutasFilter();
    }
};

// --- Actualizar el cache local (para respuesta inmediata en la UI) ---
function updateLocalCache(id, newName) {
    const idx = rutasCache.findIndex(r => r.id === id);
    if (idx !== -1) {
        rutasCache[idx].name = newName;
    }
}
