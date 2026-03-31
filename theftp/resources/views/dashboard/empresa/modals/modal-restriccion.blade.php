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
    
