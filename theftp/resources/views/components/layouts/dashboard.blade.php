<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Panel de Control - Observatorio</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- 
      Usamos el app.css que ya tienes, y agregamos un dashboard.css
      Debes crear este archivo: /resources/css/dashboard.css 
    -->
    @vite(['resources/css/app.css', 'resources/css/dashboard.css', 'resources/js/dashboard.js'])
</head>
<body class="font-sans antialiased bg-gray-100">

    <div class="dashboard-layout">
        
        <!-- ===== Sidebar ===== -->
        <aside class="sidebar" id="dashboard-sidebar">
            <div class="sidebar-header">
                <!-- Logos -->
                <img src="{{ asset('images/logo-alcaldia.png') }}" alt="Alcaldía" class="sidebar-logo" />
                <img src="{{ asset('images/logo-unipiloto.png') }}" alt="Unipiloto" class="sidebar-logo" />
            </div>

            <nav class="sidebar-nav">
                <p class="nav-section-title">Gestión (Secretaría)</p>
                
                <!-- Enlaces del Menú -->
                <!-- Usamos 'data-view' para el control con JS -->
                <a href="#subir_resolucion" class="nav-link is-active" data-view="subir_resolucion">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.33 0 4.5 4.5 0 01-1.41 8.775H6.75z" /></svg>
                    <span>Subir Resolución</span>
                </a>
                
                <a href="#listar_resoluciones" class="nav-link" data-view="listar_resoluciones">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span>Ver Resoluciones</span>
                </a>

                <p class="nav-section-title">Consultas</p>

                <a href="#listar_empresas" class="nav-link" data-view="listar_empresas">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m-6-13.5V21m6-16.5V21m6-12V21m-2.25-15l-3 3m0 0l-3-3m3 3V3" /></svg>
                    <span>Ver Empresas</span>
                </a>
                
                <a href="#listar_rutas" class="nav-link" data-view="listar_rutas">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <span>Ver Rutas</span>
                </a>
                
                <a href="#reporte_rutas" class="nav-link" data-view="reporte_rutas">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                    <span>Reporte de Rutas</span>
                </a>
            </nav>
        </aside>

        <!-- ===== Contenido Principal ===== -->
        <div class="dashboard-main">
            
            <!-- ===== Header (Navbar del Dashboard) ===== -->
            <header class="dashboard-header">
                <div class="header-left">
                    <button class="menu-toggle-btn" id="menu-toggle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    </button>
                    <h1 class="header-title" id="header-title">
                        Subir Resolución
                    </h1>
                </div>

                <div class="header-right">
                    <div class="user-menu">
                        <span class="user-name" id="user-name-display">Cargando...</span>
                        <div class="user-avatar" id="user-avatar">?</div>
                        <div class="user-dropdown">
                            <div class="dropdown-header" id="user-role-display">...</div>
                            <a href="#" class="dropdown-link btn-logout">Cerrar Sesión</a>
                        </div>
                    </div>
                </div>
            </header>

            <!-- ===== Slot de Contenido (Aquí se carga la vista) ===== -->
            <main class="dashboard-content">
                {{ $slot }}
            </main>
        </div>
    </div>

</body>
</html>