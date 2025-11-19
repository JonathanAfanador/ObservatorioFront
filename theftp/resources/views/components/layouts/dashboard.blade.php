<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Token CSRF para proteger los formularios y peticiones AJAX --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Panel de Control - Observatorio</title>

    {{-- Carga de tipografía principal desde Google Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    {{-- Estilos globales, estilos del dashboard y lógica principal (app + dashboard) --}}
    @vite(['resources/css/app.css', 'resources/css/dashboard.css', 'resources/js/app.js', 'resources/js/dashboard.js'])
</head>
<body class="font-sans antialiased">

    {{-- Wrapper del layout del dashboard, se oculta inicialmente para evitar parpadeos mientras carga JS --}}
    <div id="dashboard-layout-wrapper" style="visibility: hidden;">
        <div class="dashboard-layout">

            {{-- Capa oscura para cuando el sidebar está abierto en pantallas pequeñas --}}
            <div class="dashboard-overlay" id="dashboard-overlay"></div>

            {{-- Barra lateral principal del dashboard --}}
            <aside class="sidebar" id="dashboard-sidebar">
                <div class="sidebar-header">
                    {{-- Logos de las entidades asociadas al proyecto --}}
                    <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía" class="sidebar-logo" />
                    <img src="{{ asset('images/logo-unipiloto.png') }}" alt="Unipiloto" class="sidebar-logo" />
                </div>

                {{-- Navegación lateral: se rellena dinámicamente desde JS --}}
                <nav class="sidebar-nav">
                </nav>

                {{-- Zona inferior del sidebar: acceso rápido para volver a la landing --}}
                <div class="sidebar-footer">
                    <a href="#" id="btn-volver-inicio" class="nav-link btn-home" title="Ir a la página principal">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span>Volver al Inicio</span>
                    </a>
                </div>
            </aside>

            {{-- Zona principal del dashboard (encabezado + contenido) --}}
            <div class="dashboard-main">

                {{-- Encabezado superior del dashboard --}}
                <header class="dashboard-header">
                    <div class="header-left">
                        {{-- Botón para abrir/cerrar el menú lateral en móviles/tablets --}}
                        <button class="menu-toggle-btn" id="menu-toggle" aria-label="Abrir menú">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        </button>
                        {{-- Título dinámico de la sección actual del dashboard --}}
                        <h1 class="header-title" id="header-title">
                            Dashboard
                        </h1>
                    </div>

                    <div class="header-right">
                        {{-- Menú de usuario (nombre, rol y opción de cerrar sesión) --}}
                        <div class="user-menu">
                            <button class="user-menu-toggle" id="user-menu-toggle" aria-label="Abrir menú de usuario">
                                <span class="user-name" id="user-name-display">Cargando...</span>
                                <div class="user-avatar" id="user-avatar">?</div>
                            </button>

                            {{-- Desplegable con info de usuario y botón de logout --}}
                            <div class="user-dropdown" id="user-dropdown">
                                <div class="dropdown-header" id="user-role-display">
                                    <span class="dropdown-header-name">...</span>
                                    <span>...</span>
                                </div>
                                <a href="#" class="dropdown-link btn-logout">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                    </svg>
                                    <span>Cerrar Sesión</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {{-- Contenido variable del dashboard: cada vista inyecta aquí su HTML --}}
                <main class="dashboard-content">
                    {{ $slot }}
                </main>
            </div>
        </div>
    </div>

    {{-- Librerías externas para gráficas, exportación y generación de documentos --}}
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</body>
</html>
