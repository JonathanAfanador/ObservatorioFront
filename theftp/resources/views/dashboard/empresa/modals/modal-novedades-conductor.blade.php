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
