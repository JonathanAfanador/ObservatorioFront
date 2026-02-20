{{-- resources/views/geovisor/geovisor_vite.blade.php — v7 --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Geovisor · Rutas y Paraderos · Observatorio</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3C/svg%3E">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/geovisor.css', 'resources/js/geovisor.js'])
</head>
<body>
<div id="geovisor-root">

    {{-- ── HEADER ─────────────────────────────────────────────────────────── --}}
    <header class="geovisor-header" role="banner">

        {{-- Izquierda: botón volver --}}
        <div class="geovisor-header-left">
            <a href="{{ url('/') }}" class="geovisor-back-btn" aria-label="Volver al inicio">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="2" stroke="currentColor" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                </svg>
                <span>Inicio</span>
            </a>
        </div>

        {{-- Centro: título --}}
        <div class="geovisor-header-center">
            <h1 class="geovisor-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5" stroke="currentColor" width="18" height="18" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                </svg>
                Geovisor de Rutas y Paraderos
            </h1>
        </div>

        {{-- Derecha: botones de acción (visibles en desktop) --}}
        <div class="geovisor-header-right">
            <button id="btn-toggle-layers"
                    class="geovisor-ctrl-btn"
                    aria-label="Mostrar u ocultar panel de capas"
                    aria-expanded="true"
                    aria-controls="geovisor-layers-panel">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="2" stroke="currentColor" width="15" height="15">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"/>
                </svg>
                <span>Capas</span>
            </button>

            <button id="btn-reset-view" class="geovisor-ctrl-btn" aria-label="Reiniciar vista del mapa">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="2" stroke="currentColor" width="15" height="15">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                <span>Reiniciar vista</span>
            </button>

            <div id="geovisor-loader" class="geovisor-loader" role="status" aria-live="polite">
                <span class="geovisor-loader-spinner" aria-hidden="true"></span>
                <span>Cargando...</span>
            </div>
        </div>

        {{-- Hamburguesa: solo visible en móvil --}}
        <button id="btn-hamburger"
                class="geovisor-hamburger"
                aria-label="Abrir menú"
                aria-expanded="false"
                aria-controls="geovisor-mobile-menu">
            {{-- Ícono hamburguesa (3 rayas) --}}
            <svg id="hamburger-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
            {{-- Ícono X (cerrar) --}}
            <svg id="hamburger-close-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"
                 style="display:none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>

    </header>

    {{-- ── MENÚ MÓVIL desplegable (debajo del header) ──────────────────────── --}}
    <div id="geovisor-mobile-menu" class="geovisor-mobile-menu geovisor-mobile-menu--hidden" role="navigation">

        {{-- Loader dentro del menú móvil (comparte el estado con el del header) --}}
        <div id="geovisor-loader-mobile" class="geovisor-loader geovisor-loader--mobile" role="status" aria-live="polite">
            <span class="geovisor-loader-spinner" aria-hidden="true"></span>
            <span>Cargando capas...</span>
        </div>

        <button id="btn-toggle-layers-mobile"
                class="geovisor-menu-item"
                aria-label="Mostrar u ocultar panel de capas">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke-width="2" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"/>
            </svg>
            <span>Mostrar / ocultar capas</span>
        </button>

        <button id="btn-reset-view-mobile"
                class="geovisor-menu-item"
                aria-label="Reiniciar vista del mapa">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke-width="2" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            <span>Reiniciar vista</span>
        </button>

        <a href="{{ url('/') }}" class="geovisor-menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke-width="2" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            <span>Volver al inicio</span>
        </a>
    </div>

    {{-- ── ALERTA KMZ faltantes ────────────────────────────────────────────── --}}
    @if(count($missingFiles) > 0)
    <div class="geovisor-alert geovisor-alert--warning" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor" width="18" height="18" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <span>
            Archivos no encontrados en <code>public/maps/</code>:
            <strong>{{ implode(', ', array_column($missingFiles, 'label')) }}</strong>
        </span>
    </div>
    @endif

    {{-- ── ÁREA PRINCIPAL ──────────────────────────────────────────────────── --}}
    <div class="geovisor-workspace">

        <div id="geovisor-panel-overlay" aria-hidden="true"></div>

        {{-- PANEL DE CAPAS --}}
        <aside id="geovisor-layers-panel"
               class="geovisor-layers-panel"
               role="complementary"
               aria-label="Panel de capas del mapa">

            <div class="layers-section">
                <h3 class="layers-section-title">Mapa base</h3>
                <div id="layers-base-section" class="layers-list"></div>
            </div>

            <div class="layers-divider"></div>

            <div class="layers-section">
                <h3 class="layers-section-title">Capas de datos</h3>
                <p class="layers-section-hint">Activa o desactiva cada capa</p>
                <div id="layers-overlay-section" class="layers-list"></div>
            </div>
        </aside>

        {{-- MAPA --}}
        <main class="geovisor-main" role="main">
            <div id="geovisor-map"
                 aria-label="Mapa interactivo de rutas y paraderos"
                 tabindex="0">
            </div>
        </main>

        {{-- PANEL DE INFORMACIÓN --}}
        <aside id="geovisor-info-panel"
               class="geovisor-info-panel geovisor-info-panel--hidden"
               role="complementary"
               aria-label="Información del elemento seleccionado">
            <div class="geovisor-info-header">
                <h2 id="geovisor-info-title" class="geovisor-info-title">—</h2>
                <button id="geovisor-info-close" class="geovisor-info-close"
                        aria-label="Cerrar panel de información">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         stroke-width="2.5" stroke="currentColor" width="14" height="14">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div id="geovisor-info-body" class="geovisor-info-body">
                <p class="geovisor-info-placeholder">
                    Selecciona una ruta o paradero en el mapa para ver su información.
                </p>
            </div>
        </aside>

    </div>{{-- /.geovisor-workspace --}}

</div>{{-- /#geovisor-root --}}

{{-- Data bridge Blade → JS --}}
<script id="geovisor-config" type="application/json">
{
    "mapCenter": {
        "lat":  {{ $mapCenter['lat'] }},
        "lng":  {{ $mapCenter['lng'] }},
        "zoom": {{ $mapCenter['zoom'] }}
    },
    "kmzFiles": @json(
        array_map(fn($f) => ['url' => $f['url'], 'label' => $f['label']], $kmzFiles)
    )
}
</script>

{{-- ── Menú hamburguesa: JS mínimo e independiente ─────────────────────────
     No toca ni interfiere con geovisor.js.
     Conecta los botones del menú móvil con los botones reales del header.
────────────────────────────────────────────────────────────────────────── --}}
<script>
(function () {
    const hamburger      = document.getElementById('btn-hamburger');
    const menu           = document.getElementById('geovisor-mobile-menu');
    const iconOpen       = document.getElementById('hamburger-icon');
    const iconClose      = document.getElementById('hamburger-close-icon');

    // Botones reales (los usa geovisor.js internamente)
    const btnLayers      = document.getElementById('btn-toggle-layers');
    const btnReset       = document.getElementById('btn-reset-view');

    // Espejo móvil
    const btnLayersMobile = document.getElementById('btn-toggle-layers-mobile');
    const btnResetMobile  = document.getElementById('btn-reset-view-mobile');

    // Loader: sincronizar visibilidad entre desktop y móvil
    const loaderDesktop = document.getElementById('geovisor-loader');
    const loaderMobile  = document.getElementById('geovisor-loader-mobile');

    if (loaderDesktop && loaderMobile) {
        const observer = new MutationObserver(() => {
            loaderMobile.style.display = loaderDesktop.style.display;
        });
        observer.observe(loaderDesktop, { attributes: true, attributeFilter: ['style'] });
    }

    // ── Toggle del menú ──────────────────────────────────────────────────
    function openMenu() {
        menu.classList.remove('geovisor-mobile-menu--hidden');
        hamburger.setAttribute('aria-expanded', 'true');
        iconOpen.style.display  = 'none';
        iconClose.style.display = 'block';
    }

    function closeMenu() {
        menu.classList.add('geovisor-mobile-menu--hidden');
        hamburger.setAttribute('aria-expanded', 'false');
        iconOpen.style.display  = 'block';
        iconClose.style.display = 'none';
    }

    hamburger.addEventListener('click', () => {
        menu.classList.contains('geovisor-mobile-menu--hidden') ? openMenu() : closeMenu();
    });

    // Cerrar al tocar fuera
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
            closeMenu();
        }
    });

    // ── Botones espejo → delegan al botón real ───────────────────────────
    btnLayersMobile?.addEventListener('click', () => {
        closeMenu();
        btnLayers?.click(); // dispara el toggle de capas de geovisor.js
    });

    btnResetMobile?.addEventListener('click', () => {
        closeMenu();
        btnReset?.click(); // dispara el reset de vista de geovisor.js
    });
})();
</script>

</body>
</html>