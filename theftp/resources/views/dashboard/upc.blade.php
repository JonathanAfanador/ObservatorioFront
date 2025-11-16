@php
use Illuminate\Support\Facades\Auth;
$user = Auth::user();
$isUPC = $user && ( ($user->rol->descripcion ?? '') === 'UPC' );
$currentPage = request()->get('page', 'dashboard');

// Si no hay usuario autenticado en sesión pero hay token en localStorage, obtener info del usuario
if (!$user) {
    $user = new stdClass();
    $user->name = 'Usuario';
    $user->rol = new stdClass();
    $user->rol->descripcion = 'N/A';
}
@endphp

<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard UPC - Observatorio de Tránsito</title>
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
        <h5><i class="fas fa-chart-bar"></i> Observatorio UPC</h5>
        <p>Análisis y Reportes</p>
      </div>
      <nav>
        <a href="/" class="">
          <i class="fas fa-arrow-left"></i> Inicio
        </a>
        <a href="?page=dashboard" class="{{ $currentPage === 'dashboard' ? 'active' : '' }}">
          <i class="fas fa-home"></i> Panel Principal
        </a>
        <a href="?page=reportes" class="{{ $currentPage === 'reportes' ? 'active' : '' }}">
          <i class="fas fa-file-csv"></i> Descargar Reportes
        </a>
        <a href="?page=consultas" class="{{ $currentPage === 'consultas' ? 'active' : '' }}">
          <i class="fas fa-search"></i> Consultas de Datos
        </a>
        <a href="?page=estadisticas" class="{{ $currentPage === 'estadisticas' ? 'active' : '' }}">
          <i class="fas fa-chart-pie"></i> Estadísticas
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
      </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <!-- TOPBAR -->
      <div class="topbar">
        <div>
          <p class="page-title">Observatorio UPC</p>
          <p class="page-subtitle">Sistema de Análisis y Reportes de Tránsito</p>
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
        <!-- DASHBOARD -->
        <div class="row g-4">
          <div class="col-md-3">
            <div class="stat-card">
              <i class="fas fa-building" style="font-size: 32px; color: #28a745;"></i>
              <div class="stat-number" id="stat-empresas">-</div>
              <div class="stat-label">Empresas Registradas</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <i class="fas fa-users" style="font-size: 32px; color: #007bff;"></i>
              <div class="stat-number" id="stat-conductores">-</div>
              <div class="stat-label">Conductores Activos</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <i class="fas fa-car" style="font-size: 32px; color: #ffc107;"></i>
              <div class="stat-number" id="stat-vehiculos">-</div>
              <div class="stat-label">Vehículos Operativos</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <i class="fas fa-route" style="font-size: 32px; color: #dc3545;"></i>
              <div class="stat-number" id="stat-rutas">-</div>
              <div class="stat-label">Rutas Activas</div>
            </div>
          </div>
        </div>
        <div class="report-section">
          <h4>Acceso Rápido a Reportes</h4>
          <p class="text-muted" style="margin-bottom: 20px;">Descargar reportes consolidados del sistema.</p>
          @if($isUPC)
            <a href="/api/reportes/empresas" onclick="return downloadReport(this, event)" class="report-btn"><i class="fas fa-download"></i> Empresas Registradas</a>
            <a href="/api/reportes/conductores-activos" onclick="return downloadReport(this, event)" class="report-btn"><i class="fas fa-download"></i> Conductores Activos</a>
            <a href="/api/reportes/vehiculos-operativos" onclick="return downloadReport(this, event)" class="report-btn"><i class="fas fa-download"></i> Vehículos Operativos</a>
            <a href="/api/reportes/rutas-activas" onclick="return downloadReport(this, event)" class="report-btn"><i class="fas fa-download"></i> Rutas Activas</a>
            <a href="/api/reportes/resoluciones" onclick="return downloadReport(this, event)" class="report-btn"><i class="fas fa-download"></i> Resoluciones</a>
          @else
            <button class="report-btn" disabled><i class="fas fa-download"></i> Empresas (No autorizado)</button>
            <button class="report-btn" disabled><i class="fas fa-download"></i> Conductores (No autorizado)</button>
            <button class="report-btn" disabled><i class="fas fa-download"></i> Vehículos (No autorizado)</button>
            <button class="report-btn" disabled><i class="fas fa-download"></i> Rutas (No autorizado)</button>
            <button class="report-btn" disabled><i class="fas fa-download"></i> Resoluciones (No autorizado)</button>
          @endif
        </div>

      @elseif($currentPage === 'reportes')
        <!-- REPORTES -->
        <div class="report-section">
          <h4><i class="fas fa-file-csv"></i> Descargar Reportes Consolidados</h4>
          <p class="text-muted" style="margin-bottom: 20px;">Selecciona el tipo de reporte que deseas descargar en formato CSV.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            @if($isUPC)
              <a href="/api/reportes/empresas" onclick="return downloadReport(this, event)" class="report-btn" style="display: flex; align-items: center; justify-content: center; text-align: center;">
                <div><i class="fas fa-building" style="display: block; font-size: 24px; margin-bottom: 8px;"></i> Empresas Registradas</div>
              </a>
              <a href="/api/reportes/conductores-activos" onclick="return downloadReport(this, event)" class="report-btn" style="display: flex; align-items: center; justify-content: center; text-align: center;">
                <div><i class="fas fa-users" style="display: block; font-size: 24px; margin-bottom: 8px;"></i> Conductores Activos</div>
              </a>
              <a href="/api/reportes/vehiculos-operativos" onclick="return downloadReport(this, event)" class="report-btn" style="display: flex; align-items: center; justify-content: center; text-align: center;">
                <div><i class="fas fa-car" style="display: block; font-size: 24px; margin-bottom: 8px;"></i> Vehículos Operativos</div>
              </a>
              <a href="/api/reportes/rutas-activas" onclick="return downloadReport(this, event)" class="report-btn" style="display: flex; align-items: center; justify-content: center; text-align: center;">
                <div><i class="fas fa-route" style="display: block; font-size: 24px; margin-bottom: 8px;"></i> Rutas Activas por Empresa</div>
              </a>
              <a href="/api/reportes/resoluciones" onclick="return downloadReport(this, event)" class="report-btn" style="display: flex; align-items: center; justify-content: center; text-align: center;">
                <div><i class="fas fa-file-alt" style="display: block; font-size: 24px; margin-bottom: 8px;"></i> Resoluciones Emitidas</div>
              </a>
            @else
              <p class="alert alert-warning">No tienes permisos para descargar reportes. Solo usuarios con rol <strong>UPC</strong> pueden acceder.</p>
            @endif
          </div>
        </div>

      @elseif($currentPage === 'consultas')
        <!-- CONSULTAS -->
        <div class="report-section">
          <h4><i class="fas fa-search"></i> Consultas de Datos</h4>
          <p class="text-muted" style="margin-bottom: 20px;">Visualiza información del sistema en tablas interactivas (solo lectura).</p>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-outline-success" onclick="loadTable('empresas')">Empresas</button>
            <button type="button" class="btn btn-outline-success" onclick="loadTable('conductores')">Conductores</button>
            <button type="button" class="btn btn-outline-success" onclick="loadTable('vehiculos')">Vehículos</button>
            <button type="button" class="btn btn-outline-success" onclick="loadTable('rutas')">Rutas</button>
          </div>
          <div class="data-table mt-4">
            <p class="text-muted">Selecciona una opción arriba para cargar datos...</p>
          </div>
        </div>

      @elseif($currentPage === 'estadisticas')
        <!-- ESTADÍSTICAS -->
        <div class="report-section">
          <h4><i class="fas fa-chart-pie"></i> Estadísticas y Análisis</h4>
          <p class="text-muted" style="margin-bottom: 30px;">Comparativas y análisis entre empresas.</p>
          <div class="row g-4">
            <div class="col-md-6">
              <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h5>Distribución de Vehículos</h5>
                <p class="text-muted" style="font-size: 14px;">Total de vehículos registrados en el sistema.</p>
                <div id="stats-vehiculos" style="background: #f5f8fa; border-radius: 8px; padding: 20px; min-height: 300px;">
                  <div style="text-align: center; color: #7a8a9a;">Cargando datos...</div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h5>Distribución de Rutas</h5>
                <p class="text-muted" style="font-size: 14px;">Total de rutas registradas en el sistema.</p>
                <div id="stats-rutas" style="background: #f5f8fa; border-radius: 8px; padding: 20px; min-height: 300px;">
                  <div style="text-align: center; color: #7a8a9a;">Cargando datos...</div>
                </div>
              </div>
            </div>
          </div>
          <div class="row g-4" style="margin-top: 20px;">
            <div class="col-md-6">
              <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h5>Conductores por Tipo de Identificación</h5>
                <p class="text-muted" style="font-size: 14px;">Distribución de conductores según tipo de ID.</p>
                <div id="stats-conductores" style="background: #f5f8fa; border-radius: 8px; padding: 20px; min-height: 250px;">
                  <div style="text-align: center; color: #7a8a9a;">Cargando datos...</div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h5>Tipos de Empresas</h5>
                <p class="text-muted" style="font-size: 14px;">Cantidad de empresas por tipo registrado.</p>
                <div id="stats-empresas" style="background: #f5f8fa; border-radius: 8px; padding: 20px; min-height: 250px;">
                  <div style="text-align: center; color: #7a8a9a;">Cargando datos...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      @else
        <!-- EMPRESAS, CONDUCTORES, VEHÍCULOS -->
        <div class="report-section">
          <h4>{{ ucfirst($currentPage) }}</h4>
          <p class="text-muted" style="margin-bottom: 20px;">Consulta de información en solo lectura.</p>
          <div class="data-table">
            <p class="text-muted">Datos de {{ $currentPage }} - Cargando...</p>
          </div>
        </div>
      @endif
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    // Obtener información del usuario desde el token
    async function loadUserInfo() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No hay token, redirigiendo a login');
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Error al obtener usuario:', response.status);
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        const user = await response.json();
        console.log('Usuario cargado:', user);

        // Actualizar información del usuario en la página
        document.getElementById('userName').textContent = user.name || 'Usuario';
        document.getElementById('userRole').textContent = user.rol?.descripcion || 'N/A';

        // Verificar si es UPC
        const isUPC = user.rol?.descripcion === 'UPC';
        if (!isUPC) {
          // Si no es UPC, deshabilitar botones de descarga
          const downloadButtons = document.querySelectorAll('.report-btn');
          downloadButtons.forEach(btn => {
            if (!btn.disabled && !btn.textContent.includes('No autorizado')) {
              btn.disabled = true;
              btn.title = 'No tienes permisos para descargar reportes';
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // Cargar información cuando la página carga
    document.addEventListener('DOMContentLoaded', function() {
      loadUserInfo();
      loadDashboardStats();
      if (document.getElementById('stats-vehiculos')) {
        loadStatisticsData();
      }
    });

    function loadTable(type) {
      // Placeholder para cargar datos dinámicamente
      const tableDiv = document.querySelector('.data-table');
      tableDiv.innerHTML = `<p class="text-muted">Cargando datos de ${type}...</p>`;
    }

    // Load Dashboard Statistics
    async function loadDashboardStats() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/estadisticas/resumen', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          document.getElementById('stat-empresas').textContent = data.empresas || 0;
          document.getElementById('stat-conductores').textContent = data.conductores || 0;
          document.getElementById('stat-vehiculos').textContent = data.vehiculos || 0;
          document.getElementById('stat-rutas').textContent = data.rutas || 0;
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    }

    // Load Detailed Statistics
    async function loadStatisticsData() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/estadisticas/detallado', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          renderVehiculosStats(data.vehiculos || []);
          renderRutasStats(data.rutas || []);
          renderConductoresStats(data.conductores || []);
          renderEmpresasStats(data.empresas || []);
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    }

    function renderVehiculosStats(data) {
      let html = '<ul style="list-style: none; padding: 0;">';
      data.forEach(item => {
        const percentage = ((item.count / (data.reduce((sum, x) => sum + x.count, 0) || 1)) * 100).toFixed(1);
        html += `
          <li style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <strong>${item.tipo}</strong>
              <span>${item.count}</span>
            </div>
            <div style="background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background: #28a745; height: 100%; width: ${percentage}%;"></div>
            </div>
          </li>
        `;
      });
      html += '</ul>';
      document.getElementById('stats-vehiculos').innerHTML = html || '<p class="text-muted">Sin datos</p>';
    }

    function renderRutasStats(data) {
      let html = '<ul style="list-style: none; padding: 0;">';
      data.forEach(item => {
        const percentage = ((item.count / (data.reduce((sum, x) => sum + x.count, 0) || 1)) * 100).toFixed(1);
        html += `
          <li style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <strong>${item.empresa.substring(0, 30)}</strong>
              <span>${item.count}</span>
            </div>
            <div style="background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background: #dc3545; height: 100%; width: ${percentage}%;"></div>
            </div>
          </li>
        `;
      });
      html += '</ul>';
      document.getElementById('stats-rutas').innerHTML = html || '<p class="text-muted">Sin datos</p>';
    }

    function renderConductoresStats(data) {
      let html = '<ul style="list-style: none; padding: 0;">';
      data.forEach(item => {
        html += `
          <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${item.tipo_ident}</strong>
              <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${item.count}</span>
            </div>
          </li>
        `;
      });
      html += '</ul>';
      document.getElementById('stats-conductores').innerHTML = html || '<p class="text-muted">Sin datos</p>';
    }

    function renderEmpresasStats(data) {
      let html = '<ul style="list-style: none; padding: 0;">';
      data.forEach(item => {
        html += `
          <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${item.tipo_empresa}</strong>
              <span style="background: #ffc107; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${item.count}</span>
            </div>
          </li>
        `;
      });
      html += '</ul>';
      document.getElementById('stats-empresas').innerHTML = html || '<p class="text-muted">Sin datos</p>';
    }

    // Logout
    function logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
      window.location.href = '/';
    }

    // Download Report
    async function downloadReport(element, event) {
      event.preventDefault();
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return false;
      }

      try {
        const url = element.href;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            window.location.href = '/login';
          } else {
            alert(`Error al descargar el reporte: ${response.statusText}`);
          }
          return false;
        }

        // Get the CSV content
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Extract filename from URL or use default
        const urlParts = url.split('/');
        const reportType = urlParts[urlParts.length - 1];
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `${reportType}_${timestamp}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Error descargando reporte:', error);
        alert('Ocurrió un error al descargar el reporte. Revisa la consola.');
      }

      return false;
    }
  </script>
</body>
</html>
