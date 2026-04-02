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
    
