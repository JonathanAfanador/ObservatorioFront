<x-layouts.dashboard>

    <!-- Contenedor general donde se mostrarán las notificaciones flotantes -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"></div>

    <!-- UPC - Dashboard del módulo de consulta y estadísticas (solo lectura) -->

    <!-- 1. Panel Estratégico de Gestión (Tarjetas KPIs y Gráficos Analíticos) -->
    <div id="view-overview" class="dashboard-view">
        <div class="content-card">
            <!-- Encabezado Estratégico Premium -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; border-bottom: 1px solid #f1f5f9; padding-bottom: 2rem; margin-bottom: 2rem;">
                <div style="display: flex; gap: 1.25rem; align-items: flex-start;">
                    <!-- Acento visual lateral -->
                    <div style="width: 4px; height: 48px; background: linear-gradient(to bottom, #3b82f6, #6366f1); border-radius: 4px;"></div>
                    <div>
                        <div style="margin-bottom: 0.25rem;">
                            <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; margin: 0;">Panel Estratégico de Gestión</h2>
                        </div>
                        <p style="font-size: 0.9375rem; color: #64748b; margin: 0; max-width: 500px; line-height: 1.5;">Monitorización inteligente de indicadores clave de rendimiento y análisis operativo del sistema de transporte.</p>
                    </div>
                </div>

                <div class="export-buttons">
                    <button id="btn-export-summary" 
                            style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.625rem; transition: all 0.2s; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);">
                        <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,9H15V3H9V9H5L12,16L19,9M5,18V20H19V18H5Z" />
                        </svg>
                        <span>Emitir Informe Ejecutivo</span>
                    </button>
                </div>
            </div>

            <!-- Centro de Inteligencia Operativa y Riesgos -->
            <div id="upc-insights-container" style="margin-bottom: 2rem; display: none;"></div>

            <!-- Sección 1: Indicadores Clave (KPIs) -->
            <div id="upc-cards" class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
                <!-- Se cargan vía JS (upc-overview.js) -->
            </div>

            <!-- Sección 2: Análisis Visual e Interactivo -->
            <div style="margin-top: 3rem;">
                <h3 class="text-lg font-bold text-gray-800 mb-6" style="display: flex; align-items: center; gap: 0.5rem;">
                    Analítica Operativa en Tiempo Real
                </h3>
                
                <div id="estadisticas-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
                    <!-- Gráfico 1: Vehículos por Tipo -->
                    <div class="chart-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                        <h4 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Distribución de Flota por Tipo</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="graficoVehiculosPorTipo"></canvas>
                        </div>
                    </div>

                    <!-- Gráfico 2: Conductores por Género -->
                    <div class="chart-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                        <h4 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Demografía de Conductores</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="graficoConductoresPorGenero"></canvas>
                        </div>
                    </div>

                    <!-- Gráfico 3: Empresas por Tipo -->
                    <div class="chart-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                        <h4 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Composición Empresarial</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="graficoEmpresasPorTipo"></canvas>
                        </div>
                    </div>

                    <!-- Gráfico 4: Evolución de Flota por Modelo -->
                    <div class="chart-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                        <h4 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Antigüedad/Modelo de Flota</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="graficoVehiculosPorModelo"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. Vista de Empresas Registradas -->
    <div id="view-empresas" class="dashboard-view" style="display:none;">
        <div class="content-card">

            <!-- Encabezado de la sección -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Reporte de Empresas de Transporte</h2>
                    <p class="text-gray-600 mb-4">Consulta y descarga del registro completo de empresas de transporte bajo auditoría.</p>
                </div>

                <!-- Botones de exportación -->
                <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="empresas" title="Descargar Reporte CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                        <span>CSV (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="empresas" title="Descargar Reporte Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,20H14L12,16.6L10,20H8.2L11.1,15.5L8.2,11H10L12,14.4L14,11H15.8L12.9,15.5L15.8,20Z" /></svg>
                        <span>Excel (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="empresas" title="Descargar Reporte PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,13H11V15H10V13H8V12H10V10H11V12H13V13Z" /></svg>
                        <span>PDF (Auditoría)</span>
                    </button>
                </div>
            </div>

            <!-- Filtro de búsqueda -->
            <div class="filter-bar" style="margin-top: 1rem;">
                <input type="text" id="filter-empresas" placeholder="Filtrar por nombre o NIT..." class="form-input" style="width: 100%;">
            </div>

            <!-- Tabla cargada por JavaScript -->
            <div id="empresas-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 3. Conductores -->
    <div id="view-conductores" class="dashboard-view" style="display:none;">
        <div class="content-card">

            <!-- Encabezado -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Reporte de Conductores</h2>
                    <p class="text-gray-600 mb-4">Reporte auditado de conductores habilitados, licencias y estados actuales.</p>
                </div>

                <!-- Exportación -->
                <div class="export-buttons">
                    <!-- Botones CSV, Excel y PDF -->
                    <button class="btn-export" data-format="csv" data-target="conductores" title="Descargar Reporte CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                        <span>CSV (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="conductores" title="Descargar Reporte Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,20H14L12,16.6L10,20H8.2L11.1,15.5L8.2,11H10L12,14.4L14,11H15.8L12.9,15.5L15.8,20Z" /></svg>
                        <span>Excel (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="conductores" title="Descargar Reporte PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,13H11V15H10V13H8V12H10V10H11V12H13V13Z" /></svg>
                        <span>PDF (Auditoría)</span>
                    </button>
                </div>
            </div>

            <!-- Buscador -->
            <div class="filter-bar" style="margin-top: 1rem;">
                <input type="text" id="filter-conductores" placeholder="Filtrar por nombre, apellido o identificación..." class="form-input" style="width: 100%;">
            </div>

            <!-- Tabla dinámica -->
            <div id="conductores-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 4. Vehículos en Servicio -->
    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
        <div class="content-card">

            <!-- Encabezado -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Reporte de Vehículos en Servicio</h2>
                    <p class="text-gray-600 mb-4">Informe consolidado de vehículos habilitados actualmente para transporte público.</p>
                </div>

                <!-- Botones de exportación -->
                <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="vehiculos" title="Descargar Reporte CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                        <span>CSV (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="vehiculos" title="Descargar Reporte Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,20H14L12,16.6L10,20H8.2L11.1,15.5L8.2,11H10L12,14.4L14,11H15.8L12.9,15.5L15.8,20Z" /></svg>
                        <span>Excel (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="vehiculos" title="Descargar Reporte PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,13H11V15H10V13H8V12H10V10H11V12H13V13Z" /></svg>
                        <span>PDF (Auditoría)</span>
                    </button>
                </div>
            </div>

            <!-- Buscador -->
            <div class="filter-bar" style="margin-top: 1rem;">
                <input type="text" id="filter-vehiculos" placeholder="Filtrar por placa, marca o modelo..." class="form-input" style="width: 100%;">
            </div>

            <!-- Tabla -->
            <div id="vehiculos-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 5. Rutas Autorizadas -->
    <div id="view-rutas" class="dashboard-view" style="display:none;">
        <div class="content-card">

            <!-- Encabezado -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Reporte de Rutas Autorizadas</h2>
                    <p class="text-gray-600 mb-4">Informe detallado de rutas y empresas prestadoras autorizadas.</p>
                </div>

                <!-- Botones para exportar info -->
                <!-- Botones de exportación -->
                <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="rutas" title="Descargar Reporte CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                        <span>CSV (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="rutas " title="Descargar Reporte Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,20H14L12,16.6L10,20H8.2L11.1,15.5L8.2,11H10L12,14.4L14,11H15.8L12.9,15.5L15.8,20Z" /></svg>
                        <span>Excel (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="rutas" title="Descargar Reporte PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,13H11V15H10V13H8V12H10V10H11V12H13V13Z" /></svg>
                        <span>PDF (Auditoría)</span>
                    </button>
                </div>
            </div>

            <!-- Filtros: nombre y empresa -->
            <div class="filter-bar" style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <input type="text" id="filter-rutas" placeholder="Filtrar por nombre de ruta..." class="form-input">
                <div style="display:flex; gap: 1rem; align-items: center;">
                    <label for="select-empresa-rutas" class="text-sm font-medium">Empresa:</label>
                    <select id="select-empresa-rutas" class="form-input">
                        <option value="">Todas las empresas</option>
                    </select>
                </div>
            </div>

            <!-- Tabla -->
            <div id="rutas-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 6. Documentos y Resoluciones -->
    <div id="view-documentos" class="dashboard-view" style="display:none;">
        <div class="content-card">

            <!-- Encabezado -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Reporte de Documentos y Resoluciones</h2>
                    <p class="text-gray-600 mb-4">Repositorio auditado de documentos oficiales y resoluciones administrativas.</p>
                </div>

                <!-- Exportación -->
                <!-- Botones de exportación -->
                <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="documentos" title="Descargar Reporte CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                        <span>CSV (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="documentos" title="Descargar Reporte Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.8,20H14L12,16.6L10,20H8.2L11.1,15.5L8.2,11H10L12,14.4L14,11H15.8L12.9,15.5L15.8,20Z" /></svg>
                        <span>Excel (Auditoría)</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="documentos" title="Descargar Reporte PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,13H11V15H10V13H8V12H10V10H11V12H13V13Z" /></svg>
                        <span>PDF (Auditoría)</span>
                    </button>
                </div>
            </div>

            <!-- Filtros -->
            <div class="filter-bar" style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <input type="text" id="filter-documentos" placeholder="Filtrar por observación o URL..." class="form-input">
                <div style="display:flex; gap: 1rem; align-items: center;">
                    <label for="select-tipo-docs">Tipo:</label>
                    <select id="select-tipo-docs" class="form-input"></select>
                </div>
            </div>

            <!-- Tabla -->
            <div id="documentos-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- Secciones adicionales de reporte omitidas para brevedad, ver dashboard-upc.js para lógica -->

    {{-- Archivo JavaScript donde está toda la lógica del dashboard UPC --}}
    @vite(['resources/js/dashboard-upc.js'])

</x-layouts.dashboard>
