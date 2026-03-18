// ============================================================
// secretaria-empresas.js
// Reporte de Empresas: listado con conteo de rutas registradas
// ============================================================

// --- Estadísticas del panel resumen ---
window.loadStats = async function () {
    const filtroRes = encodeURIComponent(JSON.stringify([{
        "column": "observaciones",
        "operator": "like",
        "value": "%Resolución%"
    }]));

    try {
        const [empresas, rutas, resoluciones] = await Promise.all([
            apiCall('/empresas?limit=1'),
            apiCall('/rutas?limit=1'),
            apiCall(`/documentos?filter=${filtroRes}&limit=1`)
        ]);

        if (empresas) document.getElementById('stat-empresas').innerText = empresas.total || 0;
        if (rutas) document.getElementById('stat-rutas').innerText = rutas.total || 0;
        if (resoluciones) document.getElementById('stat-resoluciones').innerText = resoluciones.total || 0;
    } catch (e) {
        console.error('Error stats:', e);
    }
};

// --- Reporte detallado de empresas con conteo de rutas ---
window.loadEmpresas = async function () {
    const container = document.getElementById('empresas-report-table');
    container.innerHTML = '<div class="loading-state"><p>Generando reporte...</p></div>';

    try {
        const [empresasRes, rutasRes] = await Promise.all([
            apiCall('/empresas?limit=100'),
            apiCall('/rutas?limit=100')
        ]);

        const empresas = empresasRes?.data?.data || [];
        const rutas = rutasRes?.data?.data || [];

        let html = `<table class="modern-table"><thead><tr><th>NIT</th><th>Empresa</th><th>Rutas Registradas</th></tr></thead><tbody>`;

        empresas.forEach(e => {
            const count = rutas.filter(r => r.empresa_id === e.id).length;
            html += `
                <tr>
                    <td>${e.nit}</td>
                    <td>${e.name}</td>
                    <td><strong>${count}</strong></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<p style="color:red">Error al cargar datos: ${e.message}</p>`;
    }
};
