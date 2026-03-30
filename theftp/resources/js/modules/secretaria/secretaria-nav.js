// ============================================================
// secretaria-nav.js
// Construcción del menú lateral y navegación entre vistas
// ============================================================

// --- Construir menú de la secretaría en el sidebar ---
window.buildSecretariaMenu = function () {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    sidebarNav.innerHTML = `
        <p class="nav-section-title">Supervisión</p>
        <a href="#resumen" class="nav-link active" data-view="resumen">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span>Resumen General</span>
        </a>
        <a href="#resoluciones" class="nav-link" data-view="resoluciones">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Gestión Resoluciones</span>
        </a>
        <a href="#rutas" class="nav-link" data-view="rutas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <span>Validación Rutas</span>
        </a>
        <a href="#empresas" class="nav-link" data-view="empresas">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span>Reporte Empresas</span>
        </a>
        <a href="#licencias" class="nav-link" data-view="licencias">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            <span>Verificación Licencias</span>
        </a>
        <a href="#vehiculos" class="nav-link" data-view="vehiculos">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
            <span>Revisión Vehículos</span>
        </a>
    `;
    setupNavigation();
};

// --- Activar listeners de navegación ---
window.setupNavigation = function () {
    const links = document.querySelectorAll('.sidebar-nav .nav-link');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const view = link.getAttribute('data-view');
            if (!view) return;

            e.preventDefault();

            // Ocultar todas las vistas y mostrar la seleccionada
            document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
            const target = document.getElementById(`view-${view}`);
            if (target) target.style.display = 'block';

            // Marcar enlace activo
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Actualizar título del header
            const headerTitle = document.getElementById('header-title');
            if (headerTitle) {
                const titles = {
                    'resumen': 'Panel de Supervisión',
                    'resoluciones': 'Gestión de Resoluciones',
                    'rutas': 'Validación de Rutas',
                    'empresas': 'Supervisión de Empresas',
                    'licencias': 'Auditoría de Licencias',
                    'vehiculos': 'Revisión de Vehículos'
                };
                headerTitle.textContent = titles[view] || 'Dashboard';
            }

            loadViewData(view);
        });
    });
};

// --- Dispatcher: carga datos según la vista activa ---
window.loadViewData = async function (view) {
    switch (view) {
        case 'resumen': loadStats(); break;
        case 'resoluciones': loadResoluciones(); break;
        case 'rutas': loadRutasParaValidar(); break;
        case 'empresas': loadEmpresas(); break;
        case 'licencias': loadLicenciasAudit(); break;
        case 'vehiculos': loadVehiculosReview(); break;
    }
};
