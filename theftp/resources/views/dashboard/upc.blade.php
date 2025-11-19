<x-layouts.dashboard>

    <!-- Contenedor general donde se mostrarán las notificaciones flotantes -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"></div>

    <!-- UPC - Dashboard del módulo de consulta y estadísticas (solo lectura) -->

    <!-- 1. Vista de resumen general (tarjetas con totales principales) -->
    <div id="view-overview" class="dashboard-view">
        <div class="content-card">

            <!-- Encabezado con título y botón para exportar -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Resumen General</h2>
                    <p class="text-gray-600 mb-4">Visualización consolidada de las métricas principales.</p>
                </div>

                <!-- Botón para descargar el informe del resumen -->
                <div class="export-buttons">
                    <button id="btn-export-summary" class="btn-export" data-format="pdf" title="Descargar Resumen en PDF" style="background-color: #7C3AED; border-color: #6D28D9;">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 1.25em; height: 1.25em;">
                            <path d="M19,9H15V3H9V9H5L12,16L19,9M5,18V20H19V18H5Z" />
                        </svg>
                        <span>Descargar Resumen</span>
                    </button>
                </div>
            </div>

            <!-- Aquí se cargan dinámicamente las tarjetas del resumen -->
            <div id="upc-cards" class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));"></div>
        </div>
    </div>

    <!-- 2. Vista de Empresas Registradas -->
    <div id="view-empresas" class="dashboard-view" style="display:none;">
        <div class="content-card">

            <!-- Encabezado de la sección -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div>
                    <h2 class="content-title">Empresas de Transporte</h2>
                    <p class="text-gray-600 mb-4">Consulta el registro completo de empresas de transporte registradas en el sistema.</p>
                </div>

                <!-- Botones de exportación -->
                <div class="export-buttons">
                    <button class="btn-export" data-format="csv" data-target="empresas" title="Exportar a CSV">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6..." /></svg>
                        <span>CSV</span>
                    </button>
                    <button class="btn-export" data-format="excel" data-target="empresas" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6..." /></svg>
                        <span>Excel</span>
                    </button>
                    <button class="btn-export" data-format="pdf" data-target="empresas" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6..." /></svg>
                        <span>PDF</span>
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
                    <h2 class="content-title">Conductores</h2>
                    <p class="text-gray-600 mb-4">Directorio de conductores habilitados con información de licencias y estado actual.</p>
                </div>

                <!-- Exportación -->
                <div class="export-buttons">
                    <!-- Botones CSV, Excel y PDF -->
                    ...
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
                    <h2 class="content-title">Vehículos en Servicio</h2>
                    <p class="text-gray-600 mb-4">Registro de vehículos habilitados actualmente en servicio de transporte público.</p>
                </div>

                <!-- Botones de exportación -->
                <div class="export-buttons">...</div>
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
                    <h2 class="content-title">Rutas Autorizadas</h2>
                    <p class="text-gray-600 mb-4">Consulta las rutas autorizadas. Filtra por empresa o nombre.</p>
                </div>

                <!-- Botones para exportar info -->
                <div class="export-buttons">...</div>
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
                    <h2 class="content-title">Documentos y Resoluciones</h2>
                    <p class="text-gray-600 mb-4">Repositorio de documentos oficiales y resoluciones administrativas.</p>
                </div>

                <!-- Exportación -->
                <div class="export-buttons">...</div>
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

    <!-- 7. Panel de Estadísticas y Gráficos -->
    <div id="view-estadisticas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Estadísticas y Análisis</h2>
            <p class="text-gray-600 mb-4">Panel de análisis con métricas y estadísticas consolidadas del sistema de transporte.</p>

            <!-- Contenedor principal de los gráficos -->
            <div id="estadisticas-container" style="margin-top:1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">

                <!-- Cada tarjeta contiene un gráfico distinto -->
                <div class="chart-container" style="position: relative; height:300px; padding: 1rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h3 class="text-lg font-semibold text-center mb-3">Vehículos en Servicio por Tipo</h3>
                    <canvas id="graficoVehiculosPorTipo"></canvas>
                </div>

                <div class="chart-container" style="position: relative; height:300px; padding: 1rem; background: #fff;">
                    <h3 class="text-lg font-semibold text-center mb-3">Conductores por Género</h3>
                    <canvas id="graficoConductoresPorGenero"></canvas>
                </div>

                <div class="chart-container" style="position: relative; height:350px; padding: 1rem; background: #fff;">
                    <h3 class="text-lg font-semibold text-center mb-3">Empresas por Tipo</h3>
                    <canvas id="graficoEmpresasPorTipo"></canvas>
                </div>

                <div class="chart-container" style="position: relative; height:350px; padding: 1rem; background: #fff;">
                    <h3 class="text-lg font-semibold text-center mb-3">Flota de Vehículos por Modelo</h3>
                    <canvas id="graficoVehiculosPorModelo"></canvas>
                </div>

                <div class="chart-container" style="position: relative; height:350px; padding: 1rem; background: #fff;">
                    <h3 class="text-lg font-semibold text-center mb-3">Rutas por Empresa (Top 10)</h3>
                    <canvas id="graficoRutasPorEmpresa"></canvas>
                </div>
            </div>
        </div>
    </div>

    {{-- Archivo JavaScript donde está toda la lógica del dashboard UPC --}}
    @vite(['resources/js/dashboard-upc.js'])

</x-layouts.dashboard>
