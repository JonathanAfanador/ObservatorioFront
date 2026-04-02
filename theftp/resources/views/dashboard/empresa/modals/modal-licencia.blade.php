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
    
