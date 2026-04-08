// ============================================================
// upc-overview.js
// Vista de Resumen: tarjetas de totales (empresas, conductores,
// vehículos, rutas)
// ============================================================

window.loadOverview = async function () {
    const cardsEl = document.getElementById('upc-cards');
    if (!cardsEl) return;

    // Inicializar totales en 0
    let totalEmpresas = 0;
    let totalConductores = 0;
    let totalVehiculos = 0;
    let totalRutas = 0;

    // Ejecutar cada consulta de forma independiente para que un error 500 no rompa todo el panel
    try {
        const res = await apiGet('/api/empresas?limit=1');
        totalEmpresas = res.total || 0;
    } catch (e) { console.error("Error cargando total empresas:", e); }

    try {
        const res = await apiGet('/api/conductores?limit=1');
        totalConductores = res.total || 0;
    } catch (e) { console.error("Error cargando total conductores:", e); }

    try {
        // Quitamos limit=1 que causaba error 500 en algunas configuraciones de backend
        const res = await apiGet('/api/rutas?include=empresas'); 
        totalRutas = res.total || (res.data && res.data.data ? res.data.data.length : 0);
    } catch (e) { console.error("Error cargando total rutas:", e); }

    try {
        const filtroVeh = JSON.stringify({ "column": "servicio", "operator": "=", "value": true });
        const res = await apiGet(`/api/vehiculos?limit=1&filter=${encodeURIComponent(filtroVeh)}`);
        totalVehiculos = res.total || 0;
    } catch (e) { console.error("Error cargando total vehículos:", e); }

    // Renderizar las tarjetas con un estilo minimalista y profesional e IDs técnicos para exportación
    cardsEl.innerHTML = `
        <div class="metric-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; tracking-wider: 0.05em;">Empresas</span>
                <div style="padding: 0.5rem; background: #eff6ff; border-radius: 8px; color: #3b82f6;">
                    <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
            </div>
            <div id="upc-total-empresas" style="font-size: 1.875rem; font-weight: 700; color: #1e293b;">${totalEmpresas}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Total de empresas supervisadas</div>
        </div>

        <div class="metric-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Conductores</span>
                <div style="padding: 0.5rem; background: #fdf2f8; border-radius: 8px; color: #ec4899;">
                    <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            </div>
            <div id="upc-total-conductores" style="font-size: 1.875rem; font-weight: 700; color: #1e293b;">${totalConductores}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Personal registrado en el sistema</div>
        </div>

        <div class="metric-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Flota activa</span>
                <div style="padding: 0.5rem; background: #f0fdf4; border-radius: 8px; color: #22c55e;">
                    <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                </div>
            </div>
            <div id="upc-total-vehiculos" style="font-size: 1.875rem; font-weight: 700; color: #1e293b;">${totalVehiculos}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Vehículos operativos reportados</div>
        </div>

        <div class="metric-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Lineas de Ruta</span>
                <div style="padding: 0.5rem; background: #faf5ff; border-radius: 8px; color: #a855f7;">
                    <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>
            </div>
            <div id="upc-total-rutas" style="font-size: 1.875rem; font-weight: 700; color: #1e293b;">${totalRutas}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">Rutas con autorización vigente</div>
        </div>
    `;

    // Cargar automáticamente los gráficos asociados al panel estratégico
    if (typeof window.loadEstadisticas === 'function') {
        setTimeout(() => window.loadEstadisticas(), 100);
    }

    // Ejecutar Auditoría Inteligente y Análisis de Riesgo
    if (typeof window.runAuditoriaInteligente === 'function') {
        window.runAuditoriaInteligente();
    }
};
