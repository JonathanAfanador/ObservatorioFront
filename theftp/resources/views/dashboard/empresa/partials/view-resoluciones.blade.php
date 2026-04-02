        <div class="content-card">
            <h2 class="content-title">Resoluciones y Comunicados</h2>
            <p class="text-gray-600 mb-4">Documentos oficiales emitidos por la Secretaría para tu empresa.</p>

            <!-- Barra de Filtros -->
            <div
                style="background:#f9fafb; padding:1.25rem; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:1rem; align-items:flex-end;">
                <div style="flex:1; min-width:200px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.5rem;">Búsqueda
                        (Asunto / Detalle)</label>
                    <input type="text" id="resolucion-search-text" placeholder="Ej: Resolución, Permiso..."
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                </div>
                <div style="width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.5rem;">Fecha</label>
                    <input type="date" id="resolucion-search-date"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button onclick="handleResolucionesSearch()" class="btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:18px; height:18px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </button>
                    <button onclick="clearResolucionesSearch()" class="btn-secondary">Limpiar</button>
                </div>
            </div>

            <div id="resoluciones-table" class="overflow-x-auto" style="min-height:200px;">
                <div class="loading-state">
                    <p>Cargando documentos...</p>
                </div>
            </div>

            <!-- Paginación -->
            <div id="resoluciones-pagination"
                style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid #e5e7eb; display:none;">
                <div style="font-size:0.875rem; color:#6b7280;">
                    Mostrando <span id="resol-pagi-info" style="font-weight:600; color:#111827;">0 - 0 de 0</span>
                    resoluciones
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button id="btn-resol-prev" onclick="changeResolucionesPage('prev')" class="btn-secondary btn-sm"
                        disabled>Anterior</button>
                    <button id="btn-resol-next" onclick="changeResolucionesPage('next')" class="btn-secondary btn-sm"
                        disabled>Siguiente</button>
                </div>
            </div>
        </div>

