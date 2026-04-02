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
