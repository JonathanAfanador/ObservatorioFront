<x-layouts.dashboard>

    <!-- UPC - Dashboard: Panel de Consulta y Estadísticas (solo lectura) -->

    <!-- 1. Vista Overview (resumen con totales) -->
    <div id="view-overview" class="dashboard-view">
        <div class="content-card">
            <h2 class="content-title">Resumen General</h2>
            <p class="text-gray-600 mb-4">Visualización consolidada de las métricas principales del sistema de transporte.</p>

            <div id="upc-cards" class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                <!-- Cards cargadas por JS -->
            </div>
        </div>
    </div>

    <!-- 2. Empresas -->
    <div id="view-empresas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Empresas de Transporte</h2>
            <p class="text-gray-600 mb-4">Consulta el registro completo de empresas de transporte registradas en el sistema.</p>
            <div id="empresas-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 3. Conductores -->
    <div id="view-conductores" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Conductores</h2>
            <p class="text-gray-600 mb-4">Directorio de conductores habilitados con información de licencias y estado actual.</p>
            <div id="conductores-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 4. Vehículos (con filtro servicio=true) -->
    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Vehículos en Servicio</h2>
            <p class="text-gray-600 mb-4">Registro de vehículos habilitados actualmente en servicio de transporte público.</p>
            <div id="vehiculos-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 5. Rutas (selector de empresa) -->
    <div id="view-rutas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Rutas Autorizadas</h2>
            <p class="text-gray-600 mb-4">Consulta las rutas de transporte autorizadas. Filtra por empresa para obtener información específica.</p>
            <div style="display:flex; gap:1rem; align-items:center; margin-top:1rem;">
                <label for="select-empresa-rutas" class="text-sm font-medium text-gray-700">Empresa:</label>
                <select id="select-empresa-rutas" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Todas las empresas</option>
                </select>
                <button id="btn-filter-rutas" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Filtrar</button>
            </div>
            <div id="rutas-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 6. Documentos (filtrado por tipo_doc_id para resoluciones) -->
    <div id="view-documentos" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Documentos y Resoluciones</h2>
            <p class="text-gray-600 mb-4">Acceso al repositorio de documentos oficiales y resoluciones administrativas.</p>
            <div style="display:flex; gap:1rem; align-items:center; margin-top:1rem;">
                <label for="select-tipo-docs" class="text-sm font-medium text-gray-700">Tipo de documento:</label>
                <select id="select-tipo-docs" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></select>
                <button id="btn-filter-documentos" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Filtrar</button>
            </div>
            <div id="documentos-table" style="margin-top: 1rem;"></div>
        </div>
    </div>

    <!-- 7. Estadísticas (Totales y comparativas) -->
    <div id="view-estadisticas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Estadísticas y Análisis</h2>
            <p class="text-gray-600 mb-4">Panel de análisis con métricas y estadísticas consolidadas del sistema de transporte.</p>
            <div id="estadisticas" style="margin-top:1rem;">
                <p class="text-gray-500 italic">Los gráficos y análisis estadísticos se mostrarán en esta sección.</p>
            </div>
        </div>
    </div>

    {{-- Cargar JavaScript específico del dashboard UPC --}}
    @vite(['resources/js/dashboard-upc.js'])

</x-layouts.dashboard>
