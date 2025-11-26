// Dashboard UPC - LÓGICA COMPLETA (Filtros, Exportación y Estadísticas)
(function () {
  
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
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.add('closing');
      setTimeout(() => notification.remove(), 300);
    });
    
    container.appendChild(notification);
    
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.classList.add('closing');
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
  }
  
  // Almacén de datos para estadísticas y FILTROS
  let dashboardDataStore = {
    empresas: []
    , conductores: []
    , vehiculos: []
    , rutas: []
    , documentos: []
  };
  
  // Almacén para las instancias de los gráficos
  let graficosActivos = {};
  
  // --- buildUpcMenu() (Sin cambios) ---
  function buildUpcMenu() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;
    sidebarNav.innerHTML = `
            <p class="nav-section-title">Consultas - UPC</p>
            <a href="#overview" class="nav-link is-active" data-view="overview">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' /></svg>
                <span>Resumen</span>
            </a>
            <a href="#empresas" class="nav-link" data-view="empresas">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' /></svg>
                <span>Empresas</span>
            </a>
            <a href="#conductores" class="nav-link" data-view="conductores">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z' /></svg>
                <span>Conductores</span>
            </a>
            <a href="#vehiculos" class="nav-link" data-view="vehiculos">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' /></svg>
                <span>Vehículos</span>
            </a>
            <a href="#rutas" class="nav-link" data-view="rutas">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' /></svg>
                <span>Rutas</span>
            </a>
            <a href="#documentos" class="nav-link" data-view="documentos">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' /></svg>
                <span>Resoluciones</span>
            </a>
            <a href="#estadisticas" class="nav-link" data-view="estadisticas">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' /></svg>
                <span>Estadísticas</span>
            </a>
        `;
  }
  
  // --- apiGet() (CORREGIDO) ---
  async function apiGet(path) {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(path, {
      headers
    });
    if (!res.ok) {
      console.error(`Error ${res.status} consultando ${path}`);
      
      // Si es 401, la sesión expiró o no hay token válido
      if (res.status === 401) {
        localStorage.removeItem('auth_token');
        showNotification('warning', 'Sesión Expirada', 'Tu sesión ha expirado. Serás redirigido al inicio de sesión.', 3000);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        throw new Error('Sesión expirada');
      }
      
      throw new Error(`Error ${res.status} (${res.statusText}) consultando ${path}`);
    }
    const json = await res.json();
    
    if (json.data && json.data.data) {
      return json; // Devuelve { status, total, data: { ... , data: [...] } }
    } else if (json.data) {
      return {
        status: true
        , total: json.data.length
        , data: {
          data: json.data
        }
      }; // Envuelve no-paginados
    } else {
      return {
        status: true
        , total: 1
        , data: {
          data: [json]
        }
      }; // Envuelve respuestas simples
    }
  }
  
  // --- createTableFromArray() (CORREGIDO) ---
  function createTableFromArray(items, keys, noResultsMessage = "No hay datos disponibles") {
    if (!Array.isArray(items) || items.length === 0) {
      return `<div class="empty-state"><p class="text-gray-500 text-center py-8">${noResultsMessage}</p></div>`;
    }
    console.log('Datos recibidos para tabla:', items);
    
    let html = '<div class="table-container"><table class="modern-table">';
    html += '<thead><tr>';
    keys.forEach(k => html += `<th>${k.label}</th>`);
    html += '</tr></thead><tbody>';
    items.forEach((item, index) => {
      html += `<tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">`;
      keys.forEach(k => {
        let value = '-';
        if (typeof k.render === 'function') {
          try {
            value = k.render(item, index);
          } catch (e) {
            value = '-';
          }
        } else if (k.key) {
          if (k.key.includes('.')) {
            const parts = k.key.split('.');
            let temp = item;
            for (let part of parts) {
              if (temp && typeof temp === 'object' && part in temp) {
                temp = temp[part];
              } else {
                temp = null;
                break;
              }
            }
            if (temp !== null && temp !== undefined && temp !== '') {
              value = temp;
            }
          } else {
            if (item[k.key] !== undefined && item[k.key] !== null && item[k.key] !== '') {
              value = item[k.key];
            }
          }
        }
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }
  
  // --- loadOverview() (CORREGIDO) ---
  async function loadOverview() {
    const cardsEl = document.getElementById('upc-cards');
    try {
      const empresas = await apiGet('/api/empresas?limit=1');
      const conductores = await apiGet('/api/conductores?limit=1');
      const rutas = await apiGet('/api/rutas?limit=1');
      const filtroVeh = JSON.stringify({
        "column": "servicio"
        , "operator": "="
        , "value": true
      });
      const vehiculos = await apiGet(`/api/vehiculos?limit=1&filter=${encodeURIComponent(filtroVeh)}`);
      const totalEmpresas = empresas.total || 0;
      const totalConductores = conductores.total || 0;
      const totalVehiculos = vehiculos.total || 0;
      const totalRutas = rutas.total || 0;
      
      cardsEl.innerHTML = `
            <div class="metric-card card-empresas">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                    <span class="card-title">Empresas</span>
                </div>
                <div class="card-body">
                    <div class="metric-value">${totalEmpresas}</div>
                    <div class="metric-label">Registradas</div>
                </div>
                <div class="card-footer">
                    <small>Empresas de transporte activas</small>
                </div>
            </div>
            <div class="metric-card card-conductores">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
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
            <div class="metric-card card-vehiculos">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <span class="card-title">Vehículos</span>
                </div>
                <div class="card-body">
                    <div class="metric-value">${totalVehiculos}</div>
                    <div class="metric-label">En Servicio</div>
                </div>
                <div class="card-footer">
                    <small>Vehículos activos en operación</small>
                </div>
            </div>
            <div class="metric-card card-rutas">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
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
    } catch (error) {
      cardsEl.innerHTML = `<p class='text-red-600'>Error cargando totales: ${error.message}</p>`;
    }
  }
  
  // --- RENDERIZADO DE TABLA EMPRESAS (CON FILTRO) ---
  function renderEmpresasTable() {
    const el = document.getElementById('empresas-table');
    const filterInput = document.getElementById('filter-empresas');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';
    
    const filteredData = dashboardDataStore.empresas.filter(empresa => {
      const name = empresa.name ? empresa.name.toLowerCase() : '';
      const nit = empresa.nit ? empresa.nit.toLowerCase() : '';
      return name.includes(searchTerm) || nit.includes(searchTerm);
    });
    
    el.innerHTML = createTableFromArray(
      filteredData, [{
        key: 'id'
        , label: 'ID'
      }, {
        key: 'name'
        , label: 'Nombre de la Empresa'
      }, {
        key: 'nit'
        , label: 'NIT'
      }, {
        key: 'tipo_empresa.descripcion'
        , label: 'Tipo de Empresa'
      }], "No se encontraron empresas con ese filtro."
    );
  }
  
  // --- LOAD EMPRESAS (SOLO FETCH) ---
  async function loadEmpresas() {
    const el = document.getElementById('empresas-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando empresas...</p></div>';
    try {
      const response = await apiGet('/api/empresas?include=tipo_empresa&limit=100');
      dashboardDataStore.empresas = response.data.data; // ¡GUARDA EN STORE!
      renderEmpresasTable(); // Llama al renderizador inicial
    } catch (error) {
      el.innerHTML = `<div class="error-state"><p class='text-red-600 text-center py-8'>Error al cargar empresas: ${error.message}</p></div>`;
    }
  }
  
  // --- RENDERIZADO DE TABLA CONDUCTORES (CON FILTRO) ---
  function renderConductoresTable() {
    const el = document.getElementById('conductores-table');
    const filterInput = document.getElementById('filter-conductores');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';
    
    const tablaData = dashboardDataStore.conductores
      .map(c => ({ // Mapeo para aplanar
        id: c.id
        , persona: c.persona, // Mantén el objeto persona
        nombres: c.persona ? c.persona.name : 'N/A'
        , apellidos: c.persona ? c.persona.last_name : 'N/A'
        , tipo_ident: c.persona && c.persona.tipo_ident ? c.persona.tipo_ident.descripcion : 'N/A'
        , nui: c.persona ? c.persona.nui : 'N/A'
        , gender: c.persona ? c.persona.gender : 'N/A'
      }))
      .filter(c => { // Filtrado
        return c.nombres.toLowerCase().includes(searchTerm) ||
          c.apellidos.toLowerCase().includes(searchTerm) ||
          c.nui.toLowerCase().includes(searchTerm);
      });
    
    el.innerHTML = createTableFromArray(tablaData, [{
      label: '#'
      , render: (_, i) => i + 1
    }, {
      key: 'nombres'
      , label: 'Nombres'
    }, {
      key: 'apellidos'
      , label: 'Apellidos'
    }, {
      key: 'tipo_ident'
      , label: 'Tipo de Identificación'
    }, {
      key: 'nui'
      , label: 'Identificación'
    }, {
      key: 'gender'
      , label: 'Género'
    }], "No se encontraron conductores con ese filtro.");
  }
  
  // --- LOAD CONDUCTORES (SOLO FETCH) ---
  async function loadConductores() {
    const el = document.getElementById('conductores-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando conductores...</p></div>';
    try {
      const response = await apiGet('/api/conductores?include=persona,persona.tipo_ident&limit=100');
      dashboardDataStore.conductores = response.data.data;
      renderConductoresTable();
    } catch (error) {
      el.innerHTML = `<div class="error-state"><p class='text-red-600 text-center py-8'>Error al cargar conductores: ${error.message}</p></div>`;
    }
  }
  
  // --- RENDERIZADO DE TABLA VEHÍCULOS (CON FILTRO) ---
  function renderVehiculosTable() {
    const el = document.getElementById('vehiculos-table');
    const filterInput = document.getElementById('filter-vehiculos');
    const searchTerm = filterInput ? filterInput.value.toLowerCase() : '';
    
    const vehiculosData = dashboardDataStore.vehiculos
      .map(v => ({ // Mapeo para aplanar
        id: v.id
        , placa: v.placa
        , modelo: v.modelo
        , marca: v.marca
        , tipo_vehiculo: v.tipo ? v.tipo : {
          descripcion: 'N/A'
        }
      }))
      .filter(v => { // Filtrado
        return v.placa.toLowerCase().includes(searchTerm) ||
          v.marca.toLowerCase().includes(searchTerm) ||
          v.modelo.toLowerCase().includes(searchTerm);
      });
    
    el.innerHTML = createTableFromArray(vehiculosData, [{
      key: 'id'
      , label: 'ID'
    }, {
      key: 'placa'
      , label: 'Placa'
    }, {
      key: 'modelo'
      , label: 'Modelo'
    }, {
      key: 'marca'
      , label: 'Marca'
    }, {
      key: 'tipo_vehiculo.descripcion'
      , label: 'Tipo'
    }], "No se encontraron vehículos con ese filtro.");
  }
  
  // --- LOAD VEHÍCULOS (SOLO FETCH) ---
  async function loadVehiculos() {
    const el = document.getElementById('vehiculos-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando vehículos...</p></div>';
    try {
      const filtro = {
        "column": "servicio"
        , "operator": "="
        , "value": true
      };
      const params = `?filter=${encodeURIComponent(JSON.stringify(filtro))}&include=tipo&limit=100`;
      const response = await apiGet('/api/vehiculos' + params);
      dashboardDataStore.vehiculos = response.data.data;
      renderVehiculosTable();
    } catch (error) {
      el.innerHTML = `<div class="error-state"><p class='text-red-600 text-center py-8'>Error al cargar vehículos: ${error.message}</p></div>`;
    }
  }
  
  // --- RENDERIZADO DE TABLA RUTAS (CON FILTRO SELECT Y TEXTO) ---
  function renderRutasTable() {
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
      id: r.id
      , name: r.name
      , file_name: r.file_name
      , empresa: r.empresa ? r.empresa.name : 'N/A'
    }));
    
    el.innerHTML = createTableFromArray(tablaData, [{
      key: 'id'
      , label: 'ID'
    }, {
      key: 'name'
      , label: 'Nombre Ruta'
    }, {
      key: 'empresa'
      , label: 'Empresa'
    }, {
      key: 'file_name'
      , label: 'Archivo'
    }], "No se encontraron rutas con esos filtros.");
  }
  
  // --- LOAD RUTAS (SOLO FETCH) ---
  async function loadRutas() {
    const el = document.getElementById('rutas-table');
    el.innerHTML = 'Cargando...';
    try {
      const response = await apiGet('/api/rutas?include=empresa');
      dashboardDataStore.rutas = response.data.data;
      renderRutasTable();
    } catch (error) {
      el.innerHTML = `<p class='text-red-600'>${error.message}</p>`;
    }
  }
  
  // --- RENDERIZADO DE TABLA DOCUMENTOS (CON FILTRO SELECT Y TEXTO) ---
  function renderDocumentosTable() {
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
    
    el.innerHTML = createTableFromArray(filteredData, [{
      label: '#'
      , render: (_, i) => i + 1
    }, {
      key: 'observaciones'
      , label: 'Título/Observación'
    }, {
      key: 'url'
      , label: 'URL'
    }, {
      label: 'Fecha'
      , render: (item) => {
        if (!item.created_at) return '-';
        const d = new Date(item.created_at);
        return isNaN(d) ? '-' : d.toLocaleDateString('es-CO');
      }
    }], "No se encontraron documentos con esos filtros.");
  }
  
  // --- LOAD DOCUMENTOS (SOLO FETCH) ---
  async function loadDocumentos() {
    const el = document.getElementById('documentos-table');
    el.innerHTML = '<div class="loading-state"><p class="text-gray-500 text-center py-8">Cargando documentos...</p></div>';
    try {
      const response = await apiGet('/api/documentos');
      dashboardDataStore.documentos = response.data.data;
      renderDocumentosTable();
    } catch (error) {
      el.innerHTML = `<div class='error-state'><p class='text-red-600 text-center py-8'>${error.message}</p></div>`;
    }
  }
  
  // --- loadTiposDocs() (CORREGIDO) ---
  async function loadTiposDocs() {
    const sel = document.getElementById('select-tipo-docs');
    sel.innerHTML = '<option value="">Cargando tipos...</option>';
    try {
      const response = await apiGet('/api/tipo_doc');
      sel.innerHTML = '<option value="">-- Todos los tipos --</option>' +
        response.data.data.map(i => `<option value="${i.id}">${i.descripcion}</option>`).join('');
    } catch (error) {
      sel.innerHTML = '<option value="">Error al cargar</option>';
    }
  }
  
  // --- loadEmpresasSelect() (CORREGIDO) ---
  async function loadEmpresasSelect() {
    const sel = document.getElementById('select-empresa-rutas');
    sel.innerHTML = '<option value="">Cargando empresas...</option>';
    try {
      const response = await apiGet('/api/empresas');
      sel.innerHTML = '<option value="">-- Todas las empresas --</option>' +
        response.data.data.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
    } catch (error) {
      sel.innerHTML = '<option value="">Error al cargar</option>';
    }
  }
  
  // --- setupUpcListeners() (MODIFICADO) ---
  function setupUpcListeners() {
    // --- FILTROS DE TEXTO (keyup) ---
    document.getElementById('filter-empresas').addEventListener('keyup', renderEmpresasTable);
    document.getElementById('filter-conductores').addEventListener('keyup', renderConductoresTable);
    document.getElementById('filter-vehiculos').addEventListener('keyup', renderVehiculosTable);
    document.getElementById('filter-rutas').addEventListener('keyup', renderRutasTable);
    document.getElementById('filter-documentos').addEventListener('keyup', renderDocumentosTable);
    
    // --- FILTROS DE SELECT (change) ---
    document.getElementById('select-empresa-rutas').addEventListener('change', renderRutasTable);
    document.getElementById('select-tipo-docs').addEventListener('change', renderDocumentosTable);
    
    // --- LISTENERS DE EXPORTACIÓN ---
    document.querySelectorAll('.btn-export').forEach(button => {
      button.addEventListener('click', (e) => {
        const format = e.currentTarget.dataset.format;
        const target = e.currentTarget.dataset.target;
        
        let dataToExport = [];
        let headers = [];
        let filename = `${target}_reporte_${new Date().toISOString().split('T')[0]}`;
        let title = `Reporte de ${target}`;
        
        switch (target) {
        case 'empresas':
          const searchTermEmp = document.getElementById('filter-empresas').value.toLowerCase();
          dataToExport = dashboardDataStore.empresas.filter(e =>
            (e.name && e.name.toLowerCase().includes(searchTermEmp)) ||
            (e.nit && e.nit.toLowerCase().includes(searchTermEmp))
          );
          headers = [{
            key: 'id'
            , label: 'ID'
          }, {
            key: 'name'
            , label: 'Nombre'
          }, {
            key: 'nit'
            , label: 'NIT'
          }, {
            key: 'tipo_empresa.descripcion'
            , label: 'Tipo'
          }];
          title = "Reporte de Empresas";
          break;
          
        case 'conductores':
          const searchTermCond = document.getElementById('filter-conductores').value.toLowerCase();
          dataToExport = dashboardDataStore.conductores
            .filter(c => {
              const p = c.persona;
              return (p && p.name && p.name.toLowerCase().includes(searchTermCond)) ||
                (p && p.last_name && p.last_name.toLowerCase().includes(searchTermCond)) ||
                (p && p.nui && p.nui.toLowerCase().includes(searchTermCond));
            });
          headers = [{
            key: 'id'
            , label: 'ID Conductor'
          }, {
            key: 'persona.name'
            , label: 'Nombres'
          }, {
            key: 'persona.last_name'
            , label: 'Apellidos'
          }, {
            key: 'persona.nui'
            , label: 'Identificación'
          }, {
            key: 'persona.gender'
            , label: 'Género'
          }];
          title = "Reporte de Conductores";
          break;
          
        case 'vehiculos':
          const searchTermVeh = document.getElementById('filter-vehiculos').value.toLowerCase();
          dataToExport = dashboardDataStore.vehiculos.filter(v =>
            (v.placa && v.placa.toLowerCase().includes(searchTermVeh)) ||
            (v.marca && v.marca.toLowerCase().includes(searchTermVeh)) ||
            (v.modelo && v.modelo.toLowerCase().includes(searchTermVeh))
          );
          headers = [{
            key: 'id'
            , label: 'ID'
          }, {
            key: 'placa'
            , label: 'Placa'
          }, {
            key: 'marca'
            , label: 'Marca'
          }, {
            key: 'modelo'
            , label: 'Modelo'
          }, {
            key: 'tipo_vehiculo.descripcion'
            , label: 'Tipo'
          }];
          title = "Reporte de Vehículos en Servicio";
          break;
          
        case 'rutas':
          const empIdRuta = document.getElementById('select-empresa-rutas').value;
          const searchTermRuta = document.getElementById('filter-rutas').value.toLowerCase();
          dataToExport = dashboardDataStore.rutas.filter(r => {
            const matchEmpresa = !empIdRuta || (r.empresa_id == empIdRuta);
            const matchText = !searchTermRuta || (r.name && r.name.toLowerCase().includes(searchTermRuta));
            return matchEmpresa && matchText;
          });
          headers = [{
            key: 'id'
            , label: 'ID'
          }, {
            key: 'name'
            , label: 'Nombre Ruta'
          }, {
            key: 'empresa.name'
            , label: 'Empresa'
          }, {
            key: 'file_name'
            , label: 'Archivo'
          }];
          title = "Reporte de Rutas";
          break;
          
        case 'documentos':
          const tipoIdDoc = document.getElementById('select-tipo-docs').value;
          const searchTermDoc = document.getElementById('filter-documentos').value.toLowerCase();
          dataToExport = dashboardDataStore.documentos.filter(d => {
            const matchTipo = !tipoIdDoc || (d.tipo_doc_id == tipoIdDoc);
            const matchText = !searchTermDoc ||
              (d.observaciones && d.observaciones.toLowerCase().includes(searchTermDoc)) ||
              (d.url && d.url.toLowerCase().includes(searchTermDoc));
            return matchTipo && matchText;
          });
          headers = [{
            key: 'id'
            , label: 'ID'
          }, {
            key: 'observaciones'
            , label: 'Observación'
          }, {
            key: 'url'
            , label: 'URL'
          }, {
            key: 'created_at'
            , label: 'Fecha Creación'
          }];
          title = "Reporte de Documentos";
          break;
        }
        
        if (dataToExport.length === 0) {
          alert("No hay datos para exportar (según el filtro actual).");
          return;
        }
        
        if (format === 'csv') {
          exportToCSV(dataToExport, headers, filename + '.csv');
        } else if (format === 'excel') {
          exportToExcel(dataToExport, headers, filename + '.xlsx');
        } else if (format === 'pdf') {
          exportToPDF(dataToExport, headers, filename + '.pdf', title);
        }
      });
    });
    
    // --- ¡NUEVO LISTENER PARA EL RESUMEN! ---
    const summaryButton = document.getElementById('btn-export-summary');
    if (summaryButton) {
      summaryButton.addEventListener('click', handleExportSummary);
    }
  }
  
  // --- loadEstadisticas() (Función de Gráficos Corregida) ---
  function loadEstadisticas() {
    
    // --- Gráfico 1: Vehículos por Tipo (Barras Verticales) ---
    try {
      const ctx = document.getElementById('graficoVehiculosPorTipo').getContext('2d');
      const conteoPorTipo = dashboardDataStore.vehiculos.reduce((acc, v) => {
        const tipo = (v.tipo_vehiculo && v.tipo_vehiculo.descripcion) ? v.tipo_vehiculo.descripcion : 'Sin Tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(conteoPorTipo);
      const data = Object.values(conteoPorTipo);
      
      if (graficosActivos.vehiculos) graficosActivos.vehiculos.destroy();
      graficosActivos.vehiculos = new Chart(ctx, {
        type: 'bar'
        , data: {
          labels: labels
          , datasets: [{
            label: 'Nº de Vehículos'
            , data: data
            , backgroundColor: '#3B82F6'
            , borderColor: '#1D4ED8'
            , borderWidth: 1
          }]
        }
        , options: {
          responsive: true
          , maintainAspectRatio: false
          , plugins: {
            legend: {
              display: false
            }
          }
          , scales: {
            y: {
              beginAtZero: true
              , ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } catch (e) {
      console.error("Error al renderizar gráfico de vehículos:", e);
    }
    
    // --- Gráfico 2: Conductores por Género (Barras Horizontales) ---
    try {
      const ctx = document.getElementById('graficoConductoresPorGenero').getContext('2d');
      const conteoPorGenero = dashboardDataStore.conductores.reduce((acc, c) => {
        const genero = (c.persona && c.persona.gender) ? c.persona.gender : 'No especificado';
        acc[genero] = (acc[genero] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(conteoPorGenero);
      const data = Object.values(conteoPorGenero);
      
      if (graficosActivos.conductores) graficosActivos.conductores.destroy();
      graficosActivos.conductores = new Chart(ctx, {
        type: 'bar'
        , data: {
          labels: labels
          , datasets: [{
            label: 'Nº de Conductores'
            , data: data
            , backgroundColor: ['#EC4899', '#3B82F6', '#8B5CF6', '#6B7280']
          , }]
        }
        , options: {
          indexAxis: 'y'
          , responsive: true
          , maintainAspectRatio: false
          , plugins: {
            legend: {
              display: false
            }
          }
          , scales: {
            x: {
              beginAtZero: true
              , ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } catch (e) {
      console.error("Error al renderizar gráfico de conductores:", e);
    }
    
    // --- Gráfico 3: Empresas por Tipo (Barras Horizontales) ---
    try {
      const ctx = document.getElementById('graficoEmpresasPorTipo').getContext('2d');
      const conteoPorTipo = dashboardDataStore.empresas.reduce((acc, e) => {
        const tipo = (e.tipo_empresa && e.tipo_empresa.descripcion) ? e.tipo_empresa.descripcion : 'Sin Tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(conteoPorTipo);
      const data = Object.values(conteoPorTipo);
      
      if (graficosActivos.empresas) graficosActivos.empresas.destroy();
      graficosActivos.empresas = new Chart(ctx, {
        type: 'bar'
        , data: {
          labels: labels
          , datasets: [{
            label: 'Nº de Empresas'
            , data: data
            , backgroundColor: '#10B981'
            , borderColor: '#059669'
            , borderWidth: 1
          }]
        }
        , options: {
          indexAxis: 'y'
          , responsive: true
          , maintainAspectRatio: false
          , plugins: {
            legend: {
              display: false
            }
          }
          , scales: {
            x: {
              beginAtZero: true
              , ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } catch (e) {
      console.error("Error al renderizar gráfico de empresas:", e);
    }
    
    // --- Gráfico 4: Flota de Vehículos por Año/Modelo (Línea) ---
    try {
      const ctx = document.getElementById('graficoVehiculosPorModelo').getContext('2d');
      const conteoPorModelo = dashboardDataStore.vehiculos.reduce((acc, v) => {
        const modelo = v.modelo || 'Sin Año';
        acc[modelo] = (acc[modelo] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(conteoPorModelo).sort((a, b) => a - b);
      const data = labels.map(label => conteoPorModelo[label]);
      
      if (graficosActivos.modelos) graficosActivos.modelos.destroy();
      graficosActivos.modelos = new Chart(ctx, {
        type: 'line'
        , data: {
          labels: labels
          , datasets: [{
            label: 'Cantidad de Vehículos'
            , data: data
            , fill: true
            , backgroundColor: 'rgba(59, 130, 246, 0.2)'
            , borderColor: '#3B82F6'
            , tension: 0.1
          }]
        }
        , options: {
          responsive: true
          , maintainAspectRatio: false
          , plugins: {
            legend: {
              display: false
            }
          }
          , scales: {
            y: {
              beginAtZero: true
              , ticks: {
                stepSize: 1
              }
              , suggestedMax: 10
            }
          }
        }
      });
    } catch (e) {
      console.error("Error al renderizar gráfico de modelos:", e);
    }
    
    // --- Gráfico 5: Rutas por Empresa (Barras Horizontales) ---
    try {
      const ctx = document.getElementById('graficoRutasPorEmpresa').getContext('2d');
      const conteoPorEmpresa = dashboardDataStore.rutas.reduce((acc, r) => {
        const empresa = (r.empresa && r.empresa.name) ? r.empresa.name : 'Sin Empresa';
        acc[empresa] = (acc[empresa] || 0) + 1;
        return acc;
      }, {});
      const sorted = Object.entries(conteoPorEmpresa).sort(([, a], [, b]) => b - a).slice(0, 10);
      const labels = sorted.map(([label]) => label);
      const data = sorted.map(([, data]) => data);
      
      if (graficosActivos.rutas) graficosActivos.rutas.destroy();
      
      graficosActivos.rutas = new Chart(ctx, {
        type: 'bar'
        , data: {
          labels: labels
          , datasets: [{
            label: 'Nº de Rutas'
            , data: data
            , backgroundColor: '#8B5CF6'
          }]
        }
        , options: {
          indexAxis: 'y'
          , responsive: true
          , maintainAspectRatio: false
          , plugins: {
            legend: {
              display: false
            }
          }
          , scales: {
            x: {
              beginAtZero: true
              , ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } catch (e) {
      console.error("Error al renderizar gráfico de rutas:", e);
    }
  }
  
  // --- DOMContentLoaded (MODIFICADO) ---
  document.addEventListener('DOMContentLoaded', async () => { // <-- 1. AÑADIR ASYNC
    buildUpcMenu();
    
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.dashboard-view');
    const headerTitle = document.getElementById('header-title');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = link.getAttribute('data-view');
        if (headerTitle) headerTitle.textContent = link.querySelector('span').textContent;
        
        if (viewName === 'estadisticas') {
          loadEstadisticas();
        }
        
        views.forEach(view => view.style.display = 'none');
        const activeView = document.getElementById(`view-${viewName}`);
        if (activeView) activeView.style.display = 'block';
        navLinks.forEach(navLink => navLink.classList.remove('is-active'));
        link.classList.add('is-active');
        window.location.hash = viewName;
      });
    });
    
    // --- 2. AÑADIR AWAIT PROMISE.ALLSETTLED ---
    // Esto fuerza al código a esperar que TODAS estas funciones terminen
    await Promise.allSettled([
      loadOverview(), loadEmpresas(), loadConductores(), loadVehiculos(), loadTiposDocs(), loadEmpresasSelect(), loadDocumentos(), // Carga inicial de documentos
      loadRutas() // Carga inicial de rutas
    ]);
    
    // --- 3. MOVER ESTO AL FINAL ---
    // Ahora, los listeners solo se activan DESPUÉS de que los datos existen
    setupUpcListeners();
    
    // Forzar vista por defecto (sin cambios)
    const overviewLink = document.querySelector('.nav-link[data-view="overview"]');
    const currentHash = window.location.hash.replace('#', '');
    const validViews = Array.from(navLinks).map(l => l.getAttribute('data-view'));
    
    let linkToClick = overviewLink;
    if (currentHash && validViews.includes(currentHash)) {
      linkToClick = document.querySelector(`.nav-link[data-view="${currentHash}"]`);
    }
    
    if (linkToClick) {
      linkToClick.click();
    } else {
      // Fallback
      views.forEach(v => v.style.display = 'none');
      const ov = document.getElementById('view-overview');
      if (ov) ov.style.display = 'block';
      if (headerTitle) headerTitle.textContent = 'Resumen';
    }
  });
  
  // ---
  // --- FUNCIONES DE EXPORTACIÓN (Sin cambios)
  // ---
  
  /**
   * Exporta el Resumen General (PDF Manual)
   */
  function handleExportSummary() {
    console.log("Iniciando exportación de resumen (Modo Manual jsPDF)...");
    
    const exportButton = document.getElementById('btn-export-summary');
    if (exportButton) {
      exportButton.disabled = true;
      exportButton.querySelector('span').textContent = 'Generando...';
    }
    
    try {
      if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        alert("Error: La librería jsPDF no está cargada.");
        throw new Error("jsPDF no definido");
      }
      
      // Extraer los datos directamente del HTML
      const totalEmpresas = document.querySelector('.card-empresas .metric-value').textContent;
      const totalConductores = document.querySelector('.card-conductores .metric-value').textContent;
      const totalVehiculos = document.querySelector('.card-vehiculos .metric-value').textContent;
      const totalRutas = document.querySelector('.card-rutas .metric-value').textContent;
      
      const {
        jsPDF
      } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const docWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 30;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text("Resumen General del Sistema de Transporte", docWidth / 2, y, {
        align: 'center'
      });
      y += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, margin, y);
      y += 15;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Métricas Principales", margin, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const cardWidth = docWidth - (margin * 2);
      const cardHeight = 15;
      const textOffset = 9;
      const valueOffset = docWidth - margin - 10;
      
      // --- Métrica 1: Empresas ---
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, cardWidth, cardHeight, 'F');
      doc.text("Empresas Registradas:", margin + 5, y + textOffset);
      doc.setFont('helvetica', 'bold');
      doc.text(totalEmpresas, valueOffset, y + textOffset, {
        align: 'right'
      });
      doc.setFont('helvetica', 'normal');
      y += 20;
      
      // --- Métrica 2: Conductores ---
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, cardWidth, cardHeight, 'F');
      doc.text("Conductores Registrados:", margin + 5, y + textOffset);
      doc.setFont('helvetica', 'bold');
      doc.text(totalConductores, valueOffset, y + textOffset, {
        align: 'right'
      });
      doc.setFont('helvetica', 'normal');
      y += 20;
      
      // --- Métrica 3: Vehículos ---
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, cardWidth, cardHeight, 'F');
      doc.text("Vehículos en Servicio:", margin + 5, y + textOffset);
      doc.setFont('helvetica', 'bold');
      doc.text(totalVehiculos, valueOffset, y + textOffset, {
        align: 'right'
      });
      doc.setFont('helvetica', 'normal');
      y += 20;
      
      // --- Métrica 4: Rutas ---
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, cardWidth, cardHeight, 'F');
      doc.text("Rutas Autorizadas:", margin + 5, y + textOffset);
      doc.setFont('helvetica', 'bold');
      doc.text(totalRutas, valueOffset, y + textOffset, {
        align: 'right'
      });
      doc.setFont('helvetica', 'normal');
      
      doc.save(`resumen_general_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (err) {
      console.error("Error al generar el PDF del resumen (Modo Manual):", err);
      alert("No se pudo generar el PDF del resumen. Asegúrese de que el resumen esté cargado.");
    } finally {
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.querySelector('span').textContent = 'Descargar Resumen';
      }
    }
  }
  
  /**
   * Extrae un valor (incluyendo anidados) de un objeto.
   */
  function getDeepValue(obj, path) {
    if (!path) return '-';
    try {
      const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
      return (value !== null && value !== undefined) ? value : '-';
    } catch (e) {
      return '-';
    }
  }
  
  /**
   * Exporta datos a un archivo CSV.
   * (Requiere PapaParse CDN)
   */
  function exportToCSV(data, headers, filename) {
    if (typeof Papa === 'undefined') {
      alert("Error: La librería PapaParse (CSV) no está cargada.");
      return;
    }
    const csvData = data.map(row => {
      let newRow = {};
      headers.forEach(header => {
        newRow[header.label] = getDeepValue(row, header.key);
      });
      return newRow;
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Exporta datos a un archivo Excel (.xlsx).
   * (Requiere SheetJS/XLSX CDN)
   */
  function exportToExcel(data, headers, filename) {
    if (typeof XLSX === 'undefined') {
      alert("Error: La librería XLSX (Excel) no está cargada.");
      return;
    }
    const excelData = data.map(row => {
      let newRow = {};
      headers.forEach(header => {
        newRow[header.label] = getDeepValue(row, header.key);
      });
      return newRow;
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = {
      Sheets: {
        'Datos': worksheet
      }
      , SheetNames: ['Datos']
    };
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx'
      , type: 'array'
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Exporta datos a un archivo PDF.
   * (Requiere jsPDF y jsPDF-AutoTable CDN)
   */
  function exportToPDF(data, headers, filename, title) {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
      alert("Error: La librería jsPDF no está cargada.");
      return;
    }
    const {
      jsPDF
    } = window.jspdf;
    const doc = new jsPDF();
    
    const tableHeaders = headers.map(h => h.label);
    const tableBody = data.map(row => {
      return headers.map(header => {
        return getDeepValue(row, header.key);
      });
    });
    
    doc.text(title, 14, 20);
    doc.autoTable({
      startY: 25
      , head: [tableHeaders]
      , body: tableBody
      , theme: 'striped'
      , styles: {
        fontSize: 8
      }
      , headStyles: {
        fillColor: [34, 139, 230]
      } // Color azul
    });
    doc.save(filename);
  }
  
})();