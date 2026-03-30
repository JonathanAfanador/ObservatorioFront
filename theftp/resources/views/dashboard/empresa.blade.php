<x-layouts.dashboard>

<style>
    /* REPARACIÓN DEFINITIVA: Sistema de Tarjetas de Licencias */

    /* 1. Contenedor de la tarjeta: Permitir que los tooltips se vean */
    .licencia-card {
        overflow: visible !important;
        position: relative !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    }

    .licencia-card:hover { 
        z-index: 50 !important; 
        transform: translateY(-4px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
    }

    /* 2. Header con Grilla: Los elementos NUNCA se tocarán */
    .licencia-card-header { 
        display: grid !important;
        grid-template-columns: auto 1fr auto !important; /* Avatar | Nombre | Estado */
        align-items: center !important;
        gap: 12px !important;
        padding: 1.25rem !important;
        overflow: visible !important;
    }

    /* 3. Área del Título: Control estricto del espacio */
    .licencia-card-title { 
        min-width: 0 !important; /* Vital para que el truncado funcione en grillas */
    }

    .licencia-card-title h4 { 
        margin: 0 !important;
        padding: 0 !important;
        font-weight: 700 !important;
        color: #1f2937 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        font-size: 1rem !important;
    }

    .licencia-badge {
        font-size: 0.75rem !important;
        color: #6b7280 !important;
    }

    /* 4. Estado: Sin flotación, dentro de su celda de la grilla */
    .licencia-estado { 
        position: static !important;
        flex-shrink: 0 !important;
        padding: 6px 12px !important;
        border-radius: 8px !important;
        color: white !important;
        font-weight: 700 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
    }

    /* 5. TOOLTIP PREMIUM (Optimizado para no cortarse) */
    [data-tooltip] {
        position: relative;
    }

    [data-tooltip]::before {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 0; /* Alineado a la izquierda del elemento para evitar salirse */
        margin-bottom: 8px;
        padding: 6px 10px;
        background: rgba(31, 41, 55, 0.95);
        backdrop-filter: blur(4px);
        color: white;
        font-size: 0.7rem;
        border-radius: 6px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    [data-tooltip]:hover::before {
        opacity: 1;
        visibility: visible;
        transform: translateY(-4px);
    }

    /* Avatar interactivo */
    .licencia-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: #a78bfa;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
    }

    /* --- DASHBOARD PREMIUM: OBSERVATORIO AI HUB --- */
    .enterprise-card {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        border-radius: 16px !important;
        transition: all 0.2s ease !important;
    }

    .enterprise-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        border-color: #cbd5e1 !important;
    }

    .enterprise-title {
        color: #0f172a;
        font-weight: 800;
        letter-spacing: -0.025em;
    }

    .chart-container {
        position: relative;
        height: 260px;
        width: 100%;
    }

    .analysis-insight-item {
        background: #f8fafc;
        border-radius: 8px;
        padding: 1rem;
        border-left: 4px solid #4f46e5;
        margin-bottom: 1rem;
    }

    .card-footer-action {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>

<!-- Chart.js para Analítica Avanzada -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Notification Container -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
    </div>

    <!-- Dashboard Empresas - Gestión completa de operaciones -->

    <!-- 1. Vista Dashboard / Resumen Enterprise (Gestión de Flota) -->
    <div id="view-dashboard" class="dashboard-view">
        <!-- Encabezado de Identidad -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 class="text-3xl font-black tracking-tight text-slate-900" style="margin:0;">
                    <span id="dashboard-company-name">Gestión de Flota</span>
                </h1>
                <p class="text-slate-500 font-medium mt-1">Panel de Control Operativo & Análisis Predictivo</p>
            </div>
            <div id="dashboard-health-score">
                <!-- SVG Gauge -->
            </div>
        </div>

        <!-- Nivel 1: KPIs Rápidos -->
        <div id="empresa-cards" class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
            <!-- Cargado por JS -->
        </div>

        <!-- Nivel 2: Analítica Operativa -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <!-- Gráfico 1: Cumplimiento Legal -->
            <div class="enterprise-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 class="font-bold text-slate-800">Cumplimiento Legal de Flota</h3>
                    <span class="badge badge-info">Estado Actual</span>
                </div>
                <div class="chart-container">
                    <canvas id="chart-compliance"></canvas>
                </div>
                <div id="compliance-legend" style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; font-size: 0.75rem; font-weight: 600; color: #64748b;">
                    <!-- Leyenda dinámica -->
                </div>
            </div>

            <!-- Gráfico 2: Proyección de Vencimientos -->
            <div class="enterprise-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 class="font-bold text-slate-800">Vencimientos Proyectados (6 Meses)</h3>
                    <span class="badge" style="background:#f1f5f9; color:#475569;">Planificación</span>
                </div>
                <div class="chart-container">
                    <canvas id="chart-projection"></canvas>
                </div>
                <p style="font-size: 0.7rem; color: #94a3b8; margin-top: 1rem; text-align: center;">Estimación mensual de trámites y renovaciones.</p>
            </div>
        </div>

        <!-- Nivel 3: Gestión Predictiva -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8" id="dashboard-analytics-container" style="display: none;">
            <!-- Análisis de Datos e Hallazgos -->
            <div class="lg:col-span-2 enterprise-card" style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="width: 8px; height: 8px; background: #1e293b; border-radius: 50%;"></div>
                    <h3 class="enterprise-title" style="font-size: 1.1rem; margin:0;">Análisis Operativo & Hallazgos</h3>
                </div>
                <div id="dashboard-ai-insights">
                    <!-- Insights generados por JS -->
                </div>
            </div>

            <!-- Alertas Críticas -->
            <div class="enterprise-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
                <h3 class="font-bold text-slate-800 mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#1e293b;"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                    Tareas Pendientes
                </h3>
                <div id="dashboard-alerts" style="display: flex; flex-direction: column; gap: 1rem; flex: 1;">
                    <!-- Alertas críticas -->
                </div>
                <!-- Action Footer -->
                <div id="dashboard-alerts-footer" class="card-footer-action" style="display: none;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Acciones Rápidas</span>
                    <button onclick="showView('conductores')" style="font-size: 0.7rem; font-weight: 800; color: #4f46e5; cursor: pointer; border: none; background: none; padding: 0;">VER DETALLES →</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. Gestión de Conductores -->
    <div id="view-conductores" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Conductores</h2>
            <p class="text-gray-600 mb-4">Administra el registro de conductores vinculados a tu empresa.</p>

            <div class="mb-4">
                <button id="btn-add-conductor" class="btn-primary">
                    + Agregar Conductor
                </button>
            </div>

            <div id="conductores-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para crear/editar conductor -->
        <div id="modal-conductor" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Agregar Conductor</h3>
                <form id="form-conductor">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tipo de Identificación</label>
                            <select id="conductor-tipo-ident" required></select>
                        </div>
                        <div class="form-group">
                            <label>Número de Identificación</label>
                            <input type="text" id="conductor-nui" required>
                            <small id="nui-validation-message"
                                style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
                        </div>
                        <div class="form-group">
                            <label>Nombres</label>
                            <input type="text" id="conductor-nombres" required>
                        </div>
                        <div class="form-group">
                            <label>Apellidos</label>
                            <input type="text" id="conductor-apellidos" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" id="conductor-telefono">
                            <small id="telefono-validation-message"
                                style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
                        </div>
                        <div class="form-group">
                            <label>Género</label>
                            <select id="conductor-genero" required>
                                <option value="">Seleccione</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" id="conductor-birth-date" required
                                max="{{ now()->subYears(18)->format('Y-m-d') }}">
                            <small style="color:#6b7280; font-size:0.8rem;">Requerido para validación legal de
                                licencias.</small>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-conductor" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal para gestionar Historial de Novedades (Inactividades / Permisos) -->
        <div id="modal-novedades" class="modal-overlay" style="display:none;">
            <div class="modal-content" style="max-width: 800px;">
                <h3 class="modal-title">Gestión de Novedades y Retiros</h3>

                <!-- Historial -->
                <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 class="font-bold text-gray-700 mb-2">Historial Clínico/Administrativo</h4>
                    <div id="novedades-conductor-table" class="overflow-y-auto" style="max-height: 250px;">
                        <!-- Llenado por JS -->
                    </div>
                </div>

                <!-- Formulario Agregar Nueva -->
                <h4 class="font-bold text-gray-700 mb-2 border-t pt-4">Registrar Nueva Novedad</h4>
                <form id="form-novedad-conductor">
                    <input type="hidden" id="novedad-conductor-id">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tipo de Novedad</label>
                            <select id="novedad-tipo" required>
                                <option value="">Seleccione...</option>
                                <option value="Incapacidad Médica">Incapacidad Médica</option>
                                <option value="Permiso">Permiso</option>
                                <option value="Vacaciones">Vacaciones</option>
                                <option value="Despido / Retiro Definitivo">Despido / Retiro Definitivo</option>
                                <option value="Otra Razón">Otra Razón</option>
                            </select>
                            <input type="text" id="novedad-otra" class="mt-2" placeholder="Especifique..."
                                style="display:none; width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Inicio</label>
                            <input type="date" id="novedad-inicio" required>
                        </div>
                        <div class="form-group">
                            <label>Fecha Estimada de Retorno (Fin)</label>
                            <input type="date" id="novedad-fin">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>Observaciones (Opcional)</label>
                            <textarea id="novedad-obs" rows="2"
                                style="width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;"></textarea>
                        </div>
                    </div>
                    <div class="modal-actions mt-4">
                        <button type="button" id="btn-cancel-novedades" class="btn-secondary">Cerrar</button>
                        <button type="submit" class="btn-primary">Registrar Novedad</button>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <!-- 3. Gestión de Licencias -->
    <div id="view-licencias" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Licencias</h2>
            <p class="text-gray-600 mb-4">Asigna y gestiona licencias de conducción vinculadas a tus conductores
                registrados.</p>

            <div class="mb-4">
                <button id="btn-add-licencia" class="btn-primary">
                    + Asignar Licencia
                </button>
            </div>

            <div id="licencias-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para asignar licencia -->
        <div id="modal-licencia" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title" id="licencia-modal-title">Asignar Licencia a Conductor</h3>
                <form id="form-licencia" enctype="multipart/form-data">
                    <input type="hidden" id="licencia-edit-id">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Conductor</label>
                            <select id="licencia-conductor" required></select>
                        </div>
                        <div class="form-group">
                            <label>Categoría</label>
                            <select id="licencia-categoria" required></select>
                        </div>
                        <div class="form-group">
                            <label>Restricción</label>
                            <select id="licencia-restriccion" required></select>
                        </div>
                        <div class="form-group">
                            <label>Número de Licencia</label>
                            <input type="text" id="licencia-numero" required placeholder="Ej: 12345678">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Expedición</label>
                            <input type="date" id="licencia-fecha-expedicion" required
                                max="{{ now()->format('Y-m-d') }}">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Vencimiento (Autocalculado)</label>
                            <input type="date" id="licencia-fecha-vencimiento" required readonly
                                style="background-color: #f3f4f6; cursor: not-allowed;"
                                title="El sistema calcula esta fecha basándose en la ley C.N.T.T (1 o 3 años para S. Público).">
                        </div>
                        <div class="form-group">
                            <label>Organismo de Tránsito</label>
                            <input type="text" id="licencia-organismo" required list="colombia-cities"
                                placeholder="Busca tu ciudad (Ej: Bogotá)">
                            <datalist id="colombia-cities">
                                <option value="Bogotá"></option>
                                <option value="Medellín"></option>
                                <option value="Cali"></option>
                                <option value="Barranquilla"></option>
                                <option value="Bucaramanga"></option>
                                <option value="Cartagena"></option>
                                <option value="Cúcuta"></option>
                                <option value="Pereira"></option>
                                <option value="Envigado"></option>
                                <option value="Bello"></option>
                                <option value="Floridablanca"></option>
                                <option value="Itagüí"></option>
                                <option value="Manizales"></option>
                                <option value="Neiva"></option>
                                <option value="Pasto"></option>
                                <option value="Popayán"></option>
                                <option value="Santa Marta"></option>
                                <option value="Sincelejo"></option>
                                <option value="Soledad"></option>
                                <option value="Valledupar"></option>
                                <option value="Villavicencio"></option>
                            </datalist>
                        </div>
                        <!-- Eliminados selector de Estado manual e inline de motivo inactividad, esto ahora se delega al Modal Maestro de Historial de Licencias -->
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label id="label-archivo-licencia">Documento de Licencia (PDF, Imagen, etc.)</label>
                            <input type="file" id="licencia-archivo" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                            <small id="help-archivo-licencia"
                                style="display:block; margin-top: 0.5rem; color: #666;">Formatos permitidos: PDF,
                                Imágenes (JPG, PNG). Obligatorio para nuevas licencias.</small>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1; display: none;" id="licencia-timestamps">
                            <span style="color: #6b7280; font-size: 0.85rem; font-weight: 500;"
                                id="licencia-created-at"></span><br>
                            <span style="color: #6b7280; font-size: 0.85rem; font-weight: 500;"
                                id="licencia-updated-at"></span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-licencia" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Historial de Novedades de Licencias -->
    <div id="modal-novedades-licencia" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="max-width: 800px;">
            <h3 class="modal-title">Historial de Novedades de Licencia</h3>

            <!-- Historial -->
            <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 class="font-bold text-gray-700 mb-2">Bitácora de Suspensión/Cancelación</h4>
                <div id="novedades-licencia-table" class="overflow-y-auto" style="max-height: 250px;">
                    <!-- Llenado por JS -->
                </div>
            </div>

            <!-- Formulario Agregar Nueva -->
            <h4 class="font-bold text-gray-700 mb-2 border-t pt-4">Registrar Novedad</h4>
            <form id="form-novedad-licencia">
                <input type="hidden" id="novedad-licencia-id">
                <div class="form-grid">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Motivo de Inactividad (Art. 26 C.N.T.T.)</label>
                        <select id="novedad-licencia-tipo" required>
                            <option value="">Seleccione un motivo legal...</option>
                            <optgroup label="Causales de Suspensión (Temporal)">
                                <option value="Suspensión: Imposibilidad física/mental transitoria" data-duracion="0">
                                    Imposibilidad transitoria, física o mental (indefinido)</option>
                                <option value="Suspensión: Decisión judicial" data-duracion="0">Decisión judicial
                                    (tiempo según sentencia)</option>
                                <option value="Suspensión: Embriaguez Grado 0 (1ra vez)" data-duracion="12">Embriaguez
                                    Grado 0 – 1ra vez (1 año)</option>
                                <option value="Suspensión: Embriaguez Grado 0 (2da vez)" data-duracion="12">Embriaguez
                                    Grado 0 – 2da vez (1 año)</option>
                                <option value="Suspensión: Embriaguez Grado 0 (3ra vez)" data-duracion="36">Embriaguez
                                    Grado 0 – 3ra vez (3 años)</option>
                                <option value="Suspensión: Embriaguez Grado 1 (1ra vez)" data-duracion="36">Embriaguez
                                    Grado 1 – 1ra vez (3 años)</option>
                                <option value="Suspensión: Embriaguez Grado 1 (2da vez)" data-duracion="72">Embriaguez
                                    Grado 1 – 2da vez (6 años)</option>
                                <option value="Suspensión: Embriaguez Grado 2 (1ra vez)" data-duracion="60">Embriaguez
                                    Grado 2 – 1ra vez (5 años)</option>
                                <option value="Suspensión: Embriaguez Grado 2 (2da vez)" data-duracion="120">Embriaguez
                                    Grado 2 – 2da vez (10 años)</option>
                                <option value="Suspensión: Embriaguez Grado 3 (1ra vez)" data-duracion="120">Embriaguez
                                    Grado 3 – 1ra vez (10 años)</option>
                                <option value="Suspensión: Reincidencia general (Art. 124)" data-duracion="6">
                                    Reincidencia general Art. 124 (6 meses)</option>
                                <option value="Suspensión: Reincidencia general doble (Art. 124)" data-duracion="12">
                                    Reincidencia doble Art. 124 (12 meses)</option>
                            </optgroup>
                            <optgroup label="Causales de Cancelación (Definitiva + Inhabilitación)">
                                <option value="Cancelación: Imposibilidad permanente" data-duracion="36">Imposibilidad
                                    permanente (3 años inhab.)</option>
                                <option value="Cancelación: Decisión judicial" data-duracion="36">Decisión judicial (3
                                    años inhab.)</option>
                                <option value="Cancelación: Muerte del titular" data-duracion="0">Muerte del titular
                                    (definitiva)</option>
                                <option value="Cancelación: Reincidencia embriaguez" data-duracion="300">Reincidencia
                                    embriaguez/drogas (25 años inhab.)</option>
                                <option value="Cancelación: Negativa prueba alcoholemia" data-duracion="300">Negativa a
                                    prueba de alcoholemia (25 años inhab.)</option>
                                <option value="Cancelación: Embriaguez Grado 1 (3ra vez)" data-duracion="300">Embriaguez
                                    G1 3ra vez – Cancelación (25 años)</option>
                                <option value="Cancelación: Embriaguez Grado 2 (3ra vez)" data-duracion="300">Embriaguez
                                    G2 3ra vez – Cancelación (25 años)</option>
                                <option value="Cancelación: Embriaguez Grado 3 (2da vez)" data-duracion="300">Embriaguez
                                    G3 2da vez – Cancelación (25 años)</option>
                                <option value="Cancelación: Reincidencia servicio público ilegal" data-duracion="36">
                                    Reincidencia en servicio no autorizado (3 años)</option>
                                <option value="Cancelación: Uso de licencia suspendida" data-duracion="36">Uso de la
                                    licencia estando suspendida (3 años)</option>
                                <option value="Cancelación: Expedición fraudulenta" data-duracion="36">Obtener licencia
                                    por medios fraudulentos (3 años)</option>
                            </optgroup>
                            <optgroup label="Otros">
                                <option value="Otra Razón" data-duracion="0">Otra Razón</option>
                            </optgroup>
                        </select>
                        <input type="text" id="novedad-licencia-otra" class="mt-2" placeholder="Especifique..."
                            style="display:none; width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;">
                        <div id="novedad-licencia-legal-note"
                            style="display:none; margin-top: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.8rem; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
                            ℹ️ <strong>Nota legal:</strong> <span id="novedad-licencia-legal-text"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Fecha Efectiva de Sanción</label>
                        <input type="date" id="novedad-licencia-inicio" required>
                    </div>
                    <div class="form-group">
                        <label>Vencimiento Sanción (Autocalculado)</label>
                        <input type="date" id="novedad-licencia-fin" readonly
                            style="background-color: #f3f4f6; cursor: not-allowed;"
                            title="Calculado automáticamente según la ley C.N.T.T.">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Resolución / Observaciones</label>
                        <textarea id="novedad-licencia-obs" rows="2"
                            style="width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;"></textarea>
                    </div>
                </div>
                <div class="modal-actions mt-4">
                    <button type="button" id="btn-cancel-novedades-licencia" class="btn-secondary">Cerrar</button>
                    <button type="submit" class="btn-primary">Sancionar Licencia</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 4. Gestión de Vehículos -->
    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Vehículos</h2>
            <p class="text-gray-600 mb-4">Administra la flota de vehículos de tu empresa.</p>

            <div class="mb-4">
                <button id="btn-add-vehiculo" class="btn-primary">
                    + Agregar Vehículo
                </button>
            </div>

            <div id="vehiculos-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para crear/editar vehículo -->
        <div id="modal-vehiculo" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Agregar Vehículo</h3>
                <form id="form-vehiculo">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Placa</label>
                            <input type="text" id="vehiculo-placa" required maxlength="6"
                                style="text-transform: uppercase;">
                            <small id="placa-validation-message"
                                style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Vehículo</label>
                            <select id="vehiculo-tipo" required></select>
                        </div>
                        <div class="form-group">
                            <label>Propietario</label>
                            <select id="vehiculo-propietario" required></select>
                        </div>
                        <div class="form-group">
                            <label>Modelo</label>
                            <input type="text" id="vehiculo-modelo" required placeholder="Ej: 2020, Corolla">
                        </div>
                        <div class="form-group">
                            <label>Marca</label>
                            <input type="text" id="vehiculo-marca" required>
                        </div>
                        <div class="form-group">
                            <label>Color</label>
                            <input type="text" id="vehiculo-color" required>
                        </div>
                        <div class="form-group" style="display:none;">
                            <label>En Servicio Legal (Secretaría)</label>
                            <select id="vehiculo-servicio" required disabled>
                                <option value="1">Sí</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado Operativo</label>
                            <select id="vehiculo-estado" required>
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>
                        <div class="form-group vehiculo-motivo-container" style="display:none; grid-column: 1 / -1;">
                            <label>Motivo de Inactividad Operativa</label>
                            <select id="vehiculo-motivo">
                                <option value="">Seleccione un motivo</option>
                                <option value="Mantenimiento Rutinario">Mantenimiento Rutinario</option>
                                <option value="Falla Mecánica Menor">Falla Mecánica Menor</option>
                                <option value="Siniestro / Choque Grave">Siniestro / Choque Grave (Notificará a
                                    Secretaría)</option>
                                <option value="Pérdida Total / Chatarrización">Pérdida Total / Chatarrización
                                    (Notificará a Secretaría)</option>
                                <option value="Otra Razón">Otra Razón</option>
                            </select>
                            <input type="text" id="vehiculo-otra-razon" class="mt-2"
                                placeholder="Especifique la razón detallada..."
                                style="display:none; width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Matrícula</label>
                            <input type="date" id="vehiculo-matricula" required>
                            <small style="color:#6b7280; font-size:0.8rem;">Requerida para cálculo de Tecnomecánica (C2:
                                primera a los 2 años).</small>
                        </div>

                        {{-- Sección SOAT --}}
                        <div
                            style="grid-column: 1 / -1; border-top: 2px solid #e5e7eb; margin-top: 0.5rem; padding-top: 1rem;">
                            <h4 style="font-weight: 700; color: #1f2937; margin-bottom: 0.75rem; font-size: 0.95rem;">
                                SOAT</h4>
                        </div>
                        <div class="form-group">
                            <label>Fecha Expedición SOAT</label>
                            <input type="date" id="vehiculo-soat-expedicion" required>
                        </div>
                        <div class="form-group">
                            <label>Vencimiento SOAT (Autocalculado)</label>
                            <input type="date" id="vehiculo-soat" required readonly
                                style="background-color: #f3f4f6; cursor: not-allowed;"
                                title="Se calcula automáticamente: expedición + 12 meses.">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label id="label-archivo-soat">Documento SOAT (PDF o imagen) *</label>
                            <input type="file" id="vehiculo-soat-archivo" accept=".pdf,.jpg,.jpeg,.png,.webp" required>
                            <small id="vehiculo-soat-current"
                                style="display:none; margin-top:0.5rem; color:#374151;"></small>
                        </div>

                        {{-- Sección Tecnomecánica --}}
                        <div
                            style="grid-column: 1 / -1; border-top: 2px solid #e5e7eb; margin-top: 0.5rem; padding-top: 1rem;">
                            <h4 style="font-weight: 700; color: #1f2937; margin-bottom: 0.75rem; font-size: 0.95rem;">
                                Tecnomecánica</h4>
                        </div>
                        <div id="tecno-gracia-info"
                            style="grid-column: 1 / -1; display:none; padding: 0.75rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; font-size: 0.8rem; color: #0369a1; margin-bottom: 0.5rem;">
                        </div>
                        <div class="form-group">
                            <label>Fecha Expedición Tecnomecánica</label>
                            <input type="date" id="vehiculo-tecno-expedicion" required>
                        </div>
                        <div class="form-group">
                            <label>Vencimiento Tecno (Autocalculado)</label>
                            <input type="date" id="vehiculo-tecno" required readonly
                                style="background-color: #f3f4f6; cursor: not-allowed;"
                                title="C2: primera a los 2 años de matrícula, luego anual.">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label id="label-archivo-tecno">Documento Tecnomecánica (PDF o imagen) *</label>
                            <input type="file" id="vehiculo-tecno-archivo" accept=".pdf,.jpg,.jpeg,.png,.webp" required>
                            <small id="vehiculo-tecno-current"
                                style="display:none; margin-top:0.5rem; color:#374151;"></small>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-vehiculo" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>


        <!-- Modal para gestionar Historial de Novedades de Vehículos (Inactividad Interna) -->
        <div id="modal-novedades-vehiculo" class="modal-overlay" style="display:none;">
            <div class="modal-content" style="max-width: 800px;">
                <h3 class="modal-title">Gestión de Novedades del Vehículo</h3>

                <!-- Historial -->
                <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 class="font-bold text-gray-700 mb-2">Bitácora de Inactividad (Mantenimiento / Daños)</h4>
                    <div id="novedades-vehiculo-table" class="overflow-y-auto" style="max-height: 250px;">
                        <!-- Llenado por JS -->
                    </div>
                </div>

                <!-- Formulario Agregar Nueva -->
                <h4 class="font-bold text-gray-700 mb-2 border-t pt-4">Registrar Nueva Novedad</h4>
                <form id="form-novedad-vehiculo">
                    <input type="hidden" id="novedad-vehiculo-id">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tipo de Novedad</label>
                            <select id="novedad-vehiculo-tipo" required>
                                <option value="">Seleccione...</option>
                                <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                                <option value="Reparación Mecánica">Reparación Mecánica</option>
                                <option value="Siniestro / Choque">Siniestro / Choque</option>
                                <option value="Latonería y Pintura">Latonería y Pintura</option>
                                <option value="Otro">Otro (Especifique en observaciones)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha de Inicio</label>
                            <input type="date" id="novedad-vehiculo-inicio" required>
                        </div>
                        <div class="form-group">
                            <label>Fecha Estimada de Retorno (Fin)</label>
                            <input type="date" id="novedad-vehiculo-fin">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>Observaciones (Obligatorio si es "Otro")</label>
                            <textarea id="novedad-vehiculo-obs" rows="2"
                                style="width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;"
                                placeholder="Detalles de la reparación o mantenimiento..."></textarea>
                        </div>
                    </div>
                    <div class="modal-actions mt-4">
                        <button type="button" id="btn-cancel-novedades-vehiculo" class="btn-secondary">Cerrar</button>
                        <button type="submit" class="btn-primary">Registrar Novedad</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 5. Gestión de Rutas -->
    <div id="view-rutas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Rutas</h2>
            <p class="text-gray-600 mb-4">Administra las rutas autorizadas para tu empresa.</p>

            <div class="mb-4">
                <button id="btn-add-ruta" class="btn-primary">
                    + Agregar Ruta
                </button>
            </div>

            <div id="rutas-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para crear/editar ruta -->
        <div id="modal-ruta" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title" id="ruta-modal-title">Agregar Ruta</h3>
                <form id="form-ruta" enctype="multipart/form-data">
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Nombre de Ruta</label>
                            <input type="text" id="ruta-nombre" required maxlength="255"
                                placeholder="Ej: Ruta Centro - Norte">
                        </div>
                        <div class="form-group full-width">
                            <label>Archivo de Ruta (GeoJSON, KML, etc.)</label>
                            <input type="file" id="ruta-file" name="file" accept=".geojson,.json,.kml,.kmz,.zip"
                                required>
                            <small id="ruta-file-help" style="display:block; margin-top:0.5rem; color:#666;">Formato
                                requerido. El backend exige este archivo.</small>
                            <small id="ruta-current-file"
                                style="display:none; margin-top:0.5rem; color:#374151;"></small>
                        </div>
                        <input type="hidden" id="ruta-empresa-id">
                        <input type="hidden" id="ruta-edit-id">
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-ruta" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary" id="ruta-submit-btn">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 6. Asignación Vehículos a Rutas -->
    <div id="view-asignaciones" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 class="content-title" style="margin:0;">Asignación de Vehículos a Rutas</h2>
                    <p class="text-gray-600">Asigna vehículos a rutas específicas para seguimiento operacional.</p>
                </div>
                <button id="btn-add-asignacion" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:20px; height:20px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Asignación
                </button>
            </div>

            <div
                style="background:#f3f4f6; padding:1.25rem; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:1.25rem; align-items:flex-end;">
                <div style="flex:1; min-width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Vehículo</label>
                    <select id="filter-asig-vehiculo"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                        <option value="">Todos</option>
                    </select>
                </div>
                <div style="flex:1; min-width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Conductor</label>
                    <select id="filter-asig-conductor"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                        <option value="">Todos</option>
                    </select>
                </div>
                <div style="flex:1; min-width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Ruta</label>
                    <select id="filter-asig-ruta"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                        <option value="">Todas</option>
                    </select>
                </div>
                <div style="width:160px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Fecha</label>
                    <input type="date" id="filter-asig-fecha"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button onclick="handleAsignacionesSearch()" class="btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:18px; height:18px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </button>
                    <button onclick="clearAsignacionesSearch()" class="btn-secondary">Limpiar</button>
                </div>
            </div>

            <div id="asignaciones-table" style="margin-top: 1rem; min-height:200px;">
                <div class="loading-state">
                    <p>Cargando asignaciones...</p>
                </div>
            </div>

            <!-- Paginación Asignaciones -->
            <div id="asignaciones-pagination"
                style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid #e5e7eb; display:none;">
                <div style="font-size:0.875rem; color:#6b7280;">
                    Mostrando <span id="asig-pagi-info" style="font-weight:600; color:#111827;">0 - 0 de 0</span>
                    asignaciones
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button id="btn-asig-prev" onclick="changeAsignacionesPage('prev')" class="btn-secondary btn-sm"
                        disabled>Anterior</button>
                    <button id="btn-asig-next" onclick="changeAsignacionesPage('next')" class="btn-secondary btn-sm"
                        disabled>Siguiente</button>
                </div>
            </div>
        </div>

        <!-- Modal para asignación -->
        <div id="modal-asignacion" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title" id="modal-asignacion-title">Asignar Vehículo a Ruta</h3>
                <div id="asignacion-usuario-info"
                    style="font-size:0.9rem; color:#6b7280; margin-bottom:0.75rem; display:none;"></div>
                <form id="form-asignacion">
                    <input type="hidden" id="asignacion-id">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Vehículo</label>
                            <select id="asignacion-vehiculo" required></select>
                        </div>
                        <div class="form-group">
                            <label>Conductor</label>
                            <select id="asignacion-conductor" required></select>
                            <div id="asignacion-licencia-warn"
                                style="display:none; margin-top:0.5rem; font-size:0.8rem; font-weight:500;"></div>
                        </div>
                        <div class="form-group">
                            <label>Ruta</label>
                            <select id="asignacion-ruta" required></select>
                        </div>
                        <div class="form-group">
                            <label>Kilometraje</label>
                            <input type="number" id="asignacion-kilometraje" placeholder="Ej: 12345 (opcional)">
                            <small style="color:#9ca3af; margin-top:0.35rem; font-size:0.8rem;">Introduce el kilometraje
                                actual del vehículo si lo conoces.</small>
                        </div>
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="asignacion-fecha">
                        </div>
                        <div class="form-group">
                            <label>Hora Inicio</label>
                            <input type="time" id="asignacion-hora" required>
                        </div>
                        <div class="form-group">
                            <label>Hora Fin</label>
                            <input type="time" id="asignacion-hora-fin" required>
                        </div>
                        <div class="form-group full-width">
                            <label>Observaciones</label>
                            <textarea id="asignacion-observaciones" rows="3" placeholder="Opcional"></textarea>
                            <small style="color:#9ca3af; margin-top:0.35rem; font-size:0.8rem;">Anota detalles útiles
                                (ej: estado del vehículo, incidencias, conductor asignado).</small>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-asignacion" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

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

    <div id="view-resoluciones" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Resoluciones y Comunicados</h2>
            <p class="text-gray-600 mb-4">Documentos oficiales emitidos por la Secretaría para tu empresa.</p>

            <!-- Barra de Filtros -->
            <div
                style="background:#f9fafb; padding:1.25rem; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:1rem; align-items:flex-end;">
                <div style="flex:1; min-width:200px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.5rem;">Búsqueda
                        (Asunto / Detalle)</label>
                    <input type="text" id="resolucion-search-text" placeholder="Ej: Resolución, Permiso..."
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                </div>
                <div style="width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.5rem;">Fecha</label>
                    <input type="date" id="resolucion-search-date"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button onclick="handleResolucionesSearch()" class="btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:18px; height:18px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </button>
                    <button onclick="clearResolucionesSearch()" class="btn-secondary">Limpiar</button>
                </div>
            </div>

            <div id="resoluciones-table" class="overflow-x-auto" style="min-height:200px;">
                <div class="loading-state">
                    <p>Cargando documentos...</p>
                </div>
            </div>

            <!-- Paginación -->
            <div id="resoluciones-pagination"
                style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid #e5e7eb; display:none;">
                <div style="font-size:0.875rem; color:#6b7280;">
                    Mostrando <span id="resol-pagi-info" style="font-weight:600; color:#111827;">0 - 0 de 0</span>
                    resoluciones
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button id="btn-resol-prev" onclick="changeResolucionesPage('prev')" class="btn-secondary btn-sm"
                        disabled>Anterior</button>
                    <button id="btn-resol-next" onclick="changeResolucionesPage('next')" class="btn-secondary btn-sm"
                        disabled>Siguiente</button>
                </div>
            </div>
        </div>

        <!-- Modal Previsualización de PDF -->
        <div id="modal-preview-pdf" class="modal-overlay" style="display:none; z-index:10001;">
            <div class="modal-content"
                style="max-width:900px; width:95%; height:90vh; display:flex; flex-direction:column; padding:0;">
                <div
                    style="padding:1rem 1.5rem; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#fff; border-radius:12px 12px 0 0;">
                    <h3 class="modal-title" id="preview-pdf-title" style="margin:0;">Previsualización de Documento</h3>
                    <button onclick="closePdfPreview()"
                        style="background:none; border:none; color:#6b7280; cursor:pointer; padding:0.5rem;"
                        title="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:24px; height:24px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div id="preview-pdf-container"
                    style="flex:1; background:#525659; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
                    <!-- Spinner de Carga -->
                    <div id="pdf-loading-spinner" style="text-align:center; color:white;">
                        <svg class="animate-spin" style="width:40px; height:40px; margin:0 auto 1rem; opacity:0.8;"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                                style="opacity:0.25;"></circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                style="opacity:0.75;"></path>
                        </svg>
                        <p style="font-size:1.1rem; font-weight:500;">Preparando documento...</p>
                        <p style="font-size:0.85rem; opacity:0.7;">Esto puede tardar unos segundos</p>
                    </div>
                </div>
                <div
                    style="padding:1rem; border-top:1px solid #e5e7eb; text-align:right; background:#f9fafb; border-radius:0 0 12px 12px;">
                    <button onclick="closePdfPreview()" class="btn-secondary">Cerrar Visor</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 8. Gestión de Restricciones -->
    <div id="view-restricciones" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Tipos de Restricción de Licencia</h2>
            <p class="text-gray-600 mb-4">Gestiona los tipos de restricciones que pueden aplicarse a las licencias de
                conducción.</p>

            <div class="mb-4">
                <button id="btn-add-restriccion" onclick="openModalRestriccion()" class="btn-primary">
                    + Nueva Restricción
                </button>
            </div>

            <div id="restricciones-table" class="overflow-x-auto"></div>
        </div>

        <!-- Modal para crear/editar restricción -->
        <div id="modal-restriccion" class="modal-overlay" style="display:none;">
            <div class="modal-content" style="max-width: 500px;">
                <h3 class="modal-title" id="restriccion-modal-title">Nueva Restricción</h3>
                <form id="form-restriccion" onsubmit="saveRestriccion(event)">
                    <input type="hidden" id="restriccion-id">
                    <div class="form-grid" style="grid-template-columns: 1fr;">
                        <div class="form-group">
                            <label>Descripción de la Restricción</label>
                            <input type="text" id="restriccion-descripcion" required
                                placeholder="Ej: Uso de lentes, Solo vehículo automático">
                        </div>
                        <div class="form-group flex items-center gap-2">
                            <input type="checkbox" id="restriccion-estado" checked style="width: 20px; height: 20px;">
                            <label for="restriccion-estado" style="margin: 0;">¿Habilitada?</label>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button"
                            onclick="document.getElementById('modal-restriccion').style.display='none'"
                            class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal para Anulación Motivada de Despacho -->
    <div id="modal-anular-asignacion" class="modal-overlay" style="display:none; z-index: 1100;">
        <div class="modal-content" style="max-width:450px;">
            <div class="modal-header"
                style="background:#fee2e2; padding:1.25rem; border-bottom:1px solid #fecaca; border-radius:12px 12px 0 0;">
                <h3 style="color:#b91c1c; margin:0; display:flex; align-items:center; gap:0.6rem; font-size:1.25rem;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:24px; height:24px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Anulación Motivada de Despacho
                </h3>
            </div>
            <div style="padding:1.5rem;">
                <p style="font-size:0.9rem; color:#4b5563; margin-bottom:1.5rem; line-height:1.5;">Por motivos de
                    trazabilidad y reporte ante la Secretaría de Tránsito, es obligatorio indicar la razón por la cual
                    se cancela este servicio.</p>
                <input type="hidden" id="anular-asignacion-id">
                <div class="form-group" style="margin-bottom:0;">
                    <label style="display:block; font-weight:600; margin-bottom:0.6rem; color:#374151;">Motivo de la
                        Anulación <span style="color:#ef4444;">*</span></label>
                    <textarea id="anular-motivo" rows="4"
                        placeholder="Ej: Vehículo varado en vía, Conductor con incapacidad médica, Error en la programación de ruta..."
                        style="width:100%; padding:0.85rem; border:1px solid #d1d5db; border-radius:10px; font-family:inherit; font-size:0.95rem; resize:none;"></textarea>
                </div>
            </div>
            <div class="modal-actions"
                style="background:#f9fafb; padding:1.25rem; border-top:1px solid #e5e7eb; border-radius:0 0 12px 12px; display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" onclick="document.getElementById('modal-anular-asignacion').style.display='none'"
                    class="btn-secondary">Cancelar</button>
                <button type="button" onclick="confirmAnular()" class="btn-delete">Confirmar
                    Anulación</button>
            </div>
        </div>
    </div>

    {{-- Cargar JavaScript específico del dashboard Empresa --}}
    @vite(['resources/js/dashboard-empresa.js'])

</x-layouts.dashboard>