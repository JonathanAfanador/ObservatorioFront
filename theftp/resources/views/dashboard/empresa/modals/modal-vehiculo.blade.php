        <!-- Modal para crear/editar vehículo -->
        <div id="modal-vehiculo" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h3 class="modal-title">Agregar Vehículo</h3>
                <form id="form-vehiculo">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Placa</label>
                            <input type="text" id="vehiculo-placa" required maxlength="6"
                                style="text-transform: uppercase;">
                            <small id="placa-validation-message"
                                style="display:none; color: #666; margin-top: 0.5rem; font-size: 0.85rem;"></small>
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
                        <div class="form-group" style="display:none;">
                            <label>En Servicio Legal (Secretaría)</label>
                            <select id="vehiculo-servicio" required disabled>
                                <option value="1">Sí</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado Operativo</label>
                            <select id="vehiculo-estado" required>
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>
                        <div class="form-group vehiculo-motivo-container" style="display:none; grid-column: 1 / -1;">
                            <label>Motivo de Inactividad Operativa</label>
                            <select id="vehiculo-motivo">
                                <option value="">Seleccione un motivo</option>
                                <option value="Mantenimiento Rutinario">Mantenimiento Rutinario</option>
                                <option value="Falla Mecánica Menor">Falla Mecánica Menor</option>
                                <option value="Siniestro / Choque Grave">Siniestro / Choque Grave (Notificará a
                                    Secretaría)</option>
                                <option value="Pérdida Total / Chatarrización">Pérdida Total / Chatarrización
                                    (Notificará a Secretaría)</option>
                                <option value="Otra Razón">Otra Razón</option>
                            </select>
                            <input type="text" id="vehiculo-otra-razon" class="mt-2"
                                placeholder="Especifique la razón detallada..."
                                style="display:none; width: 100%; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;">
                        </div>
                        <div class="form-group">
                            <label>Fecha de Matrícula</label>
                            <input type="date" id="vehiculo-matricula" required>
                            <small style="color:#6b7280; font-size:0.8rem;">Requerida para cálculo de Tecnomecánica (C2:
                                primera a los 2 años).</small>
                        </div>

                        {{-- Sección SOAT --}}
                        <div
                            style="grid-column: 1 / -1; border-top: 2px solid #e5e7eb; margin-top: 0.5rem; padding-top: 1rem;">
                            <h4 style="font-weight: 700; color: #1f2937; margin-bottom: 0.75rem; font-size: 0.95rem;">
                                SOAT</h4>
                        </div>
                        <div class="form-group">
                            <label>Fecha Expedición SOAT</label>
                            <input type="date" id="vehiculo-soat-expedicion" required>
                        </div>
                        <div class="form-group">
                            <label>Vencimiento SOAT (Autocalculado)</label>
                            <input type="date" id="vehiculo-soat" required readonly
                                style="background-color: #f3f4f6; cursor: not-allowed;"
                                title="Se calcula automáticamente: expedición + 12 meses.">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label id="label-archivo-soat">Documento SOAT (PDF o imagen) *</label>
                            <input type="file" id="vehiculo-soat-archivo" accept=".pdf,.jpg,.jpeg,.png,.webp" required>
                            <small id="vehiculo-soat-current"
                                style="display:none; margin-top:0.5rem; color:#374151;"></small>
                        </div>

                        {{-- Sección Tecnomecánica --}}
                        <div
                            style="grid-column: 1 / -1; border-top: 2px solid #e5e7eb; margin-top: 0.5rem; padding-top: 1rem;">
                            <h4 style="font-weight: 700; color: #1f2937; margin-bottom: 0.75rem; font-size: 0.95rem;">
                                Tecnomecánica</h4>
                        </div>
                        <div id="tecno-gracia-info"
                            style="grid-column: 1 / -1; display:none; padding: 0.75rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; font-size: 0.8rem; color: #0369a1; margin-bottom: 0.5rem;">
                        </div>
                        <div class="form-group">
                            <label>Fecha Expedición Tecnomecánica</label>
                            <input type="date" id="vehiculo-tecno-expedicion" required>
                        </div>
                        <div class="form-group">
                            <label>Vencimiento Tecno (Autocalculado)</label>
                            <input type="date" id="vehiculo-tecno" required readonly
                                style="background-color: #f3f4f6; cursor: not-allowed;"
                                title="C2: primera a los 2 años de matrícula, luego anual.">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label id="label-archivo-tecno">Documento Tecnomecánica (PDF o imagen) *</label>
                            <input type="file" id="vehiculo-tecno-archivo" accept=".pdf,.jpg,.jpeg,.png,.webp" required>
                            <small id="vehiculo-tecno-current"
                                style="display:none; margin-top:0.5rem; color:#374151;"></small>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-vehiculo" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

