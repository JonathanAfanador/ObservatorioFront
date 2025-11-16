@php
use Illuminate\Support\Facades\Auth;
$user = Auth::user();
$currentPage = request()->get('page', 'dashboard');

if (!$user) {
        $user = new stdClass();
        $user->name = 'Usuario';
        $user->rol = new stdClass();
        $user->rol->descripcion = 'Secretaría';
}
@endphp

<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard Secretaría - Observatorio de Tránsito</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f5f8fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .wrapper { display: flex; min-height: 100vh; }
        .sidebar { width: 270px; background: #1a3a4a; color: #fff; padding: 0; min-height: 100vh; position: fixed; left: 0; top: 0; overflow-y: auto; z-index: 1000; }
        .sidebar .logo { padding: 25px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar .logo h5 { margin: 0; font-size: 18px; font-weight: 600; }
        .sidebar .logo p { margin: 5px 0 0 0; font-size: 12px; color: #a0b8c8; }
        .sidebar nav { padding: 20px 0; }
        .sidebar nav a { display: flex; align-items: center; padding: 12px 20px; color: #c7d2da; text-decoration: none; transition: all 0.3s; border-left: 3px solid transparent; }
        .sidebar nav a:hover { background: rgba(255,255,255,0.1); border-left-color: #28a745; }
        .sidebar nav a.active { background: rgba(40,167,69,0.2); border-left-color: #28a745; color: #fff; font-weight: 600; }
        .sidebar nav a i { width: 20px; margin-right: 12px; }
        .main-content { margin-left: 270px; flex: 1; padding: 40px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: #fff; padding: 20px 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .topbar .info { font-size: 14px; }
        .topbar .info strong { color: #1a3a4a; }
        .page-title { font-size: 28px; font-weight: 700; color: #1a3a4a; margin-bottom: 10px; }
        .page-subtitle { color: #7a8a9a; font-size: 15px; }
        .stat-card { background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; transition: transform 0.3s; }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card .stat-number { font-size: 32px; font-weight: 700; color: #28a745; margin: 10px 0; }
        .stat-card .stat-label { color: #7a8a9a; font-size: 14px; }
        .report-section { background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-top: 30px; }
        .report-section h4 { color: #1a3a4a; font-weight: 700; margin-bottom: 20px; }
        .report-btn { display: inline-block; padding: 12px 20px; margin: 8px; background: #28a745; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s; border: none; cursor: pointer; }
        .report-btn:hover { background: #1f7e38; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(40,167,69,0.3); }
        .report-btn:disabled { background: #a0b8c8; cursor: not-allowed; transform: none; }
        .data-table { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-top: 30px; }
        .data-table table { font-size: 14px; }
        .data-table th { background: #f5f8fa; color: #1a3a4a; font-weight: 700; border-top: none; }
        .data-table td { color: #2d3a47; vertical-align: middle; }
        @media (max-width: 768px) {
            .sidebar { width: 100%; height: auto; position: relative; }
            .main-content { margin-left: 0; padding: 20px; }
            .topbar { flex-direction: column; gap: 15px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- SIDEBAR -->
        <aside class="sidebar">
            <div class="logo">
                <h5><i class="fas fa-chart-bar"></i> Observatorio Secretaría</h5>
                <p>Gestión de Transporte</p>
            </div>
            <nav>
                <a href="/" class="">
                    <i class="fas fa-arrow-left"></i> Inicio
                </a>
                <a href="?page=dashboard" class="{{ $currentPage === 'dashboard' ? 'active' : '' }}">
                    <i class="fas fa-home"></i> Panel Principal
                </a>
                <a href="?page=territorial" class="{{ $currentPage === 'territorial' ? 'active' : '' }}">
                    <i class="fas fa-map"></i> Gestión Territorial
                </a>
                <a href="?page=empresas" class="{{ $currentPage === 'empresas' ? 'active' : '' }}">
                    <i class="fas fa-building"></i> Empresas
                </a>
                <a href="?page=conductores" class="{{ $currentPage === 'conductores' ? 'active' : '' }}">
                    <i class="fas fa-users"></i> Conductores
                </a>
                <a href="?page=vehiculos" class="{{ $currentPage === 'vehiculos' ? 'active' : '' }}">
                    <i class="fas fa-car"></i> Vehículos
                </a>
                <a href="?page=licencias" class="{{ $currentPage === 'licencias' ? 'active' : '' }}">
                    <i class="fas fa-id-card"></i> Licencias
                </a>
            </nav>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="main-content">
            <!-- TOPBAR -->
            <div class="topbar">
                <div>
                    <p class="page-title">Observatorio Secretaría</p>
                    <p class="page-subtitle">Sistema de Gestión y Supervisión de Transporte</p>
                </div>
                <div class="info" style="display: flex; justify-content: space-between; align-items: center; gap: 30px;">
                    <div>
                        <div>Usuario: <strong id="userName">Cargando...</strong></div>
                        <div>Rol: <strong id="userRole">Cargando...</strong></div>
                    </div>
                    <button onclick="logout()" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                    </button>
                </div>
            </div>

            <!-- PAGE CONTENT -->
            @if($currentPage === 'dashboard')
                <div class="row g-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-city" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-municipios">-</div>
                            <div class="stat-label">Municipios</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-map" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-departamentos">-</div>
                            <div class="stat-label">Departamentos</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-home" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-barrios">-</div>
                            <div class="stat-label">Barrios</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-building" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-empresas">-</div>
                            <div class="stat-label">Empresas</div>
                        </div>
                    </div>
                </div>

                <div class="row g-4 mt-3">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-users" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-conductores">-</div>
                            <div class="stat-label">Conductores</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-car" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-vehiculos">-</div>
                            <div class="stat-label">Vehículos</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-route" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-rutas">-</div>
                            <div class="stat-label">Rutas</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-id-card" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-licencias">-</div>
                            <div class="stat-label">Licencias</div>
                        </div>
                    </div>
                </div>

                <div class="row g-4 mt-3">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-user-tie" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-personas">-</div>
                            <div class="stat-label">Personas</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <i class="fas fa-users-cog" style="font-size: 32px; color: #28a745;"></i>
                            <div class="stat-number" id="stat-usuarios">-</div>
                            <div class="stat-label">Usuarios</div>
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h4>Acceso Rápido</h4>
                    <p class="text-muted">Accesos rápidos a secciones de gestión. Las acciones dependerán de los permisos del usuario.</p>
                </div>
            @else
                <div class="report-section">
                    <h4>{{ ucfirst($currentPage) }}</h4>
                    <p class="text-muted">Contenido de la sección {{ $currentPage }}.</p>
                </div>
            @endif
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        async function loadUserInfo() {
            const token = localStorage.getItem('token');
            if (!token) { window.location.href = '/login'; return; }

            try {
                const resp = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!resp.ok) { localStorage.removeItem('token'); window.location.href = '/login'; return; }
                const user = await resp.json();
                document.getElementById('userName').textContent = user.name || 'Usuario';
                document.getElementById('userRole').textContent = user.rol?.descripcion || 'N/A';
            } catch (e) { console.error(e); }
        }

        async function loadStats() {
            const token = localStorage.getItem('token');
            try {
                const resp = await fetch('/api/secretaria/estadisticas/resumen', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!resp.ok) return;
                const json = await resp.json();
                const d = json.data || {};
                document.getElementById('stat-municipios').textContent = d.municipios || 0;
                document.getElementById('stat-departamentos').textContent = d.departamentos || 0;
                document.getElementById('stat-barrios').textContent = d.barrios || 0;
                document.getElementById('stat-empresas').textContent = d.empresas || 0;
                document.getElementById('stat-conductores').textContent = d.conductores || 0;
                document.getElementById('stat-vehiculos').textContent = d.vehiculos || 0;
                document.getElementById('stat-rutas').textContent = d.rutas || 0;
                document.getElementById('stat-licencias').textContent = d.licencias || 0;
                document.getElementById('stat-personas').textContent = d.personas || 0;
                document.getElementById('stat-usuarios').textContent = d.usuarios || 0;
            } catch (e) { console.error(e); }
        }

        function logout() { localStorage.removeItem('token'); localStorage.removeItem('user_email'); window.location.href = '/login'; }

        document.addEventListener('DOMContentLoaded', function() { loadUserInfo(); loadStats(); });
    </script>
</body>
</html>
