/**
 * ============================================
 * ADMIN NAV MODULE
 * ============================================
 * Menu lateral, navegacion entre vistas y dispatch de carga.
 * Depende de: AdminBase y modulos de gestion (AdminConductores, etc.)
 */

function buildAdminMenu() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    sidebarNav.innerHTML = `
        <p class="nav-section-title">Administracion</p>
        <a href="#overview" class="nav-link active" data-view="overview">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span>Resumen</span>
        </a>
        <a href="#users" class="nav-link" data-view="users">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span>Usuarios</span>
        </a>
        <a href="#roles" class="nav-link" data-view="roles">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>Roles y Permisos</span>
        </a>
        <a href="#auditoria" class="nav-link" data-view="auditoria">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Auditoría</span>
        </a>
        <p class="nav-section-title mt-4">Gestion de Transporte</p>
        <a href="#conductores" class="nav-link" data-view="conductores">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span>Conductores</span>
        </a>
        <a href="#vehiculos" class="nav-link" data-view="vehiculos">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            <span>Vehiculos</span>
        </a>
        <a href="#empresas" class="nav-link" data-view="empresas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span>Empresas</span>
        </a>
        <a href="#propietarios" class="nav-link" data-view="propietarios">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span>Propietarios</span>
        </a>
        <a href="#rutas" class="nav-link" data-view="rutas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Rutas</span>
        </a>
        <a href="#documentos" class="nav-link" data-view="documentos">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Documentos</span>
        </a>
        <a href="#licencias" class="nav-link" data-view="licencias">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"></path></svg>
            <span>Licencias</span>
        </a>
    `;

    setupNavigation();
}

function setupNavigation() {
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const view = link.getAttribute('data-view');
            if (view) {
                e.preventDefault();
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                loadViewData(view);
            }
        });
    });
}

async function loadViewData(view) {
    // 1. Visibilidad de Vistas
    document.querySelectorAll('.dashboard-view').forEach(el => el.style.display = 'none');
    const activeView = document.getElementById('view-' + view);
    if (activeView) activeView.style.display = 'block';

    // 2. Sincronización de Barra Lateral
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    links.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-view') === view) {
            l.classList.add('active');
        }
    });

    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.textContent = 'Administracion - ' + view.charAt(0).toUpperCase() + view.slice(1);

    switch (view) {
        case 'overview':
            if (typeof loadStats === 'function') await loadStats();
            break;
        case 'users':
            if (typeof loadUsers === 'function') await loadUsers();
            break;
        case 'roles':
            if (typeof loadRoles === 'function') await loadRoles();
            break;
        case 'conductores':
            if (window.AdminConductores) { AdminConductores.init(); await AdminConductores.load(); }
            break;
        case 'vehiculos':
            if (window.AdminVehiculos) { AdminVehiculos.init(); await AdminVehiculos.load(); }
            break;
        case 'empresas':
            if (window.AdminEmpresas) { AdminEmpresas.init(); await AdminEmpresas.load(); }
            break;
        case 'propietarios':
            if (window.AdminPropietarios) { AdminPropietarios.init(); await AdminPropietarios.load(); }
            break;
        case 'rutas':
            if (window.AdminRutas) { AdminRutas.init(); await AdminRutas.load(); }
            break;
        case 'documentos':
            if (window.AdminDocumentos) { AdminDocumentos.init(); await AdminDocumentos.load(); }
            break;
        case 'licencias':
            if (window.AdminLicencias) { AdminLicencias.init(); await AdminLicencias.load(); }
            break;
        case 'auditoria':
            if (window.AdminAuditoria) { AdminAuditoria.init(); await AdminAuditoria.load(); }
            break;
    }
}

window.buildAdminMenu = buildAdminMenu;
window.setupNavigation = setupNavigation;
window.loadViewData = loadViewData;