/**
 * Master Logic: Secretaría de Tránsito - Intelligent Dashboard
 * Built with Chart.js and Data Intelligence API
 */

(function() {
    let charts = {};

    /**
     * Inicialización del Dashboard
     */
    window.initDashboard = async function() {
        console.log("Iniciando Dashboard Inteligente de Secretaría...");
        
        // 1. Asegurar que el menú lateral esté construido
        if (typeof buildSecretariaMenu === 'function') {
            buildSecretariaMenu();
        }

        // 2. Cargar los datos
        await loadDashboardStats();
    };

    /**
     * Función puente para navegar entre vistas de forma segura
     */
    window.navigateToView = function(viewName) {
        console.log(`[Dashboard Master] Navegando a vista: ${viewName}`);
        
        // Estrategias de selección para robustez máxima
        const selectors = [
            `.sidebar-nav .nav-link[data-view="${viewName}"]`,
            `.nav-link[data-view="${viewName}"]`,
            `a[data-view="${viewName}"]`,
            `a[href="#${viewName}"]`
        ];

        let linkFound = false;
        for (const selector of selectors) {
            const link = document.querySelector(selector);
            if (link) {
                link.click();
                linkFound = true;
                break;
            }
        }

        if (!linkFound) {
            console.warn(`[Dashboard Master] No se encontró enlace para "${viewName}". Aplicando cambio forzado.`);
            document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
            const target = document.getElementById(`view-${viewName}`);
            if (target) {
                target.style.display = 'block';
                if (typeof window.loadViewData === 'function') window.loadViewData(viewName);
                
                // Sincronización visual de enlaces activos
                document.querySelectorAll('.nav-link').forEach(l => {
                    if (l.getAttribute('data-view') === viewName) l.classList.add('active');
                    else l.classList.remove('active');
                });
            } else {
                console.error(`[Dashboard Master] Vista crítica [view-${viewName}] no presente.`);
            }
        }
    };

    // Alias para compatibilidad con errores de referencia previos
    window.showView = window.navigateToView;

    /**
     * Carga y actualización de estadísticas desde la API
     */
    window.loadDashboardStats = async function() {
        if (typeof apiGet === 'undefined') {
            console.warn("apiGet no está definido aún. Reintentando en 500ms...");
            setTimeout(loadDashboardStats, 500);
            return;
        }

        console.log("Solicitando estadísticas al servidor...");
        try {
            const response = await apiGet('/secretaria/dashboard-stats');
            console.log("Respuesta recibida:", response);

            // Ajuste de resiliencia: Laravel o apiGet pueden envolver los datos de forma distinta
            const rawData = response.data || response;
            
            if (rawData && (rawData.kpis || rawData.data?.kpis)) {
                const finalData = rawData.kpis ? rawData : rawData.data;
                renderKPIs(finalData.kpis);
                renderCharts(finalData);
                renderAlerts(finalData.alertas);
                console.log("Dashboard actualizado con éxito.");
            } else {
                console.warn("La estructura de datos recibida no es la esperada:", rawData);
            }
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
        }
    };

    /**
     * Renderiza los contadores (KPIs) de nivel 1
     */
    function renderKPIs(kpis) {
        document.getElementById('stat-vehiculos').innerText = kpis.total_vehiculos || 0;
        document.getElementById('stat-empresas').innerText = kpis.total_empresas || 0;
        document.getElementById('stat-licencias').innerText = kpis.total_licencias || 0;
        document.getElementById('stat-alertas').innerText = kpis.total_alertas || 0;

        document.getElementById('stat-vehiculos-label').innerText = `${kpis.total_vehiculos} flota registrada`;
    }

    /**
     * Orquestación de gráficos Chart.js
     */
    function renderCharts(data) {
        if (typeof Chart === 'undefined') {
            console.error("Chart.js no está cargado. Reintentando en 1s...");
            setTimeout(() => renderCharts(data), 1000);
            return;
        }

        // 1. Salud de la Flota (Dona)
        const ctxHealth = document.getElementById('chart-flota-health');
        if (ctxHealth) {
            if (charts.health) charts.health.destroy();
            
            charts.health = new Chart(ctxHealth, {
                type: 'doughnut',
                data: {
                    labels: ['Operativos', 'Inmovilizados', 'Vencidos'],
                    datasets: [{
                        data: [
                            data.flota_health.operativos, 
                            data.flota_health.inmovilizados,
                            data.flota_health.vencidos
                        ],
                        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                        borderWidth: 0,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false } 
                    },
                    cutout: '75%'
                }
            });

            // Leyenda personalizada
            document.getElementById('flota-health-legend').innerHTML = `
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Operativos</span>
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Inmovilizados</span>
            `;
        }

        // 2. Top 5 Cumplimiento (Barras Horizontales)
        const ctxTop = document.getElementById('chart-empresas-ranking');
        if (ctxTop) {
            if (charts.top) charts.top.destroy();
            
            charts.top = new Chart(ctxTop, {
                type: 'bar',
                data: {
                    labels: data.top_empresas.map(e => e.nombre.length > 15 ? e.nombre.substring(0, 15) + '...' : e.nombre),
                    datasets: [{
                        label: '% Cumplimiento',
                        data: data.top_empresas.map(e => e.cumplimiento),
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderRadius: 8,
                        barThickness: 15
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { 
                            beginAtZero: true, 
                            max: 100,
                            grid: { display: false },
                            ticks: { font: { size: 10 } }
                        },
                        y: { 
                            grid: { display: false },
                            ticks: { 
                                font: { size: 9, weight: 'bold' },
                                padding: 5
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Renderiza el listado de alertas críticas
     */
    function renderAlerts(alertas) {
        const container = document.getElementById('secretaria-recent-alerts');
        if (!container) return;

        if (alertas.length === 0) {
            container.innerHTML = `<div class="flex items-center justify-center h-full text-slate-400 text-[10px] italic">No hay alertas críticas hoy.</div>`;
            return;
        }

        container.innerHTML = alertas.map(alert => {
            const colorClass = alert.tipo.includes('Vencido') ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50';
            return `
                <div class="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-[9px] font-black uppercase tracking-tighter ${colorClass} py-0.5 px-2 rounded-md">${alert.tipo}</span>
                        <p class="text-[10px] text-slate-400 font-medium">SUPERVISIÓN PREVENTIVA</p>
                    </div>
                    <h5 class="text-[10px] font-extrabold text-slate-800 mb-0.5">${alert.placa} - <span class="font-bold text-slate-400">${alert.empresa}</span></h5>
                    <p class="text-[9px] text-slate-500 leading-tight mb-2">${alert.mensaje}</p>
                    <button onclick="navigateToView('vehiculos')" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group transition-colors">
                        VER FLOTA 
                        <span class="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            `;
        }).join('');
    }

    /**
     * Integración con el sistema de navegación por pestañas de la Secretaría
     */
    document.addEventListener('DOMContentLoaded', () => {
        // Un inicio más robusto: si el contenedor principal existe, encendemos el motor
        if (document.getElementById('view-resumen')) {
            setTimeout(() => {
                initDashboard();
            }, 500); // Un pequeño delay para asegurar estabilidad
        }
    });

})();