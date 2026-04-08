// ============================================================
// upc-estadisticas.js
// Gráficos Chart.js: análisis estratégico de flota y personal.
// ============================================================

window.loadEstadisticas = function () {
    const defaultFontColor = '#64748b';
    const primaryColor = '#3b82f6';
    const secondaryColor = '#6366f1';
    const accentColor = '#8b5cf6';

    // --- Gráfico 1: Vehículos por Tipo (Barras Verticales) ---
    try {
        const ctx = document.getElementById('graficoVehiculosPorTipo').getContext('2d');
        const conteoPorTipo = dashboardDataStore.vehiculos.reduce((acc, v) => {
            const tipo = (v.tipo && v.tipo.descripcion) ? v.tipo.descripcion : 'Sin clasificar';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorTipo);
        const data = Object.values(conteoPorTipo);

        if (window.graficosActivos && window.graficosActivos.vehiculos) window.graficosActivos.vehiculos.destroy();
        if (!window.graficosActivos) window.graficosActivos = {};

        window.graficosActivos.vehiculos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Vehículos', data, backgroundColor: primaryColor, borderRadius: 6 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, ticks: { color: defaultFontColor, stepSize: 1 }, grid: { display: false } },
                    x: { ticks: { color: defaultFontColor }, grid: { display: false } }
                }
            }
        });
    } catch (e) { console.error('Error en gráfico de vehículos:', e); }

    // --- Gráfico 2: Conductores por Género ---
    try {
        const ctx = document.getElementById('graficoConductoresPorGenero').getContext('2d');
        const conteoPorGenero = dashboardDataStore.conductores.reduce((acc, c) => {
            const genero = (c.persona && c.persona.gender) ? c.persona.gender : 'No definido';
            acc[genero] = (acc[genero] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorGenero);
        const data = Object.values(conteoPorGenero);

        if (window.graficosActivos && window.graficosActivos.conductores) window.graficosActivos.conductores.destroy();
        window.graficosActivos.conductores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Conductores', data, backgroundColor: [secondaryColor, accentColor, '#94a3b8'], borderRadius: 6 }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { beginAtZero: true, ticks: { color: defaultFontColor, stepSize: 1 }, grid: { display: false } },
                    y: { ticks: { color: defaultFontColor }, grid: { display: false } }
                }
            }
        });
    } catch (e) { console.error('Error en gráfico de conductores:', e); }

    // --- Gráfico 3: Empresas por Tipo ---
    try {
        const ctx = document.getElementById('graficoEmpresasPorTipo').getContext('2d');
        const conteoPorTipo = dashboardDataStore.empresas.reduce((acc, e) => {
            const tipo = (e.tipo_empresa && e.tipo_empresa.descripcion) ? e.tipo_empresa.descripcion : 'Otros';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorTipo);
        const data = Object.values(conteoPorTipo);

        if (window.graficosActivos && window.graficosActivos.empresas) window.graficosActivos.empresas.destroy();
        window.graficosActivos.empresas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Empresas', data, backgroundColor: '#0f172a', borderRadius: 4 }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { beginAtZero: true, ticks: { color: defaultFontColor, stepSize: 1 }, grid: { display: false } },
                    y: { ticks: { color: defaultFontColor }, grid: { display: false } }
                }
            }
        });
    } catch (e) { console.error('Error en gráfico de empresas:', e); }

    // --- Gráfico 4: Evolución de Flota por Modelo ---
    try {
        const ctx = document.getElementById('graficoVehiculosPorModelo').getContext('2d');
        const conteoPorModelo = dashboardDataStore.vehiculos.reduce((acc, v) => {
            const modelo = v.modelo || 'S/M';
            acc[modelo] = (acc[modelo] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorModelo).sort((a, b) => a - b);
        const data = labels.map(label => conteoPorModelo[label]);

        if (window.graficosActivos && window.graficosActivos.modelos) window.graficosActivos.modelos.destroy();
        window.graficosActivos.modelos = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Flota', data,
                    fill: true, backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderColor: primaryColor, tension: 0.4, pointRadius: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, ticks: { color: defaultFontColor, stepSize: 1 }, grid: { color: '#f1f5f9' } },
                    x: { ticks: { color: defaultFontColor }, grid: { display: false } }
                }
            }
        });
    } catch (e) { console.error('Error en gráfico de modelos:', e); }
};
