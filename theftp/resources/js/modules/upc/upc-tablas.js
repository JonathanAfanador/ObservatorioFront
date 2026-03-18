// ============================================================
// upc-tablas.js
// Carga y renderizado de las 5 tablas: empresas, conductores,
// vehículos, rutas y documentos. Incluye lógica de filtros.
// ============================================================

// ---------- EMPRESAS ----------

window.renderEmpresasTable = function () {
    const el = document.getElementById('empresas-table');
    const filterInput = document.getElementById('filter-empresas');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';

    const filteredData = dashboardDataStore.empresas.filter(empresa => {
        const name = empresa.name ? empresa.name.toLowerCase() : '';
        const nit = empresa.nit ? empresa.nit.toLowerCase() : '';
        return name.includes(searchTerm) || nit.includes(searchTerm);
    });

    el.innerHTML = createTableFromArray(
        filteredData,
        [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre de la Empresa' },
            { key: 'nit', label: 'NIT' },
            { key: 'tipo_empresa.descripcion', label: 'Tipo de Empresa' }
        ],
        'No se encontraron empresas con ese filtro.'
    );
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

    const tablaData = dashboardDataStore.conductores
        .map(c => ({
            id: c.id,
            persona: c.persona,
            nombres: c.persona ? c.persona.name : 'N/A',
            apellidos: c.persona ? c.persona.last_name : 'N/A',
            tipo_ident: c.persona && c.persona.tipo_ident ? c.persona.tipo_ident.descripcion : 'N/A',
            nui: c.persona ? c.persona.nui : 'N/A',
            gender: c.persona ? c.persona.gender : 'N/A'
        }))
        .filter(c =>
            c.nombres.toLowerCase().includes(searchTerm) ||
            c.apellidos.toLowerCase().includes(searchTerm) ||
            c.nui.toLowerCase().includes(searchTerm)
        );

    el.innerHTML = createTableFromArray(
        tablaData,
        [
            { label: '#', render: (_, i) => i + 1 },
            { key: 'nombres', label: 'Nombres' },
            { key: 'apellidos', label: 'Apellidos' },
            { key: 'tipo_ident', label: 'Tipo de Identificación' },
            { key: 'nui', label: 'Identificación' },
            { key: 'gender', label: 'Género' }
        ],
        'No se encontraron conductores con ese filtro.'
    );
};

window.loadConductores = async function () {
    const el = document.getElementById('conductores-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando conductores...</p></div>';
    try {
        const response = await apiGet('/api/conductores?include=persona,persona.tipo_ident&limit=100');
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

    const vehiculosData = dashboardDataStore.vehiculos
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

    el.innerHTML = createTableFromArray(
        vehiculosData,
        [
            { key: 'id', label: 'ID' },
            { key: 'placa', label: 'Placa' },
            { key: 'modelo', label: 'Modelo' },
            { key: 'marca', label: 'Marca' },
            { key: 'tipo_vehiculo.descripcion', label: 'Tipo' }
        ],
        'No se encontraron vehículos con ese filtro.'
    );
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

    const filteredData = dashboardDataStore.rutas.filter(ruta => {
        const matchEmpresa = !empresaId || (ruta.empresa_id == empresaId);
        const name = ruta.name ? ruta.name.toLowerCase() : '';
        const matchText = !searchTerm || name.includes(searchTerm);
        return matchEmpresa && matchText;
    });

    const tablaData = filteredData.map(r => ({
        id: r.id,
        name: r.name,
        file_name: r.file_name,
        empresa: r.empresa ? r.empresa.name : 'N/A'
    }));

    el.innerHTML = createTableFromArray(
        tablaData,
        [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre Ruta' },
            { key: 'empresa', label: 'Empresa' },
            { key: 'file_name', label: 'Archivo' }
        ],
        'No se encontraron rutas con esos filtros.'
    );
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

    const filteredData = dashboardDataStore.documentos.filter(doc => {
        const matchTipo = !tipoId || (doc.tipo_doc_id == tipoId);
        const obs = doc.observaciones ? doc.observaciones.toLowerCase() : '';
        const url = doc.url ? doc.url.toLowerCase() : '';
        const matchText = !searchTerm || obs.includes(searchTerm) || url.includes(searchTerm);
        return matchTipo && matchText;
    });

    el.innerHTML = createTableFromArray(
        filteredData,
        [
            { label: '#', render: (_, i) => i + 1 },
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
    );
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
