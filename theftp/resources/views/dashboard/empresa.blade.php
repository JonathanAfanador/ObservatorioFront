<x-layouts.dashboard>


<!-- Chart.js para Analítica Avanzada -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Notification Container -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
    </div>

    <!-- Dashboard Empresas - Gestión completa de operaciones -->
    @include('dashboard.empresa.partials.view-dashboard')

    <div id="view-conductores" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-conductores')
        @include('dashboard.empresa.modals.modal-conductor')
        @include('dashboard.empresa.modals.modal-novedades-conductor')
    </div>

    <div id="view-licencias" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-licencias')
        @include('dashboard.empresa.modals.modal-licencia')
    </div>
    @include('dashboard.empresa.modals.modal-novedades-licencia')

    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-vehiculos')
        @include('dashboard.empresa.modals.modal-vehiculo')
        @include('dashboard.empresa.modals.modal-novedades-vehiculo')
    </div>

    <div id="view-rutas" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-rutas')
        @include('dashboard.empresa.modals.modal-ruta')
    </div>

    <div id="view-asignaciones" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-asignaciones')
        @include('dashboard.empresa.modals.modal-asignacion')
    </div>

    @include('dashboard.empresa.partials.view-informes')

    <div id="view-resoluciones" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-resoluciones')
        @include('dashboard.empresa.modals.modal-resolucion')
    </div>

    <div id="view-restricciones" class="dashboard-view" style="display:none;">
        @include('dashboard.empresa.partials.view-restricciones')
        @include('dashboard.empresa.modals.modal-restriccion')
    </div>

    @include('dashboard.empresa.modals.modal-anular-asignacion')

    {{-- Cargar JavaScript específico del dashboard Empresa --}}
    @vite(['resources/js/dashboard-empresa.js'])

</x-layouts.dashboard>