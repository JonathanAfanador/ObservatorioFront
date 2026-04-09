// ============================================================
// secretaria-propietarios.js
// Lógica de auditoría y revisión de propietarios con paginación compacta
// ============================================================

let allPropietariosReview = []; // Cache maestros
let filteredPropietariosReview = []; // Cache filtrado
let currentPagePropietarios = 1;
const itemsPerPagePropietarios = 10;

window.loadPropietariosReview = async function () {
    const container = document.getElementById('propietarios-review-table');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-gray-400">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Sincronizando registros oficiales...</p>
        </div>
    `;

    try {
        const resp = await apiCall('/propietarios?include=persona.tipo_ident,empresa,documento');
        allPropietariosReview = normalizeList(resp);
        
        // Ordenar por última modificación (descendente) por defecto
        allPropietariosReview.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        filteredPropietariosReview = [...allPropietariosReview];
        currentPagePropietarios = 1;

        renderPropietariosWithPagination();
    } catch (err) {
        console.error('Error al cargar propietarios:', err);
        container.innerHTML = '<div class="p-8 text-center text-red-500 font-bold uppercase tracking-widest text-xs">Error de conexión al cargar la base de datos</div>';
    }
};

/**
 * Filtra los propietarios lógicamente y reinicia la paginación
 */
window.filterPropietariosReview = function (query) {
    const q = query.trim().toLowerCase();
    
    if (!q) {
        filteredPropietariosReview = [...allPropietariosReview];
    } else {
        filteredPropietariosReview = allPropietariosReview.filter(p => {
            const nombre = `${getSafeData(p, 'persona.name', '')} ${getSafeData(p, 'persona.last_name', '')}`.toLowerCase();
            const ident = getSafeData(p, 'persona.nui', '').toLowerCase();
            const empresa = getSafeData(p, 'empresa.name', '').toLowerCase();
            return nombre.includes(q) || ident.includes(q) || empresa.includes(q);
        });
    }

    currentPagePropietarios = 1;
    renderPropietariosWithPagination();
};

/**
 * Renderiza la página actual de la tabla con paginación integrada
 */
function renderPropietariosWithPagination() {
    const container = document.getElementById('propietarios-review-table');
    const lista = filteredPropietariosReview;
    
    if (lista.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center text-slate-500 bg-white">
                <svg class="w-12 h-12 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p class="font-bold text-sm uppercase tracking-wide">No se encontraron registros coincidentes</p>
            </div>
        `;
        return;
    }

    // Calcular límites
    const totalRecords = lista.length;
    const totalPages = Math.ceil(totalRecords / itemsPerPagePropietarios);
    const start = (currentPagePropietarios - 1) * itemsPerPagePropietarios;
    const end = start + itemsPerPagePropietarios;
    const pageItems = lista.slice(start, end);

    let html = `
        <table class="modern-table">
            <thead>
                <tr>
                    <th>Propietario / Responsable</th>
                    <th>Identificación</th>
                    <th>Empresa Asociada</th>
                    <th>Última Modificación</th>
                    <th>Tarjeta de Propiedad</th>
                </tr>
            </thead>
            <tbody>
    `;

    pageItems.forEach(p => {
        const nombre = getSafeData(p, 'persona.name', '');
        const apellido = getSafeData(p, 'persona.last_name', '');
        const nombreCompleto = `${nombre} ${apellido}`.trim() || 'N/A';
        const tipoDoc = getSafeData(p, 'persona.tipo_ident.nombre', 'Documento');
        const numeroIdent = getSafeData(p, 'persona.nui', 'N/A');
        const nitEmpresa = getSafeData(p, 'empresa.nit');
        const nombreEmpresa = getSafeData(p, 'empresa.name');
        
        let docHtml = '<span class="text-slate-300 text-[10px] italic">Sin soporte cargado</span>';
        
        if (p.documento && p.documento.url) {
            let fileUrl = p.documento.url;
            if (!fileUrl.startsWith('http')) {
                const cleanPath = fileUrl.replace(/^\/?storage\//, '');
                fileUrl = `/storage/${cleanPath}`;
            }

            docHtml = `<button onclick="previewDocument('${fileUrl}', 'Tarjeta de Propiedad - ${nombreCompleto}')" 
                       class="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-black text-[10px] uppercase tracking-wider group transition-all">
                   <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                   Consultar Soporte
               </button>`;
        }

        const renderPropietario = (r) => {
            if (!r.persona) {
                return `
                    <span style="color: #ff0000; font-weight: bold; font-style: italic; text-transform: uppercase; font-size: 11px; letter-spacing: 0.02em;">
                        SIN PERSONA ASOCIADA
                    </span>
                `;
            }
            return `
                <div class="flex flex-col">
                    <span class="font-black text-slate-800 uppercase tracking-tight text-[11px] leading-tight">${r.persona.name || ''} ${r.persona.last_name || ''}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${r.persona.tipo_ident?.nombre || 'ID'}: ${r.persona.nui || 'S/N'}</span>
                </div>
            `;
        };

        html += `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="py-4">
                    ${renderPropietario(p)}
                </td>
                <td class="font-mono text-xs font-bold text-slate-600">${getSafeData(p, 'persona.nui', 'N/A')}</td>
                <td>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-700">${nombreEmpresa}</span>
                        <span class="text-[9px] text-slate-400 font-mono tracking-tighter">NIT: ${nitEmpresa}</span>
                    </div>
                </td>
                <td class="text-xs text-slate-500">${formatDate(p.updated_at)}</td>
                <td>${docHtml}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Footer de Paginación Compacta (Estilo Reporte Empresas)
    html += `
        <div class="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <span class="text-xs text-slate-500 font-medium">
                Mostrando <span class="text-slate-800">${start + 1}</span> a <span class="text-slate-800">${Math.min(end, totalRecords)}</span> de <span class="text-slate-800">${totalRecords}</span> propietarios
            </span>
            <div class="flex gap-2">
                <button onclick="changePropietariosPage(${currentPagePropietarios - 1})" 
                        class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all ${currentPagePropietarios === 1 ? 'opacity-30 pointer-events-none' : 'active:scale-95 shadow-sm'}"
                        title="Anterior">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <div class="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm">
                    Pág. ${currentPagePropietarios} / ${totalPages}
                </div>
                <button onclick="changePropietariosPage(${currentPagePropietarios + 1})" 
                        class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all ${currentPagePropietarios === totalPages ? 'opacity-30 pointer-events-none' : 'active:scale-95 shadow-sm'}"
                        title="Siguiente">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Cambia la página y vuelve a renderizar
 */
window.changePropietariosPage = function (newPage) {
    currentPagePropietarios = newPage;
    renderPropietariosWithPagination();
    
    // Scroll suave hacia arriba si es necesario
    const tableContainer = document.getElementById('view-propietarios');
    tableContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
