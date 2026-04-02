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
    
