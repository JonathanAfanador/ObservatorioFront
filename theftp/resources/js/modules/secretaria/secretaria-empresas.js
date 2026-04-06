// ============================================================
// secretaria-empresas.js
// Reporte de Empresas: Formato de Auditoría con filtros y métricas
// ============================================================

// Estructura para búsqueda local
// Estructura para búsqueda y paginación local
window.allEmpresasAudit = [];
window.filteredEmpresasAudit = []; 
window.currentPageAudit = 1;
window.pageSizeAudit = 10;

// --- Estadísticas del panel resumen ---
window.loadStats = async function () {
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

        const elEmpresas = document.getElementById('stat-empresas');
        const elRutas = document.getElementById('stat-rutas');
        const elResoluciones = document.getElementById('stat-resoluciones');

        if (elEmpresas && empresas) elEmpresas.innerText = empresas.total || 0;
        if (elRutas && rutas) elRutas.innerText = rutas.total || 0;
        if (elResoluciones && resoluciones) elResoluciones.innerText = resoluciones.total || 0;
    } catch (e) {
        console.error('Error stats:', e);
    }
};

// --- Reporte detallado tipo Auditoría ---
window.loadEmpresas = async function () {
    const container = document.getElementById('empresas-report-table');
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg class="w-12 h-12 mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <p>Sincronizando registros de auditoría...</p>
        </div>
    `;

    try {
        const [resEmp, resRut, resVeh] = await Promise.all([
            apiCall('/empresas?limit=500'),
            apiCall('/rutas?include=empresas&limit=1000'),
            apiCall('/vehiculos?limit=2000')
        ]);

        const empresas = normalizeList(resEmp);
        const rutas = normalizeList(resRut);
        const vehiculos = normalizeList(resVeh);

        window.allEmpresasAudit = empresas.map(emp => {
            const countRutas = rutas.filter(r => {
                const hasPivot = r.empresas && Array.isArray(r.empresas) && r.empresas.some(c => c.id === emp.id);
                const hasDirect = r.empresa_id === emp.id;
                return hasPivot || hasDirect;
            }).length;

            return {
                ...emp,
                numRutas: countRutas,
                numVehiculos: vehiculos.filter(v => v.empresa_id === emp.id).length
            };
        });

        window.filteredEmpresasAudit = [...window.allEmpresasAudit];
        window.currentPageAudit = 1;
        renderEmpresasTable();

    } catch (e) {
        console.error('Error en auditoría:', e);
        container.innerHTML = `<div class="p-4 text-red-500">Error: ${e.message}</div>`;
    }
};

// --- Renderizar la tabla de auditoría con Paginación ---
window.renderEmpresasTable = function () {
    const container = document.getElementById('empresas-report-table');
    const lista = window.filteredEmpresasAudit;
    
    if (lista.length === 0) {
        container.innerHTML = `<div class="py-12 text-center text-gray-500"><p>No se encontraron registros.</p></div>`;
        return;
    }

    const totalRecords = lista.length;
    const totalPages = Math.ceil(totalRecords / window.pageSizeAudit);
    const start = (window.currentPageAudit - 1) * window.pageSizeAudit;
    const end = start + window.pageSizeAudit;
    const pagedItems = lista.slice(start, end);

    let html = `
        <table class="modern-table text-sm min-w-[700px]">
            <thead>
                <tr>
                    <th class="w-32 text-slate-400 font-medium uppercase tracking-wider text-[10px]">NIT / RUT</th>
                    <th class="text-slate-700">Razón Social / Empresa</th>
                    <th class="text-center text-slate-700">Rutas Oficiales</th>
                    <th class="text-center text-slate-700">Flota Vehicular</th>
                </tr>
            </thead>
            <tbody>
    `;

    pagedItems.forEach(e => {
        const badgeRutas = e.numRutas > 0 
            ? `<div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200 bg-white shadow-sm">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span class="font-bold text-slate-700">${e.numRutas}</span>
                <span class="text-[11px] text-slate-500 uppercase font-medium">Asignadas</span>
               </div>`
            : `<div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-100 bg-slate-50/50">
                <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                <span class="text-[11px] text-slate-400 uppercase font-medium">Sin Rutas</span>
               </div>`;
            
        const badgeVehiculos = e.numVehiculos > 0
            ? `<div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200 bg-white shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-slate-700">${e.numVehiculos}</span>
                <span class="text-[11px] text-slate-500 uppercase font-medium">Unidades</span>
               </div>`
            : `<div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-100 bg-slate-50/50">
                <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                <span class="text-[11px] text-slate-400 uppercase font-medium">Sin Flota</span>
               </div>`;

        html += `
            <tr class="hover:bg-slate-50/40 transition-colors group">
                <td class="font-mono text-xs text-slate-400">${e.nit || 'N/A'}</td>
                <td>
                    <div class="font-bold text-slate-800">${e.name}</div>
                    <div class="text-[10px] text-slate-400 uppercase tracking-tight">${e.email || ''}</div>
                </td>
                <td class="text-center">${badgeRutas}</td>
                <td class="text-center">${badgeVehiculos}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Footer de Paginación
    html += `
        <div class="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <span class="text-xs text-slate-500 font-medium">
                Mostrando <span class="text-slate-800">${start + 1}</span> a <span class="text-slate-800">${Math.min(end, totalRecords)}</span> de <span class="text-slate-800">${totalRecords}</span> empresas
            </span>
            <div class="flex gap-2">
                <button onclick="changeAuditPage(${window.currentPageAudit - 1})" 
                        class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${window.currentPageAudit === 1 ? 'opacity-30 pointer-events-none' : 'active:scale-90'}"
                        title="Anterior">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <div class="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm">
                    Pág. ${window.currentPageAudit} / ${totalPages}
                </div>
                <button onclick="changeAuditPage(${window.currentPageAudit + 1})" 
                        class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${window.currentPageAudit === totalPages ? 'opacity-30 pointer-events-none' : 'active:scale-90'}"
                        title="Siguiente">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
};

// Cambiar de página
window.changeAuditPage = function(newPage) {
    const totalPages = Math.ceil(window.filteredEmpresasAudit.length / window.pageSizeAudit);
    if (newPage < 1 || newPage > totalPages) return;
    window.currentPageAudit = newPage;
    renderEmpresasTable();
    // Scroll suave hacia arriba de la tabla si fuera necesario
    document.getElementById('view-empresas').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Descargar Reporte General (Genera un CSV compatible con Excel)
window.downloadGeneralReport = function() {
    const data = window.filteredEmpresasAudit;
    if (data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    // Cabecera del CSV (Usamos punto y coma para mejor compatibilidad en sistemas en español)
    let csv = "NIT / RUT;Razon Social / Empresa;Rutas Oficiales;Flota Vehicular\n";

    // Filas del reporte
    data.forEach(e => {
        const cleanName = (e.name || 'Sin Nombre').replace(/;/g, ','); // Evitar rotura de celdas
        csv += `${e.nit || 'N/A'};${cleanName};${e.numRutas};${e.numVehiculos}\n`;
    });

    // Crear el archivo Blob con codificación UTF-8 y el BOM (Byte Order Mark) para Excel
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Auditoria_Empresas_${date}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar memoria del objeto URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

// --- Buscador en tiempo real ---
window.filterEmpresasTable = function (query) {
    if (!window.allEmpresasAudit) return;
    
    const text = query.toLowerCase().trim();
    if (!text) {
        window.filteredEmpresasAudit = [...window.allEmpresasAudit];
    } else {
        window.filteredEmpresasAudit = window.allEmpresasAudit.filter(e => {
            const nit = (e.nit || '').toLowerCase();
            const nom = (e.name || '').toLowerCase();
            return nit.includes(text) || nom.includes(text);
        });
    }

    window.currentPageAudit = 1; // Reiniciar a la primera página al buscar
    renderEmpresasTable();
};
