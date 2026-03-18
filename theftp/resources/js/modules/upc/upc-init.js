// ============================================================
// upc-init.js
// Punto de entrada: DOMContentLoaded, navegación y carga inicial
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Construir el menú lateral
    buildUpcMenu();

    // Referencias al DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.dashboard-view');
    const headerTitle = document.getElementById('header-title');

    // 2. Configurar navegación entre vistas
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            if (headerTitle) headerTitle.textContent = link.querySelector('span').textContent;

            // Cargar gráficos solo al entrar a la vista estadísticas
            if (viewName === 'estadisticas') loadEstadisticas();

            views.forEach(view => view.style.display = 'none');
            const activeView = document.getElementById(`view-${viewName}`);
            if (activeView) activeView.style.display = 'block';

            navLinks.forEach(navLink => navLink.classList.remove('is-active'));
            link.classList.add('is-active');
            window.location.hash = viewName;
        });
    });

    // 3. Carga inicial de datos (en paralelo para mayor velocidad)
    await Promise.allSettled([
        loadOverview(),
        loadEmpresas(),
        loadConductores(),
        loadVehiculos(),
        loadTiposDocs(),
        loadEmpresasSelect(),
        loadDocumentos(),
        loadRutas()
    ]);

    // 4. Activar listeners de filtros y exportación DESPUÉS de que los datos existan
    setupUpcListeners();

    // 5. Navegar a la vista correspondiente al hash actual (o al overview por defecto)
    const validViews = Array.from(navLinks).map(l => l.getAttribute('data-view'));
    const currentHash = window.location.hash.replace('#', '');
    const overviewLink = document.querySelector('.nav-link[data-view="overview"]');

    let linkToClick = overviewLink;
    if (currentHash && validViews.includes(currentHash)) {
        linkToClick = document.querySelector(`.nav-link[data-view="${currentHash}"]`);
    }

    if (linkToClick) {
        linkToClick.click();
    } else {
        // Fallback: mostrar overview directamente
        views.forEach(v => v.style.display = 'none');
        const ov = document.getElementById('view-overview');
        if (ov) ov.style.display = 'block';
        if (headerTitle) headerTitle.textContent = 'Resumen';
    }
});
