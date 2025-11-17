<x-layouts.dashboard>

    <!-- 1. Vista para Subir Resolución (Visible por defecto) -->
    <div id="view-subir_resolucion" class="dashboard-view">
        <div class="content-card">
            <h2 class="content-title">Subir Nueva Resolución</h2>
            <p>Aquí irá el formulario para `POST /api/documentos`...</p>
            <!-- El formulario de React que te mostré antes iría aquí -->
        </div>
    </div>

    <!-- 2. Vista para Listar Resoluciones (Oculta) -->
    <div id="view-listar_resoluciones" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h2 class="content-title">Listado de Resoluciones</h2>
            <p>Aquí irá la tabla de `GET /api/documentos` filtrado por tipo "Resolución".</p>
        </div>
    </div>

    <!-- 3. Vista para Listar Empresas (Oculta) -->
    <div id="view-listar_empresas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h2 class="content-title">Listado de Empresas</h2>
            <p>Aquí irá la tabla de `GET /api/empresas`.</p>
        </div>
    </div>

    <!-- 4. Vista para Listar Rutas (Oculta) -->
    <div id="view-listar_rutas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h2 class="content-title">Listado de Rutas</h2>
            <p>Aquí irá la tabla de `GET /api/rutas`.</p>
        </div>
    </div>

    <!-- 5. Vista para Reporte de Rutas (Oculta) -->
    <div id="view-reporte_rutas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h2 class="content-title">Reporte: Rutas por Empresa</h2>
            <p>Aquí irá el selector de empresas para consultar `GET /api/rutas?filter=...` y mostrar el total.</p>
        </div>
    </div>

</x-layouts.dashboard>