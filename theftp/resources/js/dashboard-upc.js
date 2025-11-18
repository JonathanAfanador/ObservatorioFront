// Dashboard UPC - Lógica específica para el rol UPC (Auditor / Consulta)

(function() {
    // Inyectamos un menú lateral específico para UPC (solo lectura)
    function buildUpcMenu() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return;

        // Vaciar los items existentes y construir el menú UPC
        sidebarNav.innerHTML = `
            <p class="nav-section-title">Consultas - UPC</p>
            <a href="#overview" class="nav-link is-active" data-view="overview">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' />
                </svg>
                <span>Resumen</span>
            </a>
            <a href="#empresas" class="nav-link" data-view="empresas">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' />
                </svg>
                <span>Empresas</span>
            </a>
            <a href="#conductores" class="nav-link" data-view="conductores">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z' />
                </svg>
                <span>Conductores</span>
            </a>
            <a href="#vehiculos" class="nav-link" data-view="vehiculos">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' />
                </svg>
                <span>Vehículos</span>
            </a>
            <a href="#rutas" class="nav-link" data-view="rutas">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' />
                </svg>
                <span>Rutas</span>
            </a>
            <a href="#documentos" class="nav-link" data-view="documentos">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
                </svg>
                <span>Resoluciones</span>
            </a>
            <a href="#estadisticas" class="nav-link" data-view="estadisticas">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'>
                    <path stroke-linecap='round' stroke-linejoin='round' d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' />
                </svg>
                <span>Estadísticas</span>
            </a>
        `;
    }

    // API helpers
    async function apiGet(path) {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(path, { headers });
        if (!res.ok) throw new Error('Error consultando ' + path);
        const json = await res.json();
        return json.data ? json.data : json; // convención del backend
    }

    function createTableFromArray(items, keys) {
        if (!Array.isArray(items) || items.length === 0) return '<p>No hay datos.</p>';
        let html = '<table class="table-auto w-full text-left"><thead><tr>';
        keys.forEach(k => html += `<th class="px-4 py-2">${k.label}</th>`);
        html += '</tr></thead><tbody>';
        items.forEach(item => {
            html += '<tr>';
            keys.forEach(k => {
                const value = item[k.key] !== undefined ? item[k.key] : '';
                html += `<td class="px-4 py-2">${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    // Cargar Totales al overview
    async function loadOverview() {
        const cardsEl = document.getElementById('upc-cards');
        try {
            const empresas = await apiGet('/api/empresas');
            const conductores = await apiGet('/api/conductores');
            const vehiculos = await apiGet('/api/vehiculos?servicio=true');
            const rutas = await apiGet('/api/rutas');

            const cards = [
                { title: 'Empresas', value: empresas.length || 0 },
                { title: 'Conductores', value: conductores.length || 0 },
                { title: 'Vehículos (en servicio)', value: Array.isArray(vehiculos) ? vehiculos.length : 0 },
                { title: 'Rutas', value: rutas.length || 0 },
            ];

            cardsEl.innerHTML = cards.map(c => `
                <div class="content-card z-0">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:600;">${c.title}</div>
                            <div style="color:#6b7280;">Total</div>
                        </div>
                        <div style="font-size:28px; font-weight:700;">${c.value}</div>
                    </div>
                </div>`).join('');

        } catch (error) {
            cardsEl.innerHTML = `<p class='text-red-600'>Error cargando totales: ${error.message}</p>`;
        }
    }

    // Cargar tablas
    async function loadEmpresas() {
        const el = document.getElementById('empresas-table');
        el.innerHTML = 'Cargando...';
        try {
            const items = await apiGet('/api/empresas');
            el.innerHTML = createTableFromArray(items, [
                { key: 'id', label: 'ID' },
                { key: 'nombre', label: 'Nombre' },
                { key: 'nit', label: 'NIT' }
            ]);
        } catch (error) { el.innerHTML = `<p class='text-red-600'>${error.message}</p>`; }
    }

    async function loadConductores() {
        const el = document.getElementById('conductores-table');
        el.innerHTML = 'Cargando...';
        try {
            const items = await apiGet('/api/conductores');
            el.innerHTML = createTableFromArray(items, [
                { key: 'id', label: 'ID' },
                { key: 'nombres', label: 'Nombres' },
                { key: 'apellidos', label: 'Apellidos' },
                { key: 'identificacion', label: 'Identificación' }
            ]);
        } catch (error) { el.innerHTML = `<p class='text-red-600'>${error.message}</p>`; }
    }

    async function loadVehiculos() {
        const el = document.getElementById('vehiculos-table');
        el.innerHTML = 'Cargando...';
        try {
            const items = await apiGet('/api/vehiculos?servicio=true');
            el.innerHTML = createTableFromArray(items, [
                { key: 'id', label: 'ID' },
                { key: 'placa', label: 'Placa' },
                { key: 'modelo', label: 'Modelo' },
            ]);
        } catch (error) { el.innerHTML = `<p class='text-red-600'>${error.message}</p>`; }
    }

    async function loadRutasByEmpresa(empresaId) {
        const el = document.getElementById('rutas-table');
        el.innerHTML = 'Cargando...';
        try {
            const items = empresaId ? await apiGet(`/api/rutas?empresa_id=${empresaId}`) : await apiGet('/api/rutas');
            el.innerHTML = createTableFromArray(items, [
                { key: 'id', label: 'ID' },
                { key: 'codigo', label: 'Código' },
                { key: 'nombre', label: 'Nombre' }
            ]);
        } catch (error) { el.innerHTML = `<p class='text-red-600'>${error.message}</p>`; }
    }

    async function loadTiposDocs() {
        const sel = document.getElementById('select-tipo-docs');
        sel.innerHTML = '<option value="">Cargando tipos...</option>';
        try {
            const items = await apiGet('/api/tipo_doc');
            sel.innerHTML = items.map(i => `<option value="${i.id}">${i.descripcion}</option>`).join('');
        } catch (error) { sel.innerHTML = '<option value="">Error al cargar</option>'; }
    }

    async function loadDocumentosByTipo(tipoId) {
        const el = document.getElementById('documentos-table');
        el.innerHTML = 'Cargando...';
        try {
            let path = '/api/documentos';
            if (tipoId) path += `?tipo_doc_id=${tipoId}`;
            const items = await apiGet(path);
            el.innerHTML = createTableFromArray(items, [
                { key: 'id', label: 'ID' },
                { key: 'titulo', label: 'Título' },
                { key: 'fecha', label: 'Fecha' }
            ]);
        } catch (error) { el.innerHTML = `<p class='text-red-600'>${error.message}</p>`; }
    }

    async function loadEmpresasSelect() {
        const sel = document.getElementById('select-empresa-rutas');
        sel.innerHTML = '<option value="">Cargando empresas...</option>';
        try {
            const items = await apiGet('/api/empresas');
            sel.innerHTML = '<option value="">-- Selecciona empresa --</option>' + items.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
        } catch (error) { sel.innerHTML = '<option value="">Error al cargar</option>'; }
    }

    function setupUpcListeners() {
        document.getElementById('btn-filter-rutas').addEventListener('click', () => {
            const empresaId = document.getElementById('select-empresa-rutas').value;
            loadRutasByEmpresa(empresaId);
        });

        document.getElementById('btn-filter-documentos').addEventListener('click', () => {
            const tipoId = document.getElementById('select-tipo-docs').value;
            loadDocumentosByTipo(tipoId);
        });
    }

    // Inicializamos solo si estamos en el DASHBOARD UPC
    document.addEventListener('DOMContentLoaded', () => {
        // Build UPC specific menu
        buildUpcMenu();

        // Re-asignar manejadores de navegación (el layout original puede haber ejecutado su binding antes)
        const navLinks = document.querySelectorAll('.nav-link');
        const views = document.querySelectorAll('.dashboard-view');
        const headerTitle = document.getElementById('header-title');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.getAttribute('data-view');
                if (headerTitle) headerTitle.textContent = link.querySelector('span').textContent;
                views.forEach(view => view.style.display = 'none');
                const activeView = document.getElementById(`view-${viewName}`);
                if (activeView) activeView.style.display = 'block';
                navLinks.forEach(navLink => navLink.classList.remove('is-active'));
                link.classList.add('is-active');
                window.location.hash = viewName;
            });
        });

        // Inicializa datos comunes
        loadOverview();
        loadEmpresas();
        loadConductores();
        loadVehiculos();
        loadTiposDocs();
        loadEmpresasSelect();
        setupUpcListeners();

        // Forzar vista por defecto: Resumen (overview) si no hay hash o hash inválido
        const overviewLink = document.querySelector('.nav-link[data-view="overview"]');
        const currentHash = window.location.hash.replace('#','');
        const validViews = Array.from(navLinks).map(l => l.getAttribute('data-view'));
        if (!currentHash || !validViews.includes(currentHash)) {
            if (overviewLink) {
                overviewLink.click(); // dispara lógica centralizada
            } else {
                // Fallback manual si algo falla
                views.forEach(v => v.style.display = 'none');
                const ov = document.getElementById('view-overview');
                if (ov) ov.style.display = 'block';
                if (headerTitle) headerTitle.textContent = 'Resumen';
            }
        }
    });
})();
