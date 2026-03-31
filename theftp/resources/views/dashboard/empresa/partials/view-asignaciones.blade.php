        <div class="content-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 class="content-title" style="margin:0;">Asignación de Vehículos a Rutas</h2>
                    <p class="text-gray-600">Asigna vehículos a rutas específicas para seguimiento operacional.</p>
                </div>
                <button id="btn-add-asignacion" class="btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:20px; height:20px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Asignación
                </button>
            </div>

            <div
                style="background:#f3f4f6; padding:1.25rem; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:1.25rem; align-items:flex-end;">
                <div style="flex:1; min-width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Vehículo</label>
                    <select id="filter-asig-vehiculo"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                        <option value="">Todos</option>
                    </select>
                </div>
                <div style="flex:1; min-width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Conductor</label>
                    <select id="filter-asig-conductor"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                        <option value="">Todos</option>
                    </select>
                </div>
                <div style="flex:1; min-width:180px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Ruta</label>
                    <select id="filter-asig-ruta"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                        <option value="">Todas</option>
                    </select>
                </div>
                <div style="width:160px;">
                    <label
                        style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:0.4rem;">Fecha</label>
                    <input type="date" id="filter-asig-fecha"
                        style="width:100%; padding:0.6rem; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem;">
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button onclick="handleAsignacionesSearch()" class="btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:18px; height:18px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </button>
                    <button onclick="clearAsignacionesSearch()" class="btn-secondary">Limpiar</button>
                </div>
            </div>

            <div id="asignaciones-table" style="margin-top: 1rem; min-height:200px;">
                <div class="loading-state">
                    <p>Cargando asignaciones...</p>
                </div>
            </div>

            <!-- Paginación Asignaciones -->
            <div id="asignaciones-pagination"
                style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid #e5e7eb; display:none;">
                <div style="font-size:0.875rem; color:#6b7280;">
                    Mostrando <span id="asig-pagi-info" style="font-weight:600; color:#111827;">0 - 0 de 0</span>
                    asignaciones
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button id="btn-asig-prev" onclick="changeAsignacionesPage('prev')" class="btn-secondary btn-sm"
                        disabled>Anterior</button>
                    <button id="btn-asig-next" onclick="changeAsignacionesPage('next')" class="btn-secondary btn-sm"
                        disabled>Siguiente</button>
                </div>
            </div>
        </div>

