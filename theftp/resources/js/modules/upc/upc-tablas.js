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

    el.innerHTML = createTableFromArray(
        paginatedData,
        [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre de la Empresa' },
            { key: 'nit', label: 'NIT' },
            { key: 'tipo_empresa.descripcion', label: 'Tipo de Empresa' }
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

    const allTablaData = dashboardDataStore.conductores
        .map(c => {
            let licStatus = 'Sin Licencia';
            let licColor = 'text-gray-400';
            
            if (c.licencias && c.licencias.length > 0) {
                const lic = c.licencias[0].licencia || {};
                const fv = lic.fecha_vencimiento;
                if (fv) {
                    const diff = Math.ceil((new Date(fv) - new Date()) / (1000 * 60 * 60 * 24));
                    if (diff <= 0) { licStatus = 'VENCIDA'; licColor = 'text-red-600 font-bold'; }
                    else if (diff <= 30) { licStatus = 'POR VENCER'; licColor = 'text-yellow-600 font-bold'; }
                    else { licStatus = 'VIGENTE'; licColor = 'text-green-600 font-bold'; }
                } else {
                    licStatus = 'Registrada (Sin fecha)';
                    licColor = 'text-blue-600';
                }
            }

            return {
                id: c.id,
                persona: c.persona,
                nombres: c.persona ? c.persona.name : 'N/A',
                apellidos: c.persona ? c.persona.last_name : 'N/A',
                tipo_ident: c.persona && c.persona.tipo_ident ? c.persona.tipo_ident.descripcion : 'N/A',
                nui: c.persona ? c.persona.nui : 'N/A',
                licStatus,
                licColor
            };
        })
        .filter(c =>
            c.nombres.toLowerCase().includes(searchTerm) ||
            c.apellidos.toLowerCase().includes(searchTerm) ||
            c.nui.toLowerCase().includes(searchTerm)
        );

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.conductores;
    const start = (current - 1) * perPage;
    const paginatedData = allTablaData.slice(start, start + perPage);

    el.innerHTML = createTableFromArray(
        paginatedData,
        [
            { label: '#', render: (_, i) => start + i + 1 },
            { key: 'nombres', label: 'Nombres' },
            { key: 'apellidos', label: 'Apellidos' },
            { key: 'nui', label: 'Identificación' },
            { 
                label: 'Estado Licencia', 
                render: (row) => `<span class="${row.licColor}">${row.licStatus}</span>` 
            }
        ],
        'No se encontraron conductores con ese filtro.'
    ) + renderPagination(allTablaData.length, current, perPage, "window.changeUpcPage.bind(null, 'conductores')");
};

window.loadConductores = async function () {
    const el = document.getElementById('conductores-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando conductores...</p></div>';
    try {
        const response = await apiGet('/api/conductores?include=persona,persona.tipo_ident,licencias.licencia&limit=100');
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
        .map(v => ({
            id: v.id,
            placa: v.placa,
            modelo: v.modelo,
            marca: v.marca,
            tipo_vehiculo: v.tipo ? v.tipo : { descripcion: 'N/A' }
        }))
        .filter(v =>
            v.placa.toLowerCase().includes(searchTerm) ||
            v.marca.toLowerCase().includes(searchTerm) ||
            v.modelo.toLowerCase().includes(searchTerm)
        );

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.vehiculos;
    const start = (current - 1) * perPage;
    const paginatedData = allVehiculosData.slice(start, start + perPage);

    el.innerHTML = createTableFromArray(
        paginatedData,
        [
            { key: 'id', label: 'ID' },
            { key: 'placa', label: 'Placa' },
            { key: 'modelo', label: 'Modelo' },
            { key: 'marca', label: 'Marca' },
            { key: 'tipo_vehiculo.descripcion', label: 'Tipo' }
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
        const matchEmpresa = !empresaId || (ruta.empresa_id == empresaId);
        const name = ruta.name ? ruta.name.toLowerCase() : '';
        const matchText = !searchTerm || name.includes(searchTerm);
        return matchEmpresa && matchText;
    });

    const tablaData = allFilteredData.map(r => ({
        id: r.id,
        name: r.name,
        file_name: r.file_name,
        empresa: r.empresa ? r.empresa.name : 'N/A'
    }));

    // Paginación
    const { current, perPage } = dashboardDataStore.pagination.rutas;
    const start = (current - 1) * perPage;
    const paginatedData = tablaData.slice(start, start + perPage);

    el.innerHTML = createTableFromArray(
        paginatedData,
        [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre Ruta' },
            { key: 'empresa', label: 'Empresa' },
            { key: 'file_name', label: 'Archivo' }
        ],
        'No se encontraron rutas con esos filtros.'
    ) + renderPagination(allFilteredData.length, current, perPage, "window.changeUpcPage.bind(null, 'rutas')");
};

window.loadRutas = async function () {
    const el = document.getElementById('rutas-table');
    el.innerHTML = 'Cargando...';
    try {
        const response = await apiGet('/api/rutas?include=empresa');
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
            { label: '#', render: (_, i) => start + i + 1 },
            { key: 'observaciones', label: 'Título/Observación' },
            { key: 'url', label: 'URL' },
            {
                label: 'Fecha',
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
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando documentos...</p></div>';
    try {
        const response = await apiGet('/api/documentos');
        dashboardDataStore.documentos = response.data.data;
        renderDocumentosTable();
    } catch (error) {
        el.innerHTML = `<div class='error-state'><p class='text-red-600 text-center py-8'>${error.message}</p></div>`;
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
