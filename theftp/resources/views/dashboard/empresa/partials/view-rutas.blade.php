        <div class="content-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; background: linear-gradient(to right, #ffffff, #f8fafc);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h2 class="content-title" style="margin-bottom: 0.25rem;">Geovisor Operativo</h2>
                        <p class="text-gray-600 mb-0">Rutas y paraderos certificados por la Secretaría de Tránsito.</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; background-color: #dcfce7; color: #166534;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; margin-right: 0.5rem; display: inline-block; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
                            Sincronizado
                        </span>
                    </div>
                </div>
            </div>

            <!-- Contenedor dinámico del mapa de Leaflet -->
            <div id="empresa-rutas-map-container" style="min-height: 550px; position: relative; border-bottom: 1px solid #e5e7eb;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; background: #f8fafc;">
                    <p class="text-gray-500 font-medium">Iniciando motor cartográfico...</p>
                </div>
            </div>

            <!-- Módulo Premium Informativo -->
            <div id="empresa-rutas-resumen" style="padding: 2rem; background: #f8fafc;">
                <!-- Skeleton loader / Placeholder mientras JS carga -->
                <p class="text-center text-gray-400">Consultando asignaciones activas...</p>
            </div>
            
            <style>
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                .ruta-asignada-card {
                    background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; flex-direction: column; gap: 0.5rem;
                }
                .ruta-asignada-card:hover {
                    transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
            </style>
        </div>

