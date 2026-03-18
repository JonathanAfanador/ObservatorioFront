// ============================================================
// upc-overview.js
// Vista de Resumen: tarjetas de totales (empresas, conductores,
// vehículos, rutas)
// ============================================================

window.loadOverview = async function () {
    const cardsEl = document.getElementById('upc-cards');

    try {
        const empresas = await apiGet('/api/empresas?limit=1');
        const conductores = await apiGet('/api/conductores?limit=1');
        const rutas = await apiGet('/api/rutas?limit=1');
        const filtroVeh = JSON.stringify({ "column": "servicio", "operator": "=", "value": true });
        const vehiculos = await apiGet(`/api/vehiculos?limit=1&filter=${encodeURIComponent(filtroVeh)}`);

        const totalEmpresas = empresas.total || 0;
        const totalConductores = conductores.total || 0;
        const totalVehiculos = vehiculos.total || 0;
        const totalRutas = rutas.total || 0;

        cardsEl.innerHTML = `
            <div class="metric-card card-empresas">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                    <span class="card-title">Empresas</span>
                </div>
                <div class="card-body">
                    <div class="metric-value">${totalEmpresas}</div>
                    <div class="metric-label">Registradas</div>
                </div>
                <div class="card-footer"><small>Empresas de transporte activas</small></div>
            </div>
            <div class="metric-card card-conductores">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                    <span class="card-title">Conductores</span>
                </div>
                <div class="card-body">
                    <div class="metric-value">${totalConductores}</div>
                    <div class="metric-label">Registrados</div>
                </div>
                <div class="card-footer"><small>Conductores activos en sistema</small></div>
            </div>
            <div class="metric-card card-vehiculos">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <span class="card-title">Vehículos</span>
                </div>
                <div class="card-body">
                    <div class="metric-value">${totalVehiculos}</div>
                    <div class="metric-label">En Servicio</div>
                </div>
                <div class="card-footer"><small>Vehículos activos en operación</small></div>
            </div>
            <div class="metric-card card-rutas">
                <div class="card-header">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                    <span class="card-title">Rutas</span>
                </div>
                <div class="card-body">
                    <div class="metric-value">${totalRutas}</div>
                    <div class="metric-label">Autorizadas</div>
                </div>
                <div class="card-footer"><small>Rutas activas del sistema</small></div>
            </div>
        `;
    } catch (error) {
        cardsEl.innerHTML = `<p class='text-red-600'>Error cargando totales: ${error.message}</p>`;
    }
};
