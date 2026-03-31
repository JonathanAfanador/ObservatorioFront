    <!-- Modal para Anulación Motivada de Despacho -->
    <div id="modal-anular-asignacion" class="modal-overlay" style="display:none; z-index: 1100;">
        <div class="modal-content" style="max-width:450px;">
            <div class="modal-header"
                style="background:#fee2e2; padding:1.25rem; border-bottom:1px solid #fecaca; border-radius:12px 12px 0 0;">
                <h3 style="color:#b91c1c; margin:0; display:flex; align-items:center; gap:0.6rem; font-size:1.25rem;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:24px; height:24px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Anulación Motivada de Despacho
                </h3>
            </div>
            <div style="padding:1.5rem;">
                <p style="font-size:0.9rem; color:#4b5563; margin-bottom:1.5rem; line-height:1.5;">Por motivos de
                    trazabilidad y reporte ante la Secretaría de Tránsito, es obligatorio indicar la razón por la cual
                    se cancela este servicio.</p>
                <input type="hidden" id="anular-asignacion-id">
                <div class="form-group" style="margin-bottom:0;">
                    <label style="display:block; font-weight:600; margin-bottom:0.6rem; color:#374151;">Motivo de la
                        Anulación <span style="color:#ef4444;">*</span></label>
                    <textarea id="anular-motivo" rows="4"
                        placeholder="Ej: Vehículo varado en vía, Conductor con incapacidad médica, Error en la programación de ruta..."
                        style="width:100%; padding:0.85rem; border:1px solid #d1d5db; border-radius:10px; font-family:inherit; font-size:0.95rem; resize:none;"></textarea>
                </div>
            </div>
            <div class="modal-actions"
                style="background:#f9fafb; padding:1.25rem; border-top:1px solid #e5e7eb; border-radius:0 0 12px 12px; display:flex; justify-content:flex-end; gap:0.75rem;">
                <button type="button" onclick="document.getElementById('modal-anular-asignacion').style.display='none'"
                    class="btn-secondary">Cancelar</button>
                <button type="button" onclick="confirmAnular()" class="btn-delete">Confirmar
                    Anulación</button>
            </div>
        </div>
    </div>
