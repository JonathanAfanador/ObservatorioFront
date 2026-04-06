<x-layouts.dashboard>

    {{-- Estilos específicos Premium Institucional (Gobierno / Autoridad) --}}
    <style>
        /* Estilo base para pequeñas etiquetas de estado */
        .badge { padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase; }
        .badge-success { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .badge-warning { background-color: #fefce8; color: #854d0e; border: 1px solid #fef08a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        
        /* Tarjeta Genérica Corporativa */
        .content-card { 
            background: #ffffff; 
            padding: 2rem; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); 
            border: 1px solid #f1f5f9;
            margin-bottom: 2rem; 
        }
        
        /* Contenedor de estadísticas - Grid moderno */
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        
        /* Caja individual de estadística */
        .stat-box { 
            background: linear-gradient(to bottom right, #ffffff, #f8fafc); 
            padding: 2rem; 
            border-radius: 16px; 
            border: 1px solid #e2e8f0; 
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            display: flex; flex-direction: column; align-items: start; gap: 0.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-box:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .stat-box h3 { font-size: 0.875rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        
        /* Número grande de la estadística principal */
        .stat-number { font-size: 2.5rem; font-weight: 800; color: #1e293b; line-height: 1; }
        
        /* Tabla DataGrid Premium */
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .modern-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; padding: 1rem; border-bottom: 2px solid #e2e8f0; text-align: left; letter-spacing: 0.05em; }
        .modern-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        .modern-table tr:hover td { background-color: #f8fafc; }
        
        /* Títulos */
        .text-2xl { font-size: 1.5rem; color: #0f172a; font-weight: 800; letter-spacing: -0.025em; }
        .text-xl { font-size: 1.25rem; color: #1e293b; font-weight: 700; letter-spacing: -0.015em; }
        
        /* Base de Scrollbars Finos */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Estilos específicos para el Visor de PDF */
        #modal-view-pdf .modal-content {
            width: 95%;
            height: 90vh;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
        }
        #modal-view-pdf iframe {
            flex: 1;
            border: none;
            width: 100%;
            border-radius: 0 0 8px 8px;
        }
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
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-xl font-semibold">Gestión de Resoluciones</h3>
                    <p class="text-sm text-gray-500 mt-1">Historial oficial de actos administrativos y circulares.</p>
                </div>
                {{-- Botón para abrir modal de carga --}}
                <button onclick="document.getElementById('modal-upload-resolucion').style.display='flex'" class="btn-primary flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Nueva Resolución
                </button>
            </div>

            {{-- Aquí se renderiza dinámicamente la lista de resoluciones ya registradas --}}
            <div id="lista-resoluciones">Cargando...</div>
        </div>

        {{-- MODAL: Subir Nueva Resolución --}}
        <div id="modal-upload-resolucion" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div class="modal-content" style="background:#fff; border-radius:12px; width:100%; max-width:550px; display:flex; flex-direction:column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="text-xl font-bold text-slate-800">Nueva Resolución Oficial</h2>
                    <button type="button" onclick="document.getElementById('modal-upload-resolucion').style.display='none'" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <form id="form-resolucion" class="flex flex-col gap-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Detalle / Número de Resolución</label>
                            <input type="text" id="res-obs" class="w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="Ej: Resolución No. 005 - Aprobación tarifas" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Empresa Destino</label>
                            <select id="res-empresa" class="w-full border-gray-300 rounded-md shadow-sm bg-white text-sm py-2">
                                <option value="">-- General (Para todas) --</option>
                            </select>
                            <p class="text-xs text-gray-500 mt-1">Si es para una empresa específica, selecciónela aquí. Si no, quedará disponible para todas.</p>
                        </div>
                        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 1.5rem; text-align: center;">
                            <label class="block text-sm font-bold text-slate-700 mb-2">Archivo PDF Oficial</label>
                            <input type="file" id="res-file" accept="application/pdf" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mx-auto" required>
                            <p class="text-xs text-slate-500 mt-2">Máximo 10MB. Solo formato PDF.</p>
                        </div>
                        <div class="flex justify-end gap-3 mt-4">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('modal-upload-resolucion').style.display='none'">Cancelar</button>
                            <button type="submit" class="btn-primary shadow-md">Subir y Publicar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {{-- MODAL: Visor de PDF Interno --}}
        <div id="modal-view-pdf" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div class="modal-content" style="background:#fff; border-radius:12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="modal-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 id="pdf-viewer-title" class="text-lg font-bold text-slate-800">Vista Previa de Documento</h2>
                    <button type="button" onclick="closePdfViewer()" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Cerrar
                    </button>
                </div>
                <iframe id="pdf-viewer-frame" src="about:blank"></iframe>
            </div>
        </div>
    </div>

    {{-- Vista MAESTRA de Rutas (Dueño del Mapa y Lógica Espacial) --}}
    <div id="view-rutas" class="dashboard-view" style="display: none;">
        <div class="content-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; min-height: 700px;">
            <!-- Header Inteligente -->
            <div style="padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc;">
                <div>
                    <h3 class="font-bold text-slate-800" style="font-size: 1.25rem;">Gestor Maestro Cartográfico</h3>
                    <p class="text-sm text-slate-500 mt-1">
                        Cargue, oficialice y asigne las rutas operativas a las empresas. Todos los cambios impactarán en tiempo real a los ciudadanos (Landing/App) y Empresas.
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <!-- Botón para subir nuevo trazado (abre modal) -->
                    <button onclick="document.getElementById('modal-secretaria-ruta').style.display='flex'" class="btn-primary" style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Cargar / Oficializar KMZ
                    </button>
                </div>
            </div>

            <!-- Cuerpo del Mapa y Panel Lateral -->
            <div style="display: flex; flex: 1;">
                <!-- Panel izquierdo: Listado de Rutas Maestras -->
                <div style="width: 350px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column;">
                    <div style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                        <input type="text" id="secretaria-rutas-search" placeholder="Buscar ruta..." class="w-full border-gray-300 rounded-md shadow-sm text-sm" onkeyup="filterRutasList(this.value)">
                    </div>
                    <div id="secretaria-rutas-list" style="overflow-y: auto; flex: 1; padding: 0.5rem;">
                        <div class="p-4 text-center text-gray-500 text-sm">Cargando rutas maestras...</div>
                    </div>
                </div>

                <!-- Visor GIS (Mapa) -->
                <div style="flex: 1; position: relative;" id="secretaria-rutas-map-container">
                    <div id="secretaria-rutas-map" style="width: 100%; height: 100%; min-height: 500px; z-index: 1;"></div>
                    <div style="position: absolute; bottom: 20px; right: 20px; z-index: 1000; background: white; padding: 0.75rem 1rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-widest">Motor Observatorio GIS</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- MODAL: Crear/Editar Ruta y Subir Archivo --}}
        <div id="modal-secretaria-ruta" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div class="modal-content" style="background:#fff; border-radius:12px; width:100%; max-width:600px; max-height:90vh; display:flex; flex-direction:column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="text-xl font-bold text-slate-800">Oficializar Ruta (KMZ)</h2>
                    <button type="button" onclick="document.getElementById('modal-secretaria-ruta').style.display='none'" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1.5rem; overflow-y: auto;">
                    <form id="form-secretaria-ruta" class="flex flex-col gap-5">
                        <input type="hidden" id="ruta-id">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Nombre Oficial de la Ruta</label>
                            <input type="text" id="ruta-nombre" class="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Ej: Ruta 101 - Centro / Norte" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Asignar a Empresa Operadora</label>
                            <select id="ruta-empresas" class="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2" required>
                                <option value="">Seleccione una empresa...</option>
                                <!-- Llenado dinámico -->
                            </select>
                        </div>
                        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 1.5rem; text-align: center;">
                            <label class="block text-sm font-bold text-slate-700 mb-2">Archivo Satelital (KMZ/KML)</label>
                            <input type="file" id="ruta-file" accept=".kml,.kmz" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mx-auto">
                            <p class="text-xs text-slate-500 mt-3">El sistema extraerá automáticamente el recorrido de la línea y cualquier punto marcado como "Paradero" o "Station".</p>
                        </div>
                        <div class="flex justify-end gap-3 mt-4">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('modal-secretaria-ruta').style.display='none'">Cancelar</button>
                            <button type="submit" class="btn-primary shadow-md">Oficializar y Procesar Red</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        {{-- MODAL: Gestión y Carga Masiva de Paraderos (Bulk) --}}
        <div id="modal-secretaria-paraderos" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div class="modal-content" style="background:#fff; border-radius:12px; width:100%; max-width:600px; max-height:90vh; display:flex; flex-direction:column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>Gestión de Paraderos Oficiales</span>
                    </h2>
                    <button type="button" onclick="document.getElementById('modal-secretaria-paraderos').style.display='none'" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1.5rem; overflow-y: auto;">
                    <div class="mb-4">
                        <p class="text-sm text-slate-600">Ruta Seleccionada: <strong id="paradero-ruta-name" class="text-indigo-700"></strong></p>
                    </div>

                    <form id="form-secretaria-paraderos" class="flex flex-col gap-5">
                        <input type="hidden" id="paradero-ruta-id">
                        
                        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 1.5rem; text-align: center;">
                            <label class="block text-sm font-bold text-slate-700 mb-2">Subir Archivo de Marcadores (KMZ/KML)</label>
                            <input type="file" id="paradero-file" accept=".kml,.kmz" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mx-auto">
                            <p class="text-xs text-slate-500 mt-3">El sistema extraerá cada PUNTO del archivo, lo sincronizará a la red y reemplazará los anteriores. Esta operación guardará las latitudes y longitudes exactas en la BD.</p>
                        </div>
                        
                        <div class="flex justify-end gap-3 mt-2">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('modal-secretaria-paraderos').style.display='none'">Cancelar</button>
                            <button type="submit" class="btn-primary shadow-md">Procesar Nodos GPS</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    {{-- Vista para reportes detallados por empresa (auditoría de flota y rutas) --}}
    <div id="view-empresas" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 class="text-xl font-semibold">Reporte de empresas</h3>
                    <p class="text-sm text-gray-500 mt-1">Supervisión integral de flota vehicular y rutas asignadas.</p>
                </div>
                {{-- Buscador dinámico y Botón de Reporte --}}
                <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div class="relative w-full md:w-72">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input type="text" id="search-empresas-audit" 
                            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                            placeholder="Buscar por NIT o Nombre..."
                            onkeyup="filterEmpresasTable(this.value)">
                    </div>
                    <button onclick="downloadGeneralReport()" 
                        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Descargar Reporte
                    </button>
                </div>
            </div>

            {{-- Contenedor donde se pintan los datos resumidos por empresa --}}
            <div class="overflow-x-auto shadow-sm rounded-xl border border-slate-100">
                <div id="empresas-report-table" class="min-w-full">
                    <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                        <svg class="w-12 h-12 mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p>Generando reporte de auditoría...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Vista para auditoría y verificación de licencias por la Secretaría --}}
    <div id="view-licencias" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Auditoría de Licencias de Conducción</h3>
            <p class="text-sm text-gray-600 mb-6">
                Listado centralizado de licencias registradas por todas las empresas. Verifique la vigencia y autenticidad en RUNT antes de marcar como "Verificada".
            </p>

            <div id="licencias-audit-table" class="overflow-x-auto text-sm">
                Cargando licencias para auditoría...
            </div>
        </div>
    </div>

    {{-- Vista para revisión de documentación vehicular (SOAT, Tecnomecánica) --}}
    <div id="view-vehiculos" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <h3 class="text-xl font-semibold mb-4">Auditoría Clínica de Vehículos</h3>
            <p class="text-sm text-gray-600 mb-6">
                Como Autoridad, puede visualizar la vigencia documental (SOAT y Tecno) exigida a las empresas operadoras. Aquellos vehículos que no cumplan la normativa técnica deberán ser <span class="font-bold text-red-600">Inmovilizados (Vetados)</span> impidiendo su uso operativo.
            </p>

            <div id="vehiculos-review-table" class="overflow-x-auto text-sm">
                Cargando vehículos para revisión...
            </div>
        </div>

        {{-- MODAL: Inmovilizar y Rechazar Vehículo --}}
        <div id="modal-rechazo-vehiculo" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div class="modal-content" style="background:#fff; border-radius:12px; width:100%; max-width:500px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <h2 class="text-xl font-bold text-red-700 flex items-center gap-2 mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Inmovilizar Vehículo Oficialmente
                </h2>
                <div class="bg-red-50 text-red-800 text-sm p-3 rounded-md mb-4 border border-red-200">
                    Está a punto de revocar el permiso de operación del vehículo <strong id="placa-rechazo"></strong>. La empresa no podrá despachar este bus hasta que subsane la irregularidad.
                </div>
                
                <form id="form-rechazo-vehiculo" class="flex flex-col gap-4">
                    <input type="hidden" id="vehiculo-id-rechazo">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Motivo Legal / Técnico de la Suspensión</label>
                        <select id="motivo-rechazo" class="w-full border-slate-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm py-2 mb-3" required>
                            <option value="">Seleccione el causal dictaminado...</option>
                            <option value="SOAT Inválido o Vencido">SOAT Inválido, Vencido o No Coincidente</option>
                            <option value="Tecnomecánica Vencida">Revisión Técnico Mecánica Vencida</option>
                            <option value="Documentación Falsa">Presunción de Documentación Falsa / Adulterada</option>
                            <option value="Rechazo Administrativo Directo">Rechazo Administrativo Directo por Infracción</option>
                            <option value="Otro motivo de inmovilización">Otro motivo normativo...</option>
                        </select>
                        <textarea id="detalle-rechazo" rows="3" class="w-full border-slate-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm" placeholder="Añade un comentario (visible para la empresa) o la resolución asociada..."></textarea>
                    </div>
                    <div class="flex justify-end gap-3 mt-2">
                        <button type="button" class="btn-secondary" onclick="document.getElementById('modal-rechazo-vehiculo').style.display='none'">Abortar</button>
                        <button type="submit" class="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                            Proceder con Inmovilización
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    {{-- Carga del JavaScript específico para la lógica del dashboard de Secretaría de Tránsito --}}
    @vite('resources/js/dashboard-secretaria.js')

</x-layouts.dashboard>
