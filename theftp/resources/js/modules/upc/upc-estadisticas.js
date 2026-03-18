// ============================================================
// upc-estadisticas.js
// Gráficos Chart.js: vehículos por tipo, conductores por género,
// empresas por tipo, vehículos por modelo y rutas por empresa.
// ============================================================

window.loadEstadisticas = function () {

    // --- Gráfico 1: Vehículos por Tipo (Barras Verticales) ---
    try {
        const ctx = document.getElementById('graficoVehiculosPorTipo').getContext('2d');
        const conteoPorTipo = dashboardDataStore.vehiculos.reduce((acc, v) => {
            const tipo = (v.tipo_vehiculo && v.tipo_vehiculo.descripcion) ? v.tipo_vehiculo.descripcion : 'Sin Tipo';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorTipo);
        const data = Object.values(conteoPorTipo);

        if (graficosActivos.vehiculos) graficosActivos.vehiculos.destroy();
        graficosActivos.vehiculos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Nº de Vehículos', data, backgroundColor: '#3B82F6', borderColor: '#1D4ED8', borderWidth: 1 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    } catch (e) { console.error('Error al renderizar gráfico de vehículos:', e); }

    // --- Gráfico 2: Conductores por Género (Barras Horizontales) ---
    try {
        const ctx = document.getElementById('graficoConductoresPorGenero').getContext('2d');
        const conteoPorGenero = dashboardDataStore.conductores.reduce((acc, c) => {
            const genero = (c.persona && c.persona.gender) ? c.persona.gender : 'No especificado';
            acc[genero] = (acc[genero] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorGenero);
        const data = Object.values(conteoPorGenero);

        if (graficosActivos.conductores) graficosActivos.conductores.destroy();
        graficosActivos.conductores = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Nº de Conductores', data, backgroundColor: ['#EC4899', '#3B82F6', '#8B5CF6', '#6B7280'] }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    } catch (e) { console.error('Error al renderizar gráfico de conductores:', e); }

    // --- Gráfico 3: Empresas por Tipo (Barras Horizontales) ---
    try {
        const ctx = document.getElementById('graficoEmpresasPorTipo').getContext('2d');
        const conteoPorTipo = dashboardDataStore.empresas.reduce((acc, e) => {
            const tipo = (e.tipo_empresa && e.tipo_empresa.descripcion) ? e.tipo_empresa.descripcion : 'Sin Tipo';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorTipo);
        const data = Object.values(conteoPorTipo);

        if (graficosActivos.empresas) graficosActivos.empresas.destroy();
        graficosActivos.empresas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Nº de Empresas', data, backgroundColor: '#10B981', borderColor: '#059669', borderWidth: 1 }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    } catch (e) { console.error('Error al renderizar gráfico de empresas:', e); }

    // --- Gráfico 4: Flota por Año/Modelo (Línea) ---
    try {
        const ctx = document.getElementById('graficoVehiculosPorModelo').getContext('2d');
        const conteoPorModelo = dashboardDataStore.vehiculos.reduce((acc, v) => {
            const modelo = v.modelo || 'Sin Año';
            acc[modelo] = (acc[modelo] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(conteoPorModelo).sort((a, b) => a - b);
        const data = labels.map(label => conteoPorModelo[label]);

        if (graficosActivos.modelos) graficosActivos.modelos.destroy();
        graficosActivos.modelos = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Cantidad de Vehículos', data,
                    fill: true, backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6', tension: 0.1
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, suggestedMax: 10 } }
            }
        });
    } catch (e) { console.error('Error al renderizar gráfico de modelos:', e); }

    // --- Gráfico 5: Rutas por Empresa (Barras Horizontales) ---
    try {
        const ctx = document.getElementById('graficoRutasPorEmpresa').getContext('2d');
        const conteoPorEmpresa = dashboardDataStore.rutas.reduce((acc, r) => {
            const empresa = (r.empresa && r.empresa.name) ? r.empresa.name : 'Sin Empresa';
            acc[empresa] = (acc[empresa] || 0) + 1;
            return acc;
        }, {});
        const sorted = Object.entries(conteoPorEmpresa).sort(([, a], [, b]) => b - a).slice(0, 10);
        const labels = sorted.map(([label]) => label);
        const data = sorted.map(([, d]) => d);

        if (graficosActivos.rutas) graficosActivos.rutas.destroy();
        graficosActivos.rutas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Nº de Rutas', data, backgroundColor: '#8B5CF6' }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    } catch (e) { console.error('Error al renderizar gráfico de rutas:', e); }
};
