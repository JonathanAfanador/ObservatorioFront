<x-layouts.dashboard>

    {{-- Estilos específicos para este panel de supervisión (badges, tarjetas y estadísticas) --}}
    <style>
        /* Estilo base para pequeñas etiquetas de estado */
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
        /* Etiqueta de estado "correcto" o "vigente" */
        .badge-success { background-color: #dcfce7; color: #166534; }
        /* Etiqueta de estado "pendiente" o de advertencia */
        .badge-warning { background-color: #fef3c7; color: #92400e; }
        /* Tarjeta genérica de contenido con fondo blanco y sombra suave */
        .content-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        /* Contenedor de estadísticas en formato de grid (3 columnas) */
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        /* Caja individual de estadística con fondo gris claro y borde sutil */
        .stat-box { background: #f8fafc; padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
<<<<<<< HEAD
        /* Número grande de la estadística principal */
        .stat-number { font-size: 2rem; font-weight: bold; color: #2563eb; }
        /* Utilidad para fondos degradados: azul */
=======
        .stat-number { font-size: 2rem; font-weight: bold; color: #2563eb; }
>>>>>>> parent of ce9ff7b (Actualizaciones de documentacion en diferentes archivos)
        .bg-gradient-to-br.from-blue-500.to-blue-700 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        /* Utilidad para fondos degradados: morado */
        .bg-gradient-to-br.from-purple-500.to-purple-700 { background: linear-gradient(135deg, #a855f7, #7e22ce); }
        /* Utilidad para fondos degradados: verde esmeralda */
        .bg-gradient-to-br.from-emerald-500.to-emerald-700 { background: linear-gradient(135deg, #10b981, #047857); }
        /* Utilidad para texto blanco sobre fondos oscuros o degradados */
        .text-white { color: #fff; }
        /* Borde redondeado grande para tarjetas y contenedores */
        .rounded-xl { border-radius: 0.75rem; }
        /* Sombra más marcada para dar relieve */
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
<<<<<<< HEAD
        /* Espaciado interno estándar (24px) */
        .p-6 { padding: 1.5rem; }
        /* Tamaño de fuente grande (títulos de estadísticas) */
=======
        .p-6 { padding: 1.5rem; }
>>>>>>> parent of ce9ff7b (Actualizaciones de documentacion en diferentes archivos)
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        /* Utilidad para tipografía en negrita */
        .font-bold { font-weight: 700; }
    </style>

    {{-- Contenedor global donde se inyectan notificaciones flotantes (éxito, error, etc.) --}}
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

    {{-- Vista principal de resumen del panel de supervisión de tránsito --}}
    <div id="view-resumen" class="dashboard-view">
        <h2 class="text-2xl font-bold mb-4">Panel de Supervisión - Tránsito</h2>

        {{-- Tarjetas de estadísticas generales (empresas, rutas, resoluciones) --}}
        <div class="stat-grid">
            <div class="stat-box">
                <h3>Empresas Supervisadas</h3>
                {{-- Número total de empresas supervisadas cargado por JavaScript --}}
                <div id="stat-empresas" class="stat-number">0</div>
            </div>
            <div class="stat-box">
                <h3>Rutas Totales</h3>
                {{-- Total de rutas registradas en el sistema --}}
                <div id="stat-rutas" class="stat-number">0</div>
            </div>
            <div class="stat-box">
                <h3>Resoluciones Emitidas</h3>
                {{-- Cantidad de resoluciones cargadas y visibles para supervisión --}}
                <div id="stat-resoluciones" class="stat-number">0</div>
            </div>
        </div>
    </div>

    {{-- Vista para gestión de resoluciones: subida de PDF y listado histórico --}}
    <div id="view-resoluciones" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Subir Nueva Resolución</h3>
            {{-- Formulario para registrar una nueva resolución con detalle y archivo PDF --}}
            <form id="form-resolucion" class="flex flex-col gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Detalle / Número de Resolución</label>
                    <input type="text" id="res-obs" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Ej: Resolución No. 005 - Aprobación tarifas" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Archivo PDF</label>
                    {{-- Campo para adjuntar el documento oficial de la resolución --}}
                    <input type="file" id="res-file" accept="application/pdf" class="mt-1 block w-full" required>
                </div>
                {{-- Botón para enviar el formulario y subir el documento --}}
                <button type="submit" class="btn-primary self-start">Subir Documento</button>
            </form>
        </div>

        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Historial de Resoluciones</h3>
            {{-- Aquí se renderiza dinámicamente la lista de resoluciones ya registradas --}}
            <div id="lista-resoluciones">Cargando...</div>
        </div>
    </div>

    {{-- Vista de validación de rutas reportadas por las empresas --}}
    <div id="view-rutas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Validación de Rutas</h3>
            <p class="text-sm text-gray-600 mb-4">
                Revise las rutas registradas por las empresas. Al hacer clic en "Aprobar", se marcará la ruta como verificada visiblemente para la empresa.
            </p>

            {{-- Tabla dinámica con el listado de rutas pendientes o validadas --}}
            <div id="rutas-validation-table" class="overflow-x-auto">
                Cargando rutas...
            </div>
        </div>
    </div>

    {{-- Vista para reportes agregados por empresa (capacidad, flota, etc.) --}}
    <div id="view-empresas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Reporte de Capacidad por Empresa</h3>
            {{-- Contenedor donde se pintan los datos resumidos por empresa --}}
            <div id="empresas-report-table">
                Cargando datos...
            </div>
        </div>
    </div>

    {{-- Carga del JavaScript específico para la lógica del dashboard de Secretaría de Tránsito --}}
    @vite('resources/js/dashboard-secretaria.js')

</x-layouts.dashboard>
