// ==========================
// Menú de navegación lateral
// ==========================
function buildEmpresaMenu() {
  const menuHtml = `
        <nav class="sidebar-nav">
            <a href="#dashboard" class="nav-link active">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
            </a>
            <a href="#conductores" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span>Conductores</span>
            </a>
            <a href="#licencias" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Licencias</span>
            </a>
            <a href="#restricciones" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Restricciones</span>
            </a>
            <a href="#vehiculos" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <span>Vehículos</span>
            </a>
            <a href="#resoluciones" class="nav-link" data-view="resoluciones">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Resoluciones</span>
            </a>
            <a href="#rutas" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Rutas</span>
            </a>
            <a href="#asignaciones" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Asignaciones</span>
            </a>
            <a href="#informes" class="nav-link">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Informes</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <a href="#" id="btn-volver-inicio" class="nav-link btn-home" title="Ir a la página principal">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span>Volver al Inicio</span>
            </a>
        </div>
    `;

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const nav = sidebar.querySelector('nav');
    if (nav) nav.remove();
    const footer = sidebar.querySelector('.sidebar-footer');
    if (footer) footer.remove();
    sidebar.insertAdjacentHTML('beforeend', menuHtml);

    // Event listeners para navegación - Agregar después de insertar el HTML
    setTimeout(() => {
      document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          const viewName = href.substring(1); // Eliminar el #
          console.log('Click en menú:', viewName); // Debug
          window.location.hash = viewName; // Esto disparará el hashchange
        });
      });
    }, 0);
  }
}

// Navegación entre vistas
let lastView = null;
function navigateTo(viewName) {
  if (lastView === viewName) return; // Evitar disparos dobles
  console.log('Navegando a:', viewName); 
  lastView = viewName;

  // Ocultar todas las vistas
  document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');

  // Mostrar vista seleccionada
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.style.display = 'block';
    currentView = viewName;

    // Actualizar menú activo
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[href="#${viewName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Actualizar título del header
    const titles = {
      'dashboard': 'Panel de Control'
      , 'conductores': 'Gestión de Conductores'
      , 'licencias': 'Gestión de Licencias'
      , 'restricciones': 'Tipos de Restricción'
      , 'vehiculos': 'Gestión de Vehículos'
      , 'resoluciones': 'Resoluciones y Comunicados'
      , 'rutas': 'Gestión de Rutas'
      , 'asignaciones': 'Asignación Vehículos a Rutas'
      , 'informes': 'Informes y Reportes'
    };
    const headerTitle = document.getElementById('header-title');
    if (headerTitle && titles[viewName]) {
      headerTitle.textContent = titles[viewName];
    }

    // Cargar datos según la vista
    switch (viewName) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'conductores':
        loadConductores();
        break;
      case 'resoluciones':
        loadResoluciones();
        break;
      case 'licencias':
        loadLicencias();
        break;
      case 'restricciones':
        loadRestricciones();
        break;
      case 'vehiculos':
        loadVehiculos();
        break;
      case 'rutas':
        loadRutas();
        break;
      case 'asignaciones':
        loadAsignaciones();
        break;
      case 'informes':
        // Los informes se cargan on-demand
        break;
    }
  } else {
    console.error('Vista no encontrada:', viewName);
  }
}

// Exponer al scope global
window.buildEmpresaMenu = buildEmpresaMenu;
window.navigateTo = navigateTo;
window.showView = navigateTo;