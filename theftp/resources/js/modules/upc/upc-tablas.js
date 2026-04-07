// ---------- PAGINACIÓN ----------

window.changeUpcPage = function (module, page) {
    if (!dashboardDataStore.pagination[module]) return;
    dashboardDataStore.pagination[module].current = page;

    // Re-renderizar la tabla correspondiente
    if (module === 'empresas') renderEmpresasTable();
    if (module === 'conductores') renderConductoresTable();
    if (module === 'vehiculos') renderVehiculosTable();
    if (module === 'rutas') renderRutasTable();
    if (module === 'documentos') renderDocumentosTable();

    // Efecto Premium: Scroll suave hacia la cabecera de la tabla al cambiar de página
    const tableId = `${module}-table`;
    const el = document.getElementById(tableId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// ---------- EMPRESAS ----------

window.renderEmpresasTable = function () {
    const el = document.getElementById('empresas-table');
    const filterInput = document.getElementById('filter-empresas');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';

    const allFilteredData = dashboardDataStore.empresas.filter(empresa => {
        const name = empresa.name ? empresa.name.toLowerCase() : '';
        const nit = empresa.nit ? empresa.nit.toLowerCase() : '';
        return name.includes(searchTerm) || nit.includes(searchTerm);
    });

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.empresas;
    const start = (current - 1) * perPage;
    const paginatedData = allFilteredData.slice(start, start + perPage);

    // Contador de resultados Premium
    const resultsCount = allFilteredData.length;
    const countHtml = `
        <div class="results-pill-container">
            <div class="results-pill">
                <span class="results-pill-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </span>
                <span class="results-pill-text">
                    <strong class="results-pill-number">${resultsCount}</strong> empresas registradas
                </span>
            </div>
        </div>
    `;

    el.innerHTML = countHtml + createTableFromArray(
        paginatedData,
        [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre de la Empresa' },
            { key: 'nit', label: 'NIT' },
            { 
                label: 'Tipo de Empresa',
                render: (row) => {
                    const desc = row.tipo_empresa ? row.tipo_empresa.descripcion : 'N/A';
                    return `<span class="badge-status badge-info">${desc}</span>`;
                }
            }
        ],
        'No se encontraron empresas con ese filtro.'
    ) + renderPagination(allFilteredData.length, current, perPage, "window.changeUpcPage.bind(null, 'empresas')");
};

window.loadEmpresas = async function () {
    const el = document.getElementById('empresas-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando empresas...</p></div>';
    try {
        const response = await apiGet('/api/empresas?include=tipo_empresa&limit=100');
        dashboardDataStore.empresas = response.data.data;
        renderEmpresasTable();
    } catch (error) {
        el.innerHTML = `<div class="error-state"><p class='text-red-600 text-center py-8'>Error al cargar empresas: ${error.message}</p></div>`;
    }
};

// ---------- CONDUCTORES ----------

window.renderConductoresTable = function () {
    const el = document.getElementById('conductores-table');
    const filterInput = document.getElementById('filter-conductores');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';

    // Filtrado y mapeo de datos
    const allTablaData = dashboardDataStore.conductores
        .map(c => {
            let licStatus = 'Sin Licencia';
            let badgeClass = 'badge-secondary'; // Gris suave
            
            if (c.licencias && c.licencias.length > 0) {
                const lic = c.licencias[0] || {};
                const fv = lic.fecha_vencimiento;
                if (fv) {
                    const diff = Math.ceil((new Date(fv) - new Date()) / (1000 * 60 * 60 * 24));
                    if (diff <= 0) { 
                        licStatus = 'VENCIDA'; 
                        badgeClass = 'badge-danger'; 
                    } else if (diff <= 30) { 
                        licStatus = 'POR VENCER'; 
                        badgeClass = 'badge-warning'; 
                    } else { 
                        licStatus = 'VIGENTE'; 
                        badgeClass = 'badge-success'; 
                    }
                } else {
                    licStatus = 'Registrada (Sin fecha)';
                    badgeClass = 'badge-info';
                }
            }

            return {
                id: c.id,
                nombres: c.persona ? c.persona.name : 'N/A',
                apellidos: c.persona ? c.persona.last_name : 'N/A',
                nui: c.persona ? c.persona.nui : 'N/A',
                licStatus,
                badgeClass
            };
        })
        .filter(c =>
            c.nombres.toLowerCase().includes(searchTerm) ||
            c.apellidos.toLowerCase().includes(searchTerm) ||
            c.nui.toLowerCase().includes(searchTerm)
        );

    // Contador de resultados Premium
    const resultsCount = allTablaData.length;
    const countHtml = `
        <div class="results-pill-container">
            <div class="results-pill">
                <span class="results-pill-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <span class="results-pill-text">
                    <strong class="results-pill-number">${resultsCount}</strong> conductores encontrados
                </span>
            </div>
        </div>
    `;

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.conductores;
    const start = (current - 1) * perPage;
    const paginatedData = allTablaData.slice(start, start + perPage);

    el.innerHTML = countHtml + createTableFromArray(
        paginatedData,
        [
            { label: '#', render: (_, i) => start + i + 1 },
            { key: 'nombres', label: 'Nombres' },
            { key: 'apellidos', label: 'Apellidos' },
            { key: 'nui', label: 'Identificación' },
            { 
                label: 'Estado Licencia', 
                render: (row) => `<span class="badge-status ${row.badgeClass}">${row.licStatus}</span>` 
            }
        ],
        'No se encontraron conductores con ese filtro.'
    ) + renderPagination(allTablaData.length, current, perPage, "window.changeUpcPage.bind(null, 'conductores')");
};

window.loadConductores = async function () {
    const el = document.getElementById('conductores-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando conductores...</p></div>';
    try {
        const response = await apiGet('/api/conductores?include=persona,persona.tipo_ident,licencias&limit=100');
        dashboardDataStore.conductores = response.data.data;
        renderConductoresTable();
    } catch (error) {
        el.innerHTML = `<div class="error-state"><p class='text-red-600 text-center py-8'>Error al cargar conductores: ${error.message}</p></div>`;
    }
};

// ---------- VEHÍCULOS ----------

window.renderVehiculosTable = function () {
    const el = document.getElementById('vehiculos-table');
    const filterInput = document.getElementById('filter-vehiculos');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';

    const allVehiculosData = dashboardDataStore.vehiculos
        .map(v => {
            const tipoDesc = v.tipo ? v.tipo.descripcion : 'N/A';
            let badgeClass = 'badge-secondary'; // Default

            // Asignar colores según tipo
            if (tipoDesc.toLowerCase().includes('bus')) badgeClass = 'badge-indigo';
            if (tipoDesc.toLowerCase().includes('micro')) badgeClass = 'badge-blue';
            if (tipoDesc.toLowerCase().includes('camio')) badgeClass = 'badge-orange';
            if (tipoDesc.toLowerCase().includes('auto')) badgeClass = 'badge-info';

            return {
                id: v.id,
                placa: v.placa,
                modelo: v.modelo,
                marca: v.marca,
                tipo_desc: tipoDesc,
                badgeClass
            };
        })
        .filter(v =>
            v.placa.toLowerCase().includes(searchTerm) ||
            v.marca.toLowerCase().includes(searchTerm) ||
            v.modelo.toLowerCase().includes(searchTerm)
        );

    // Contador de resultados Premium
    const resultsCount = allVehiculosData.length;
    const countHtml = `
        <div class="results-pill-container">
            <div class="results-pill">
                <span class="results-pill-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <span class="results-pill-text">
                    <strong class="results-pill-number">${resultsCount}</strong> vehículos en servicio encontrados
                </span>
            </div>
        </div>
    `;

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.vehiculos;
    const start = (current - 1) * perPage;
    const paginatedData = allVehiculosData.slice(start, start + perPage);

    el.innerHTML = countHtml + createTableFromArray(
        paginatedData,
        [
            { key: 'id', label: 'ID' },
            { key: 'placa', label: 'Placa' },
            { key: 'modelo', label: 'Modelo' },
            { key: 'marca', label: 'Marca' },
            { 
                label: 'Tipo', 
                render: (row) => `<span class="badge-status ${row.badgeClass}">${row.tipo_desc}</span>` 
            }
        ],
        'No se encontraron vehículos con ese filtro.'
    ) + renderPagination(allVehiculosData.length, current, perPage, "window.changeUpcPage.bind(null, 'vehiculos')");
};

window.loadVehiculos = async function () {
    const el = document.getElementById('vehiculos-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando vehículos...</p></div>';
    try {
        const filtro = { "column": "servicio", "operator": "=", "value": true };
        const params = `?filter=${encodeURIComponent(JSON.stringify(filtro))}&include=tipo&limit=100`;
        const response = await apiGet('/api/vehiculos' + params);
        dashboardDataStore.vehiculos = response.data.data;
        renderVehiculosTable();
    } catch (error) {
        el.innerHTML = `<div class="error-state"><p class='text-red-600 text-center py-8'>Error al cargar vehículos: ${error.message}</p></div>`;
    }
};

// ---------- RUTAS ----------

window.renderRutasTable = function () {
    const el = document.getElementById('rutas-table');
    const filterSelect = document.getElementById('select-empresa-rutas');
    const filterInput = document.getElementById('filter-rutas');

    const empresaId = filterSelect ? filterSelect.value : '';
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';

    const allFilteredData = dashboardDataStore.rutas.filter(ruta => {
        const matchEmpresa = !empresaId || (ruta.empresas && ruta.empresas.some(e => e.id == empresaId));
        const name = ruta.name ? ruta.name.toLowerCase() : '';
        const matchText = !searchTerm || name.includes(searchTerm);
        return matchEmpresa && matchText;
    });

    const tablaData = allFilteredData.map(r => ({
        id: r.id,
        name: r.name,
        file_name: r.file_name,
        paraderos_count: (r.paraderos && r.paraderos.length) ? r.paraderos.length : 0,
        empresa: (r.empresas && r.empresas.length > 0) ? r.empresas[0].name : 'N/A'
    }));

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.rutas;
    const start = (current - 1) * perPage;
    const paginatedData = tablaData.slice(start, start + perPage);

    // Contador de resultados Premium
    const resultsCount = allFilteredData.length;
    const countHtml = `
        <div class="results-pill-container">
            <div class="results-pill">
                <span class="results-pill-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </span>
                <span class="results-pill-text">
                    <strong class="results-pill-number">${resultsCount}</strong> rutas autorizadas
                </span>
            </div>
        </div>
    `;

    el.innerHTML = countHtml + createTableFromArray(
        paginatedData,
        [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre de Ruta' },
            { key: 'empresa', label: 'Empresa Responsable' },
            { 
                label: 'Estado Respaldo',
                render: (row) => {
                    // Auditoría Ultra-Estricta: Trazado + Paraderos
                    const f = row.file_name ? String(row.file_name).trim().toLowerCase() : '';
                    
                    // Lista negra extendida de valores basura y archivos vacíos conocidos
                    const blackList = [
                        'undefined', 'null', 'n/a', 'none', 'no', 'default', 'error', 'vacio', 
                        'pendiente', 'error.kml', 'ruta.kml', 'centro-occidente.kml', 'centro.kml'
                    ];
                    
                    const hasRouteFile = f !== '' && 
                                   f.length > 5 && 
                                   !blackList.includes(f) &&
                                   !f.includes('undefined') && 
                                   !f.includes('placeholder') &&
                                   (f.includes('.') || f.includes('/'));

                    const hasStops = row.paraderos_count > 0;

                    if (hasRouteFile && hasStops) {
                        return `<span class="badge-status badge-success" title="${f}">DOCUMENTADO</span>`;
                    } else if (!hasRouteFile && !hasStops) {
                        return `<span class="badge-status badge-danger" title="${f}">PENDIENTE TOTAL</span>`;
                    } else if (!hasRouteFile) {
                        return `<span class="badge-status badge-warning" title="${f}">SIN TRAZADO KML</span>`;
                    } else {
                        return `<span class="badge-status badge-warning" title="${f}">SIN PARADEROS</span>`;
                    }
                }
            },
            {
                label: 'GeoVisor',
                render: () => `
                    <button class="btn-sm btn-primary" onclick="window.open('/geovisor', '_blank')" title="Abrir GeoVisor en nueva pestaña">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Ver Mapa</span>
                    </button>
                `
            }
        ],
        'No hay rutas registradas para esta empresa.'
    ) + renderPagination(allFilteredData.length, current, perPage, "window.changeUpcPage.bind(null, 'rutas')");
};

window.loadRutas = async function () {
    const el = document.getElementById('rutas-table');
    el.innerHTML = 'Cargando...';
    try {
        const response = await apiGet('/api/rutas?include=empresas,paraderos');
        dashboardDataStore.rutas = response.data.data;
        renderRutasTable();
    } catch (error) {
        el.innerHTML = `<p class='text-red-600'>${error.message}</p>`;
    }
};

window.loadEmpresasSelect = async function () {
    const sel = document.getElementById('select-empresa-rutas');
    if (!sel) return;
    sel.innerHTML = '<option value="">Cargando empresas...</option>';
    try {
        const response = await apiGet('/api/empresas');
        sel.innerHTML = '<option value="">-- Todas las empresas --</option>' +
            response.data.data.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
    } catch {
        sel.innerHTML = '<option value="">Error al cargar</option>';
    }
};

// ---------- DOCUMENTOS ----------

window.renderDocumentosTable = function () {
    const el = document.getElementById('documentos-table');
    const filterSelect = document.getElementById('select-tipo-docs');
    const filterInput = document.getElementById('filter-documentos');

    const tipoId = filterSelect ? filterSelect.value : '';
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';

    const allFilteredData = dashboardDataStore.documentos.filter(doc => {
        const matchTipo = !tipoId || (doc.tipo_doc_id == tipoId);
        const obs = doc.observaciones ? doc.observaciones.toLowerCase() : '';
        const url = doc.url ? doc.url.toLowerCase() : '';
        const matchText = !searchTerm || obs.includes(searchTerm) || url.includes(searchTerm);
        return matchTipo && matchText;
    });

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.documentos;
    const start = (current - 1) * perPage;
    const paginatedData = allFilteredData.slice(start, start + perPage);

    el.innerHTML = createTableFromArray(
        paginatedData,
        [
            { 
                label: 'Empresa Responsable', 
                render: (item) => `<span class="text-sm font-medium text-gray-700">${item.empresa ? item.empresa.name : 'VINCULACIÓN PENDIENTE'}</span>`
            },
            {
                label: 'Categoría',
                render: (item) => {
                    const desc = item.tipo_documento ? item.tipo_documento.descripcion : 'SIN CATEGORÍA';
                    let badgeClass = 'badge-info';
                    if (desc.toLowerCase().includes('resol')) badgeClass = 'badge-success';
                    if (desc.toLowerCase().includes('licen')) badgeClass = 'badge-blue';
                    return `<span class="badge-status ${badgeClass}">${desc}</span>`;
                }
            },
            { key: 'observaciones', label: 'Observaciones/Título' },
            {
                label: 'Evidencia',
                render: (item) => {
                    if (!item.url) return '<span class="text-gray-400 italic">No disponible</span>';
                    return `
                        <button class="btn-sm btn-outline" onclick="window.open('${item.url}', '_blank')" title="Ver Archivo Original">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Ver Documento</span>
                        </button>
                    `;
                }
            },
            {
                label: 'Fecha Registro',
                render: (item) => {
                    if (!item.created_at) return '-';
                    const d = new Date(item.created_at);
                    return isNaN(d) ? '-' : d.toLocaleDateString('es-CO');
                }
            }
        ],
        'No se encontraron documentos con esos filtros.'
    ) + renderPagination(allFilteredData.length, current, perPage, "window.changeUpcPage.bind(null, 'documentos')");
};

window.loadDocumentos = async function () {
    const el = document.getElementById('documentos-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando repositorio de evidencias...</p></div>';
    try {
        const response = await apiGet('/api/documentos?include=tipo_documento,empresa&limit=100');
        dashboardDataStore.documentos = response.data.data;
        renderDocumentosTable();
    } catch (error) {
        el.innerHTML = `<div class='error-state'><p class='text-red-600 text-center py-8'>Error de acceso al repositorio: ${error.message}</p></div>`;
    }
};

window.loadTiposDocs = async function () {
    const sel = document.getElementById('select-tipo-docs');
    sel.innerHTML = '<option value="">Cargando tipos...</option>';
    try {
        const response = await apiGet('/api/tipo_doc');
        sel.innerHTML = '<option value="">-- Todos los tipos --</option>' +
            response.data.data.map(i => `<option value="${i.id}">${i.descripcion}</option>`).join('');
    } catch {
        sel.innerHTML = '<option value="">Error al cargar</option>';
    }
};
