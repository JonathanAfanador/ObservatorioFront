<x-layouts.dashboard>

    <!-- Contenedor global donde se mostrarán las notificaciones flotantes (éxito, error, etc.) -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"></div>

    <!-- ==================================== -->
    <!-- 1. PANEL PRINCIPAL / DASHBOARD GENERAL -->
    <!-- ==================================== -->

    <div id="view-dashboard" class="dashboard-view">
        <div class="content-card">
            <h2 class="content-title">Panel de Control</h2>
            <p class="text-gray-600 mb-4">Resumen de las operaciones y recursos de tu empresa de transporte.</p>

            <!-- Área donde se cargan las tarjetas con datos (vehículos, rutas, etc.) vía JavaScript -->
            <div id="empresa-cards" class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                <!-- Cards dinámicas desde dashboard-empresa.js -->
            </div>
        </div>
    </div>

    <!-- ======================= -->
    <!-- 2. GESTIÓN DE CONDUCTORES -->
    <!-- ======================= -->

    <div id="view-conductores" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Conductores</h2>
            <p class="text-gray-600 mb-4">Administra el registro de conductores vinculados a tu empresa.</p>

            <!-- Botón para abrir modal de registro de conductor -->
            <div class="mb-4">
                <button id="btn-add-conductor" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Agregar Conductor
                </button>
            </div>

            <!-- Tabla dinámica donde se cargan los conductores -->
            <div id="conductores-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para registrar o actualizar información de un conductor -->
        <div id="modal-conductor" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Agregar Conductor</h3>
                <form id="form-conductor">
                    <div class="form-grid">

                        <!-- Lista de tipos de identificación cargada desde API -->
                        <div class="form-group">
                            <label>Tipo de Identificación</label>
                            <select id="conductor-tipo-ident" required></select>
                        </div>

                        <!-- Campo para número de identificación con validación dinámica -->
                        <div class="form-group">
                            <label>Número de Identificación</label>
                            <input type="text" id="conductor-nui" required>
                            <small id="nui-validation-message" style="display:none; color:#666; margin-top:0.5rem; font-size:0.85rem;"></small>
                        </div>

                        <!-- Nombres del conductor -->
                        <div class="form-group">
                            <label>Nombres</label>
                            <input type="text" id="conductor-nombres" required>
                        </div>

                        <!-- Apellidos del conductor -->
                        <div class="form-group">
                            <label>Apellidos</label>
                            <input type="text" id="conductor-apellidos" required>
                        </div>

                        <!-- Teléfono con mensaje de validación opcional -->
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" id="conductor-telefono">
                            <small id="telefono-validation-message" style="display:none; color:#666; margin-top:0.5rem; font-size:0.85rem;"></small>
                        </div>

                        <!-- Selección de género -->
                        <div class="form-group">
                            <label>Género</label>
                            <select id="conductor-genero" required>
                                <option value="">Seleccione</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                            </select>
                        </div>
                    </div>

                    <!-- Botones de acción del modal -->
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-conductor" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ======================= -->
    <!-- 3. GESTIÓN DE LICENCIAS -->
    <!-- ======================= -->

    <div id="view-licencias" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Licencias</h2>
            <p class="text-gray-600 mb-4">Asigna y gestiona licencias de conducción vinculadas a tus conductores registrados.</p>

            <!-- Botón que abre modal para crear una nueva licencia -->
            <div class="mb-4">
                <button id="btn-add-licencia" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Asignar Licencia
                </button>
            </div>

            <!-- Tabla dinámica cargada vía API -->
            <div id="licencias-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para asignar una licencia a un conductor -->
        <div id="modal-licencia" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Asignar Licencia a Conductor</h3>
                <form id="form-licencia" enctype="multipart/form-data">
                    <div class="form-grid">

                        <!-- Lista de conductores disponibles -->
                        <div class="form-group">
                            <label>Conductor</label>
                            <select id="licencia-conductor" required></select>
                        </div>

                        <!-- Categoría de licencia (ej. A2, C1, C2...) -->
                        <div class="form-group">
                            <label>Categoría</label>
                            <select id="licencia-categoria" required></select>
                        </div>

                        <!-- Restricción asociada (si aplica) -->
                        <div class="form-group">
                            <label>Restricción</label>
                            <select id="licencia-restriccion" required></select>
                        </div>

                        <!-- Número de licencia única por persona -->
                        <div class="form-group">
                            <label>Número de Licencia</label>
                            <input type="text" id="licencia-numero" required>
                        </div>

                        <!-- Adjuntar archivo de soporte -->
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>Documento de Licencia (PDF, Imagen, etc.)</label>
                            <input type="file" id="licencia-archivo" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                            <small style="display:block; margin-top:0.5rem; color:#666;">
                                Formatos permitidos: PDF, imágenes (JPG, PNG) y documentos (DOC, DOCX)
                            </small>
                        </div>
                    </div>

                    <!-- Botones del modal -->
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-licencia" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ======================== -->
    <!-- 4. GESTIÓN DE VEHÍCULOS -->
    <!-- ======================== -->

    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Vehículos</h2>
            <p class="text-gray-600 mb-4">Administra la flota de vehículos de tu empresa.</p>

            <!-- Botón para abrir modal de vehículo -->
            <div class="mb-4">
                <button id="btn-add-vehiculo" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Agregar Vehículo
                </button>
            </div>

            <div id="vehiculos-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal CRUD de vehículo -->
        <div id="modal-vehiculo" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Agregar Vehículo</h3>
                <form id="form-vehiculo">
                    <div class="form-grid">

                        <!-- Placa con validación y formato en mayúsculas -->
                        <div class="form-group">
                            <label>Placa</label>
                            <input type="text" id="vehiculo-placa" required maxlength="6" style="text-transform: uppercase;">
                            <small id="placa-validation-message" style="display:none; color:#666; margin-top:0.5rem; font-size:0.85rem;"></small>
                        </div>

                        <!-- Tipo de vehículo (bus, buseta, taxi...) -->
                        <div class="form-group">
                            <label>Tipo de Vehículo</label>
                            <select id="vehiculo-tipo" required></select>
                        </div>

                        <!-- Propietario registrado dentro del sistema -->
                        <div class="form-group">
                            <label>Propietario</label>
                            <select id="vehiculo-propietario" required></select>
                        </div>

                        <!-- Año y modelo -->
                        <div class="form-group">
                            <label>Modelo</label>
                            <input type="text" id="vehiculo-modelo" required placeholder="Ej: 2020, Corolla">
                        </div>

                        <!-- Marca -->
                        <div class="form-group">
                            <label>Marca</label>
                            <input type="text" id="vehiculo-marca" required>
                        </div>

                        <!-- Color -->
                        <div class="form-group">
                            <label>Color</label>
                            <input type="text" id="vehiculo-color" required>
                        </div>

                        <!-- Estado en servicio -->
                        <div class="form-group">
                            <label>En Servicio</label>
                            <select id="vehiculo-servicio" required>
                                <option value="1">Sí</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-vehiculo" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- =================== -->
    <!-- 5. GESTIÓN DE RUTAS -->
    <!-- =================== -->

    <div id="view-rutas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Rutas</h2>
            <p class="text-gray-600 mb-4">Administra las rutas autorizadas para tu empresa.</p>

            <!-- Botón para abrir modal de rutas -->
            <div class="mb-4">
                <button id="btn-add-ruta" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Agregar Ruta
                </button>
            </div>

            <!-- Tabla llena desde JS con las rutas existentes -->
            <div id="rutas-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para CRUD de rutas -->
        <div id="modal-ruta" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title" id="ruta-modal-title">Agregar Ruta</h3>
                <form id="form-ruta" enctype="multipart/form-data">
                    <div class="form-grid">

                        <!-- Nombre visible de la ruta -->
                        <div class="form-group full-width">
                            <label>Nombre de Ruta</label>
                            <input type="text" id="ruta-nombre" required maxlength="255" placeholder="Ej: Ruta Centro - Norte">
                        </div>

                        <!-- Archivo geográfico requerido por el backend -->
                        <div class="form-group full-width">
                            <label>Archivo de Ruta (GeoJSON, KML, etc.)</label>
                            <input type="file" id="ruta-file" name="file" accept=".geojson,.json,.kml,.kmz,.zip" required>
                            <small id="ruta-file-help" style="display:block; margin-top:0.5rem; color:#666;">
                                Archivo obligatorio: formatos permitidos GeoJSON, KML, KMZ o ZIP.
                            </small>

                            <!-- Se muestra solo cuando se edita una ruta existente -->
                            <small id="ruta-current-file" style="display:none; margin-top:0.5rem; color:#374151;"></small>
                        </div>

                        <!-- IDs ocultos manejados por JS -->
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

    <!-- ====================================== -->
    <!-- 6. ASIGNACIÓN DE VEHÍCULOS A RUTAS -->
    <!-- ====================================== -->

    <div id="view-asignaciones" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Asignación de Vehículos a Rutas</h2>
            <p class="text-gray-600 mb-4">
                Asigna vehículos a rutas específicas para seguimiento operacional.
            </p>

            <!-- Botón que abre el modal de asignación -->
            <div class="mb-4">
                <button id="btn-add-asignacion" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Nueva Asignación
                </button>
            </div>

            <!-- Tabla generada por dashboard-empresa.js -->
            <div id="asignaciones-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para realizar asignación -->
        <div id="modal-asignacion" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Asignar Vehículo a Ruta</h3>

                <!-- Información contextual del usuario -->
                <div id="asignacion-usuario-info" style="font-size:0.9rem; color:#6b7280; margin-bottom:0.75rem; display:none;"></div>

                <form id="form-asignacion">
                    <div class="form-grid">

                        <!-- Lista de vehículos disponibles -->
                        <div class="form-group">
                            <label>Vehículo</label>
                            <select id="asignacion-vehiculo" required></select>
                        </div>

                        <!-- Lista de rutas existentes -->
                        <div class="form-group">
                            <label>Ruta</label>
                            <select id="asignacion-ruta" required></select>
                        </div>

                        <!-- Kilometraje registrado (opcional) -->
                        <div class="form-group">
                            <label>Kilometraje</label>
                            <input type="number" id="asignacion-kilometraje" placeholder="Ej: 12345 (opcional)">
                            <small style="color:#9ca3af; margin-top:0.35rem; font-size:0.8rem;">
                                Ingresa el kilometraje si está disponible.
                            </small>
                        </div>

                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="asignacion-fecha">
                        </div>

                        <div class="form-group">
                            <label>Hora</label>
                            <input type="time" id="asignacion-hora">
                        </div>

                        <!-- Observaciones opcionales para detalles extra -->
                        <div class="form-group full-width">
                            <label>Observaciones</label>
                            <textarea id="asignacion-observaciones" rows="3" placeholder="Opcional"></textarea>
                            <small style="color:#9ca3af; margin-top:0.35rem; font-size:0.8rem;">
                                Escribe información útil sobre la asignación.
                            </small>
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

    <!-- =================== -->
    <!-- 7. INFORMES GENERALES -->
    <!-- =================== -->

    <div id="view-informes" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Informes y Reportes</h2>
            <p class="text-gray-600 mb-4">Consulta informes consolidados de tus operaciones.</p>

            <!-- Tarjetas de acceso rápido a reportes -->
            <div class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">

                <!-- Informe de Conductores y Licencias -->
                <div class="content-card">
                    <h3 class="font-semibold mb-2">Conductores y Licencias</h3>
                    <p class="text-sm text-gray-600 mb-3">Listado completo con estado de licencias</p>
                    <button id="btn-informe-conductores" class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        Ver Informe
                    </button>
                </div>

                <!-- Informe de Vehículos asignados por Ruta -->
                <div class="content-card">
                    <h3 class="font-semibold mb-2">Vehículos por Ruta</h3>
                    <p class="text-sm text-gray-600 mb-3">Distribución de vehículos en rutas</p>
                    <button id="btn-informe-vehiculos-ruta" class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        Ver Informe
                    </button>
                </div>
            </div>

            <!-- Contenedor donde se muestran los reportes generados -->
            <div id="informe-result" class="mt-6"></div>
        </div>
    </div>

    {{-- Se carga el archivo JavaScript específico que maneja toda la lógica de esta vista de empresa --}}
    @vite(['resources/js/dashboard-empresa.js'])

</x-layouts.dashboard>
