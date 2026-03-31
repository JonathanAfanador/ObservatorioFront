        <!-- Modal Previsualización de PDF -->
        <div id="modal-preview-pdf" class="modal-overlay" style="display:none; z-index:10001;">
            <div class="modal-content"
                style="max-width:900px; width:95%; height:90vh; display:flex; flex-direction:column; padding:0;">
                <div
                    style="padding:1rem 1.5rem; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#fff; border-radius:12px 12px 0 0;">
                    <h3 class="modal-title" id="preview-pdf-title" style="margin:0;">Previsualización de Documento</h3>
                    <button onclick="closePdfPreview()"
                        style="background:none; border:none; color:#6b7280; cursor:pointer; padding:0.5rem;"
                        title="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:24px; height:24px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div id="preview-pdf-container"
                    style="flex:1; background:#525659; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
                    <!-- Spinner de Carga -->
                    <div id="pdf-loading-spinner" style="text-align:center; color:white;">
                        <svg class="animate-spin" style="width:40px; height:40px; margin:0 auto 1rem; opacity:0.8;"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                                style="opacity:0.25;"></circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                style="opacity:0.75;"></path>
                        </svg>
                        <p style="font-size:1.1rem; font-weight:500;">Preparando documento...</p>
                        <p style="font-size:0.85rem; opacity:0.7;">Esto puede tardar unos segundos</p>
                    </div>
                </div>
                <div
                    style="padding:1rem; border-top:1px solid #e5e7eb; text-align:right; background:#f9fafb; border-radius:0 0 12px 12px;">
                    <button onclick="closePdfPreview()" class="btn-secondary">Cerrar Visor</button>
                </div>
            </div>
        </div>
    
