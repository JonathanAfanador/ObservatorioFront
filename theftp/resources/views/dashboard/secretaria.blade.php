<x-layouts.dashboard>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

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

        /* --- ESTILOS DE AUDITORÍA (Diseño Minimalista Unificado) --- */
        .audit-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            border: 1px solid rgba(0,0,0,0.03);
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .audit-badge::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .audit-badge.verified { background: #f0fdf4; color: #166534; }
        .audit-badge.verified::before { background: #22c55e; }
        
        .audit-badge.pending { background: #fffbeb; color: #92400e; }
        .audit-badge.pending::before { background: #f59e0b; }
        
        .audit-badge.rejected { background: #fdf2f2; color: #991b1b; }
        .audit-badge.rejected::before { background: #ef4444; }
    </style>

    {{-- Contenedor global donde se inyectan notificaciones flotantes (éxito, error, etc.) --}}
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

    {{-- Vista principal de resumen (Dashboard Inteligente) --}}
    <div id="view-resumen" class="dashboard-view">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight">Supervisión de Tránsito</h2>
                <p class="text-slate-500 font-medium mt-1">Panel de Inteligencia de Datos & Control de Cumplimiento</p>
            </div>
            <div id="dashboard-status-indicator" class="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
                <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                </span>
                <span class="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Sincronizado remotamente</span>
            </div>
        </div>

        {{-- Nivel 1: KPIs Rápidos (Métricas Críticas de la Autoridad) --}}
        <div class="stat-grid">
            <div class="stat-box" style="border-left: 4px solid #4f46e5;">
                <div class="flex justify-between items-center w-full mb-1">
                    <h3>Flota Vehicular</h3>
                    <svg class="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div id="stat-vehiculos" class="stat-number">0</div>
                <p id="stat-vehiculos-label" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Cargando...</p>
            </div>
            <div class="stat-box" style="border-left: 4px solid #10b981;">
                <div class="flex justify-between items-center w-full mb-1">
                    <h3>Empresas Operadoras</h3>
                    <svg class="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div id="stat-empresas" class="stat-number">0</div>
                <p id="stat-empresas-label" class="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Supervisión Activa</p>
            </div>
            <div class="stat-box" style="border-left: 4px solid #6366f1;">
                <div class="flex justify-between items-center w-full mb-1">
                    <h3>Licencias Verificadas</h3>
                    <svg class="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div id="stat-licencias" class="stat-number">0</div>
                <p id="stat-licencias-label" class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Auditoría Permanente</p>
            </div>
            <div class="stat-box" style="border-left: 4px solid #f97316;">
                <div class="flex justify-between items-center w-full mb-1">
                    <h3>Alertas Críticas</h3>
                    <svg class="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div id="stat-alertas" class="stat-number">0</div>
                <p id="stat-alertas-label" class="text-[9px] font-bold text-orange-600 uppercase tracking-widest mt-2">Acción Requerida</p>
            </div>
        </div>

        {{-- Nivel 2: Analítica Operativa & Rankings --}}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {{-- Grafico 1: Estado Legal Flota Global --}}
            <div class="content-card" style="margin-bottom: 0;">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest">Salud de la Flota Global</h3>
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                </div>
                <div style="height: 250px; position: relative;">
                    <canvas id="chart-flota-health"></canvas>
                </div>
                <div id="flota-health-legend" class="flex justify-center gap-4 mt-4 text-[10px] font-bold text-slate-500 uppercase">
                    <!-- Dinámico -->
                </div>
            </div>

            {{-- Grafico 2: Top 5 Cumplimiento Documental --}}
            <div class="content-card" style="margin-bottom: 0;">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest">Top 5 Cumplimiento (Empresas)</h3>
                    <span class="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Rank Mensual</span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-center min-h-[300px]">
                    <canvas id="chart-empresas-ranking"></canvas>
                </div>
                <p class="text-[10px] text-slate-400 mt-4 text-center">Basado en verificaciones legales exitosas.</p>
            </div>

            {{-- Nivel 3: Alertas e Insights de la Autoridad --}}
            <div class="content-card" style="margin-bottom: 0; display: flex; flex-direction: column;">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </div>
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest">Vencimientos Críticos</h3>
                </div>
                
                <div id="secretaria-recent-alerts" class="flex-grow flex flex-col gap-3 overflow-y-auto pr-2" style="max-height: 250px;">
                    <div class="flex items-center justify-center h-full text-slate-400 text-xs italic">Cargando alertas de supervisión...</div>
                </div>

                <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supervisión Preventiva</span>
                    <button onclick="showView('vehiculos')" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">Ver Flota →</button>
                </div>
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
                        Cargue, oficialice y asigne las rutas operativas a las empresas. Todos los cambios impactarán de forma inmediata a los ciudadanos (Landing/App) y Empresas.
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
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 class="text-xl font-semibold">Verificación de licencias</h3>
                    <p class="text-sm text-gray-500 mt-1">Auditoría de conductores y categorías habilitadas (C1/C2).</p>
                </div>
                {{-- Buscador de Licencias --}}
                <div class="relative w-full md:w-72">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" id="search-licencias-audit" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                        placeholder="Buscar por Conductor o Nro..."
                        onkeyup="filterLicenciasAudit(this.value)">
                </div>
            </div>

            <div class="overflow-x-auto shadow-sm rounded-xl border border-slate-100">
                <div id="licencias-audit-table" class="min-w-full">
                    <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                        <svg class="w-12 h-12 mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        <p>Sincronizando licencias de conductores...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Vista para revisión de documentación vehicular (SOAT, Tecnomecánica) --}}
    <div id="view-vehiculos" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 class="text-xl font-semibold">Auditoría de Vehículos</h3>
                    <p class="text-sm text-gray-500 mt-1">Supervisión de vigencia documental y estado legal de la flota.</p>
                </div>
                {{-- Buscador de Vehículos --}}
                <div class="relative w-full md:w-72">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" id="search-vehiculos-review" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                        placeholder="Buscar por Placa o NIT..."
                        onkeyup="filterVehiculosReview(this.value)">
                </div>
            </div>

            <div id="vehiculos-review-table" class="overflow-x-auto text-sm shadow-sm rounded-xl border border-slate-100">
                <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg class="w-12 h-12 mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                    <p>Sincronizando flota vehicular...</p>
                </div>
            </div>
        </div>

        {{-- MODAL: Centro de Auditoría Vehicular (Veredicto Único) --}}
        <div id="modal-auditoria-vehiculo" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
            <div class="modal-content transition-all duration-300" style="background:#fff; border-radius:16px; width:98%; max-width:1450px; height:92vh; max-height:1000px; display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.45); border: 1px solid #e2e8f0;">
                
                <!-- HEADER -->
                <div class="modal-header px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Centro de Auditoría: <span id="placa-audit">---</span></h3>
                    </div>
                    <button type="button" class="text-slate-300 hover:text-slate-600 transition-colors text-2xl leading-none" onclick="document.getElementById('modal-auditoria-vehiculo').style.display='none'">&times;</button>
                </div>

                <!-- TABS -->
                <div class="flex bg-white border-b border-slate-200 px-6 gap-6 flex-shrink-0">
                    <button onclick="switchVehiculoTab('documentos')" id="tab-veh-doc" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-indigo-600 text-indigo-600 transition-all">Documentación (SOAT / TECNO)</button>
                    <button onclick="switchVehiculoTab('historial')" id="tab-veh-hist" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-transparent text-slate-400 hover:text-indigo-600 transition-all">Historial de Novedades</button>
                </div>

                <!-- BODY -->
                <div class="modal-body flex-grow overflow-hidden flex bg-slate-50">
                    <!-- PANEL DOCUMENTOS -->
                    <div id="pane-veh-doc" class="flex-grow flex h-full">
                        <!-- Columna SOAT -->
                        <div class="w-1/2 border-r border-slate-200 flex flex-col">
                            <div class="p-3 bg-white border-b border-slate-100 flex justify-between items-center">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Documento SOAT</span>
                                <div id="soat-actions" class="flex gap-2"></div>
                            </div>
                            <div id="soat-viewer-container" class="flex-grow bg-slate-200">
                                <div class="h-full flex items-center justify-center text-slate-400 text-xs">Cargando visor...</div>
                            </div>
                        </div>
                        <!-- Columna TECNO -->
                        <div class="w-1/2 flex flex-col">
                            <div class="p-3 bg-white border-b border-slate-100 flex justify-between items-center">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tecnomecánica</span>
                                <div id="tecno-actions" class="flex gap-2"></div>
                            </div>
                            <div id="tecno-viewer-container" class="flex-grow bg-slate-200">
                                <div class="h-full flex items-center justify-center text-slate-400 text-xs">Cargando visor...</div>
                            </div>
                        </div>
                    </div>

                    <!-- PANEL HISTORIAL -->
                    <div id="pane-veh-hist" class="flex-grow hidden p-8 overflow-y-auto bg-white">
                        <div class="max-w-4xl mx-auto">
                            <h4 class="font-bold text-slate-800 mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
                                <span class="w-2 h-6 bg-red-400 rounded-full"></span>
                                Historial Operativo e Inmovilizaciones
                            </h4>
                            <div id="vehiculo-novedades-list" class="grid grid-cols-1 gap-4"></div>
                        </div>
                    </div>
                </div>

                <!-- FOOTER: VEREDICTO ÚNICO -->
                <div class="bg-indigo-50 border-t border-indigo-100 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 z-50 shadow-[0_-15px_30px_rgba(79,70,229,0.12)] shrink-0">
                    <form id="form-auditoria-vehiculo" class="w-full flex flex-col md:flex-row items-center gap-4">
                        <input type="hidden" id="vehiculo-id-audit">
                        
                        <div class="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-indigo-100 shrink-0">
                            <label class="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mr-2 border-r pr-3">Decisión Legal</label>
                            <div class="flex items-center gap-5">
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="veh-audit-status" value="aprobado" checked class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" onchange="toggleVehRejection(false)">
                                    <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase">Habilitar Servicio</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="veh-audit-status" value="rechazado" class="w-4 h-4 text-red-600 focus:ring-red-500" onchange="toggleVehRejection(true)">
                                    <span class="text-xs font-bold text-red-600 group-hover:text-red-700 transition-colors uppercase">Inmovilizar</span>
                                </label>
                            </div>
                        </div>

                        <div id="veh-rejection-box" style="display: none;" class="flex-grow animate-in fade-in slide-in-from-bottom-2">
                            <div class="flex gap-2 w-full">
                                <select id="veh-motivo-rechazo" class="text-xs border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white py-2 px-3">
                                    <option value="">Causal de inmovilización...</option>
                                    <option value="SOAT Vencido/Inválido">SOAT Vencido o Inválido</option>
                                    <option value="Tecnomecánica Vencida">Tecnomecánica Vencida</option>
                                    <option value="Documentación Inconsistente">Inconsistencia en Documentos</option>
                                    <option value="Rechazo Administrativo">Rechazo Administrativo</option>
                                </select>
                                <textarea id="veh-detalle-rechazo" rows="1" 
                                    class="flex-grow text-xs border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 placeholder-red-300 bg-white py-2"
                                    placeholder="Detalles adicionales obligatorios..."></textarea>
                            </div>
                        </div>

                        <div class="flex gap-4 w-full md:w-auto shrink-0 border-l pl-6 border-indigo-100 ml-2">
                            <button type="button" onclick="document.getElementById('modal-auditoria-vehiculo').style.display='none'" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                                Cancelar
                            </button>
                            <button type="submit" id="btn-submit-audit-veh"
                                class="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                                <span>Aplicar Dictamen</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    {{-- MODAL: Verificación Detallada de Licencia (Auditoría) --}}
    <div id="modal-verificar-licencia" class="modal" style="display:none; position:fixed; inset:0; background:rgba(15, 23, 42, 0.75); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
        <!-- Estilos para Modo Enfoque (Locales) -->
        <style>
            .audit-modal-focused #licencia-audit-details, 
            .audit-modal-focused .modal-header,
            .audit-modal-focused #audit-verdict-footer { 
                display: none !important; 
            }
            .audit-modal-focused .modal-content { 
                height: 98vh !important; 
                width: 98vw !important; 
                max-width: none !important; 
                max-height: none !important;
            }
            .btn-focus-active {
                background-color: #4f46e5 !important;
                color: white !important;
            }
        </style>

        <div class="modal-content transition-all duration-300" style="background:#fff; border-radius:16px; width:98%; max-width:1450px; height:92vh; max-height:1000px; display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.45); border: 1px solid #e2e8f0;">
            <!-- HEADER: Título y Cierre -->
            <div class="modal-header px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Centro de Auditoría: Documentación de Conductor</h3>
                </div>
                <button type="button" class="text-slate-300 hover:text-slate-600 transition-colors text-2xl leading-none" onclick="closeModalVerificarLicencia()">&times;</button>
            </div>

            <!-- BARRA DE INFORMACIÓN SUPERIOR (HORIZONTAL) -->
            <div id="licencia-audit-details" class="px-6 py-3 bg-slate-50/80 border-b border-gray-100 flex flex-wrap items-center gap-x-8 gap-y-2 flex-shrink-0">
                <!-- Se llena dinámicamente con píldoras de información -->
            </div>

            <!-- CUERPO PRINCIPAL (100% ANCHO PARA EL PDF) -->
            <div class="modal-body p-0 overflow-hidden flex flex-col flex-grow min-h-0 bg-slate-200/50">
                <!-- Pestañas Integradas (Minimizadas) -->
                <div class="flex bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 gap-6 flex-shrink-0">
                    <button onclick="switchLicenciaTab('documento')" id="tab-doc" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-indigo-600 text-indigo-600 transition-all">Documento Soporte (PDF)</button>
                    <button onclick="switchLicenciaTab('historial')" id="tab-hist" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-transparent text-slate-400 hover:text-indigo-600 transition-all">Historial de Novedades</button>
                    
                    <div class="ml-auto flex items-center gap-2">
                        <!-- BOTÓN MODO ENFOQUE -->
                        <button onclick="toggleAuditFocus()" id="btn-focus-mode" class="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-slate-400 font-bold text-[9px] hover:border-indigo-300 hover:text-indigo-600 transition-all">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            MODO ENFOQUE
                        </button>

                        <a id="btn-download-licencia" href="#" target="_blank" class="text-indigo-600 text-[10px] font-bold flex items-center gap-1.5 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3"></path></svg>
                            DESCARGAR PDF
                        </a>
                    </div>
                </div>

                <!-- Visor PDF (Ancho Completo) -->
                <div id="licencia-pane-documento" class="flex-grow flex flex-col h-full relative">
                    <!-- BOTÓN SALIR MODO ENFOQUE (Solo visible en focus) -->
                    <button onclick="toggleAuditFocus()" class="absolute top-4 right-8 z-[60] bg-slate-800/80 text-white p-2 px-4 rounded-full text-[10px] font-bold shadow-2xl backdrop-blur-md hover:bg-slate-900 transition-all hidden group-[.audit-modal-focused]:flex items-center gap-2" id="btn-exit-focus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        SALIR DEL MODO ENFOQUE
                    </button>

                    <div id="licencia-pdf-viewer" class="flex-grow w-full h-full bg-slate-300 shadow-inner">
                        <!-- Iframe se inyecta aquí -->
                    </div>
                </div>

                <!-- Historial (Ancho Completo si se activa) -->
                <div id="licencia-pane-historial" class="flex-grow p-8 overflow-y-auto hidden bg-white">
                    <div class="max-w-4xl mx-auto">
                        <h4 class="font-bold text-slate-800 mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
                             <span class="w-2 h-6 bg-amber-400 rounded-full"></span>
                             Reportes de Inactividad y Novedades (Empresa)
                        </h4>
                        <div id="licencia-novedades-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Lista de novedades -->
                        </div>
                    </div>
                </div>
            </div><!-- End .modal-body -->

            <!-- FOOTER: Dictamen de Auditoría (Compacto y siempre visible) -->
            <div id="audit-verdict-footer" class="bg-indigo-50 border-t border-indigo-100 p-3 px-6 flex flex-col md:flex-row items-center justify-between gap-4 z-50 shadow-[0_-15px_30px_rgba(79,70,229,0.12)] shrink-0">
                <div class="flex flex-col md:flex-row items-center gap-4 flex-grow">
                    <div class="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-indigo-100 shrink-0">
                        <label class="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mr-2 border-r pr-3">Veredicto</label>
                        <div class="flex items-center gap-5">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="audit-status" value="aprobado" checked class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" onchange="toggleAuditRejection(false)">
                                <span class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">APROBAR (VERIFICADO)</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="audit-status" value="rechazado" class="w-4 h-4 text-red-600 focus:ring-red-500" onchange="toggleAuditRejection(true)">
                                <span class="text-xs font-bold text-red-600 group-hover:text-red-700 transition-colors">RECHAZAR / INACTIVAR</span>
                            </label>
                        </div>
                    </div>

                    <div id="audit-rejection-box" style="display: none;" class="flex-grow animate-in fade-in slide-in-from-bottom-2">
                        <textarea id="audit-rejection-reason" rows="1" 
                            class="w-full text-xs border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 placeholder-red-300 bg-white shadow-inner py-2"
                            placeholder="Describa el motivo obligatorio para la inactivación automática..."></textarea>
                    </div>
                </div>

                <div class="flex gap-4 w-full md:w-auto shrink-0 border-l pl-6 border-indigo-100 ml-2">
                    <button type="button" onclick="closeModalVerificarLicencia()" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                        Cancelar
                    </button>
                    <button onclick="submitVerificacionLicencia()" id="btn-submit-verificacion"
                        class="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                        <span>Finalizar Auditoría</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- Vista para supervisión informativa de propietarios en el sistema --}}
    <div id="view-propietarios" class="dashboard-view" style="display: none;">
        <div class="content-card">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 class="text-xl font-semibold text-slate-800">Revisión de Propietarios</h3>
                    <p class="text-sm text-gray-500 mt-1">Consulta oficial de responsables legales y soporte de propiedad vehicular.</p>
                </div>
                
                <div class="relative w-full md:w-80">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input type="text" id="search-propietarios-review" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all" 
                        placeholder="Buscar por Nombre, ID o Empresa..."
                        onkeyup="filterPropietariosReview(this.value)">
                </div>
            </div>

            <div id="propietarios-review-table" class="overflow-x-auto shadow-sm rounded-xl border border-slate-100">
                <div class="flex flex-col items-center justify-center py-12 text-gray-400 italic">
                    <svg class="w-12 h-12 mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <p>Sincronizando base de datos de propietarios...</p>
                </div>
            </div>
        </div>
    </div>

    {{-- MODAL VISUALIZADOR UNIVERSAL DE DOCUMENTOS --}}
    <div id="modal-preview-doc" class="modal-overlay fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[100]" style="display: none;">
        <div class="modal-content bg-white shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden relative mx-4 rounded-xl border border-white/20">
            
            <!-- Header del Visualizador -->
            <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight" id="modal-preview-title">Visualizador de Soporte</h3>
                        <p class="text-[10px] text-slate-500 font-medium italic">Documento verificado por la autoridad</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    <!-- Botón Descargar -->
                    <a id="btn-download-preview" href="#" download class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descargar
                    </a>
                    
                    <!-- Botón Cerrar -->
                    <button id="btn-close-preview" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Cuerpo / Contenido del Soporte -->
            <div id="preview-doc-content" class="flex-1 overflow-auto bg-slate-100/50 flex items-center justify-center relative">
                <div class="animate-pulse text-slate-400 flex flex-col items-center gap-2">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span class="text-xs font-bold uppercase tracking-widest">Cargando Documento...</span>
                </div>
            </div>

        </div>
    </div>

    {{-- Carga de todos los módulos de lógica de la Secretaría de Tránsito --}}
    @vite([
        'resources/js/modules/secretaria/secretaria-base.js',
        'resources/js/modules/secretaria/secretaria-nav.js',
        'resources/js/modules/secretaria/secretaria-empresas.js',
        'resources/js/modules/secretaria/secretaria-rutas.js',
        'resources/js/modules/secretaria/secretaria-licencias.js',
        'resources/js/modules/secretaria/secretaria-vehiculos.js',
        'resources/js/modules/secretaria/secretaria-propietarios.js',
        'resources/js/modules/secretaria/secretaria-resoluciones.js',
        'resources/js/dashboard-secretaria.js'
    ])

</x-layouts.dashboard>
