// ==========================
// 1. DASHBOARD / RESUMEN
// ==========================
async function loadDashboard() {
    const conductores = await apiGet('/conductores');
    const licencias = await apiGet('/conductores-licencias');
    const vehiculos = await apiGet('/vehiculos');
    const rutas = await apiGet('/rutas');

    const totalConductores = normalizeList(conductores).length;
    const totalLicencias = normalizeList(licencias).length;
    const totalVehiculos = normalizeList(vehiculos).length;
    const totalRutas = normalizeList(rutas).length;

    document.getElementById('empresa-cards').innerHTML = `
        <div class="metric-card card-conductores">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="card-title">Conductores</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalConductores}</div>
                <div class="metric-label">Registrados</div>
            </div>
            <div class="card-footer">
                <small>Conductores activos en sistema</small>
            </div>
        </div>

        <div class="metric-card card-licencias">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 11h.01"></path>
                    <path d="M8 11h.01"></path>
                </svg>
                <span class="card-title">Licencias</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalLicencias}</div>
                <div class="metric-label">Activas</div>
            </div>
            <div class="card-footer">
                <small>Licencias de conducción vigentes</small>
            </div>
        </div>

        <div class="metric-card card-vehiculos">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="18" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M6 6h12v8H6z"></path>
                    <path d="M6 6L4 9m14-3l2 3"></path>
                </svg>
                <span class="card-title">Vehículos</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalVehiculos}</div>
                <div class="metric-label">En Flota</div>
            </div>
            <div class="card-footer">
                <small>Vehículos activos en operación</small>
            </div>
        </div>

        <div class="metric-card card-rutas">
            <div class="card-header">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <span class="card-title">Rutas</span>
            </div>
            <div class="card-body">
                <div class="metric-value">${totalRutas}</div>
                <div class="metric-label">Autorizadas</div>
            </div>
            <div class="card-footer">
                <small>Rutas activas del sistema</small>
            </div>
        </div>
    `;
}

// Exponer al scope global
window.loadDashboard = loadDashboard;
