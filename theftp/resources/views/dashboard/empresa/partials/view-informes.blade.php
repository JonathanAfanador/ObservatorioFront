    <!-- 7. Informes -->
    <div id="view-informes" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Informes y Reportes</h2>
            <p class="text-gray-600 mb-4">Consulta informes consolidados de tus operaciones.</p>

            <div class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                <!-- Informe Conductores/Licencias -->
                <div class="content-card">
                    <h3 class="font-semibold mb-2">Conductores y Licencias</h3>
                    <p class="text-sm text-gray-600 mb-3">Listado completo con estado de licencias</p>
                    <button id="btn-informe-conductores" class="btn-success">
                        Ver Informe
                    </button>
                </div>

                <!-- Informe Vehículos por Ruta -->
                <div class="content-card">
                    <h3 class="font-semibold mb-2">Vehículos por Ruta</h3>
                    <p class="text-sm text-gray-600 mb-3">Distribución de vehículos en rutas</p>
                    <button id="btn-informe-vehiculos-ruta" class="btn-success">
                        Ver Informe
                    </button>
                </div>
            </div>

            <div id="informe-result" class="mt-6"></div>
        </div>
    </div>

