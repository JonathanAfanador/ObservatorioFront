<x-layouts.dashboard>

    <!-- Notification Container -->
    <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;"></div>

    <!-- Dashboard Empresas - Gestión completa de operaciones -->

    <!-- 1. Vista Dashboard / Resumen -->
    <div id="view-dashboard" class="dashboard-view">
        <div class="content-card">
            <h2 class="content-title">Panel de Control</h2>
            <p class="text-gray-600 mb-4">Resumen de las operaciones y recursos de tu empresa de transporte.</p>

            <div id="empresa-cards" class="grid gap-4 mt-4" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                <!-- Cards cargadas por JS -->
            </div>
        </div>
    </div>

    <!-- 2. Gestión de Conductores -->
    <div id="view-conductores" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Conductores</h2>
            <p class="text-gray-600 mb-4">Administra el registro de conductores vinculados a tu empresa.</p>

            <div class="mb-4">
                <button id="btn-add-conductor" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
                            <small id="nui-validation-message" style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
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
                            <small id="telefono-validation-message" style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
                        </div>
                        <div class="form-group">
                            <label>Género</label>
                            <select id="conductor-genero" required>
                                <option value="">Seleccione</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-conductor" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 3. Gestión de Licencias -->
    <div id="view-licencias" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Licencias</h2>
            <p class="text-gray-600 mb-4">Asigna y gestiona licencias de conducción vinculadas a tus conductores registrados.</p>

            <div class="mb-4">
                <button id="btn-add-licencia" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Asignar Licencia
                </button>
            </div>

            <div id="licencias-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para asignar licencia -->
        <div id="modal-licencia" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Asignar Licencia a Conductor</h3>
                <form id="form-licencia" enctype="multipart/form-data">
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
                            <input type="text" id="licencia-numero" required>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>Documento de Licencia (PDF, Imagen, etc.)</label>
                            <input type="file" id="licencia-archivo" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                            <small style="display:block; margin-top: 0.5rem; color: #666;">Formatos permitidos: PDF, Imágenes (JPG, PNG), Documentos (DOC, DOCX)</small>
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

    <!-- 4. Gestión de Vehículos -->
    <div id="view-vehiculos" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Vehículos</h2>
            <p class="text-gray-600 mb-4">Administra la flota de vehículos de tu empresa.</p>

            <div class="mb-4">
                <button id="btn-add-vehiculo" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
                            <input type="text" id="vehiculo-placa" required maxlength="6" style="text-transform: uppercase;">
                            <small id="placa-validation-message" style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
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

    <!-- 5. Gestión de Rutas -->
    <div id="view-rutas" class="dashboard-view" style="display:none;">
        <div class="content-card">
            <h2 class="content-title">Gestión de Rutas</h2>
            <p class="text-gray-600 mb-4">Administra las rutas autorizadas para tu empresa.</p>

            <div class="mb-4">
                <button id="btn-add-ruta" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
                            <input type="text" id="ruta-nombre" required maxlength="255" placeholder="Ej: Ruta Centro - Norte">
                        </div>
                        <div class="form-group full-width">
                            <label>Archivo de Ruta (GeoJSON, KML, etc.)</label>
                            <input type="file" id="ruta-file" name="file" accept=".geojson,.json,.kml,.kmz,.zip" required>
                            <small id="ruta-file-help" style="display:block; margin-top:0.5rem; color:#666;">Formato requerido. El backend exige este archivo.</small>
                            <small id="ruta-current-file" style="display:none; margin-top:0.5rem; color:#374151;"></small>
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
            <h2 class="content-title">Asignación de Vehículos a Rutas</h2>
            <p class="text-gray-600 mb-4">Asigna vehículos a rutas específicas para seguimiento operacional.</p>

            <div class="mb-4">
                <button id="btn-add-asignacion" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    + Nueva Asignación
                </button>
            </div>

            <div id="asignaciones-table" style="margin-top: 1rem;"></div>
        </div>

        <!-- Modal para asignación -->
        <div id="modal-asignacion" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Asignar Vehículo a Ruta</h3>
                <!-- Usuario actual mostrado aquí para claridad -->
                <div id="asignacion-usuario-info" style="font-size:0.9rem; color:#6b7280; margin-bottom:0.75rem; display:none;"></div>
                <form id="form-asignacion">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Vehículo</label>
                            <select id="asignacion-vehiculo" required></select>
                        </div>
                        <div class="form-group">
                            <label>Ruta</label>
                            <select id="asignacion-ruta" required></select>
                        </div>
                        <div class="form-group">
                            <label>Kilometraje</label>
                            <input type="number" id="asignacion-kilometraje" placeholder="Ej: 12345 (opcional)">
                            <small style="color:#9ca3af; margin-top:0.35rem; font-size:0.8rem;">Introduce el kilometraje actual del vehículo si lo conoces.</small>
                        </div>
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="asignacion-fecha">
                        </div>
                        <div class="form-group">
                            <label>Hora</label>
                            <input type="time" id="asignacion-hora">
                        </div>
                        <div class="form-group full-width">
                            <label>Observaciones</label>
                            <textarea id="asignacion-observaciones" rows="3" placeholder="Opcional"></textarea>
                            <small style="color:#9ca3af; margin-top:0.35rem; font-size:0.8rem;">Anota detalles útiles (ej: estado del vehículo, incidencias, conductor asignado).</small>
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
                    <button id="btn-informe-conductores" class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        Ver Informe
                    </button>
                </div>

                <!-- Informe Vehículos por Ruta -->
                <div class="content-card">
                    <h3 class="font-semibold mb-2">Vehículos por Ruta</h3>
                    <p class="text-sm text-gray-600 mb-3">Distribución de vehículos en rutas</p>
                    <button id="btn-informe-vehiculos-ruta" class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        Ver Informe
                    </button>
                </div>
            </div>

            <div id="informe-result" class="mt-6"></div>
        </div>
    </div>

    {{-- Cargar JavaScript específico del dashboard Empresa --}}
    @vite(['resources/js/dashboard-empresa.js'])

</x-layouts.dashboard>
