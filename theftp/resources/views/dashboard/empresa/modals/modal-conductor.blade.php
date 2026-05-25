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
                            <label>Sexo Biológico</label>
                            <select id="conductor-genero" required>
                                <option value="">Seleccione</option>
                                <option value="Hombre">Masculino</option>
                                <option value="Mujer">Femenino</option>
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
