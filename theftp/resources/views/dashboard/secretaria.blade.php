<x-layouts.dashboard>
    
    <style>
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
        .badge-success { background-color: #dcfce7; color: #166534; }
        .badge-warning { background-color: #fef3c7; color: #92400e; }
        .content-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-box { background: #f8fafc; padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #2563eb; }
        .bg-gradient-to-br.from-blue-500.to-blue-700 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .bg-gradient-to-br.from-purple-500.to-purple-700 { background: linear-gradient(135deg, #a855f7, #7e22ce); }
        .bg-gradient-to-br.from-emerald-500.to-emerald-700 { background: linear-gradient(135deg, #10b981, #047857); }
        .text-white { color: #fff; }
        .rounded-xl { border-radius: 0.75rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .p-6 { padding: 1.5rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .font-bold { font-weight: 700; }
    </style>

    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

    <div id="view-resumen" class="dashboard-view">
        <h2 class="text-2xl font-bold mb-4">Panel de Supervisión - Tránsito</h2>
        
        <div class="stat-grid">
            <div class="stat-box">
                <h3>Empresas Supervisadas</h3>
                <div id="stat-empresas" class="stat-number">0</div>
            </div>
            <div class="stat-box">
                <h3>Rutas Totales</h3>
                <div id="stat-rutas" class="stat-number">0</div>
            </div>
            <div class="stat-box">
                <h3>Resoluciones Emitidas</h3>
                <div id="stat-resoluciones" class="stat-number">0</div>
            </div>
        </div>
    </div>

    <div id="view-resoluciones" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Subir Nueva Resolución</h3>
            <form id="form-resolucion" class="flex flex-col gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Detalle / Número de Resolución</label>
                    <input type="text" id="res-obs" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Ej: Resolución No. 005 - Aprobación tarifas" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Archivo PDF</label>
                    <input type="file" id="res-file" accept="application/pdf" class="mt-1 block w-full" required>
                </div>
                <button type="submit" class="btn-primary self-start">Subir Documento</button>
            </form>
        </div>

        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Historial de Resoluciones</h3>
            <div id="lista-resoluciones">Cargando...</div>
        </div>
    </div>

    <div id="view-rutas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Validación de Rutas</h3>
            <p class="text-sm text-gray-600 mb-4">Revise las rutas registradas por las empresas. Al hacer clic en "Aprobar", se marcará la ruta como verificada visiblemente para la empresa.</p>
            
            <div id="rutas-validation-table" class="overflow-x-auto">
                Cargando rutas...
            </div>
        </div>
    </div>

    <div id="view-empresas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Reporte de Capacidad por Empresa</h3>
            <div id="empresas-report-table">
                Cargando datos...
            </div>
        </div>
    </div>

    @vite('resources/js/dashboard-secretaria.js')

</x-layouts.dashboard>