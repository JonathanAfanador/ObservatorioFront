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
    
