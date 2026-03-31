    <!-- 1. Vista Dashboard / Resumen Enterprise (Gestión de Flota) -->
    <div id="view-dashboard" class="dashboard-view">
        <!-- Encabezado de Identidad -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 class="text-3xl font-black tracking-tight text-slate-900" style="margin:0;">
                    <span id="dashboard-company-name">Gestión de Flota</span>
                </h1>
                <p class="text-slate-500 font-medium mt-1">Panel de Control Operativo & Análisis Predictivo</p>
            </div>
            <div id="dashboard-health-score">
                <!-- SVG Gauge -->
            </div>
        </div>

        <!-- Nivel 1: KPIs Rápidos -->
        <div id="empresa-cards" class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
            <!-- Cargado por JS -->
        </div>

        <!-- Nivel 2: Analítica Operativa -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <!-- Gráfico 1: Cumplimiento Legal -->
            <div class="enterprise-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 class="font-bold text-slate-800">Cumplimiento Legal de Flota</h3>
                    <span class="badge badge-info">Estado Actual</span>
                </div>
                <div class="chart-container">
                    <canvas id="chart-compliance"></canvas>
                </div>
                <div id="compliance-legend" style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; font-size: 0.75rem; font-weight: 600; color: #64748b;">
                    <!-- Leyenda dinámica -->
                </div>
            </div>

            <!-- Gráfico 2: Proyección de Vencimientos -->
            <div class="enterprise-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 class="font-bold text-slate-800">Vencimientos Proyectados (6 Meses)</h3>
                    <span class="badge" style="background:#f1f5f9; color:#475569;">Planificación</span>
                </div>
                <div class="chart-container">
                    <canvas id="chart-projection"></canvas>
                </div>
                <p style="font-size: 0.7rem; color: #94a3b8; margin-top: 1rem; text-align: center;">Estimación mensual de trámites y renovaciones.</p>
            </div>
        </div>

        <!-- Nivel 3: Gestión Predictiva -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8" id="dashboard-analytics-container" style="display: none;">
            <!-- Análisis de Datos e Hallazgos -->
            <div class="lg:col-span-2 enterprise-card" style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="width: 8px; height: 8px; background: #1e293b; border-radius: 50%;"></div>
                    <h3 class="enterprise-title" style="font-size: 1.1rem; margin:0;">Análisis Operativo & Hallazgos</h3>
                </div>
                <div id="dashboard-ai-insights">
                    <!-- Insights generados por JS -->
                </div>
            </div>

            <!-- Alertas Críticas -->
            <div class="enterprise-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
                <h3 class="font-bold text-slate-800 mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#1e293b;"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                    Tareas Pendientes
                </h3>
                <div id="dashboard-alerts" style="display: flex; flex-direction: column; gap: 1rem; flex: 1;">
                    <!-- Alertas críticas -->
                </div>
                <!-- Action Footer -->
                <div id="dashboard-alerts-footer" class="card-footer-action" style="display: none;">
                    <span style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Acciones Rápidas</span>
                    <button onclick="showView('conductores')" style="font-size: 0.7rem; font-weight: 800; color: #4f46e5; cursor: pointer; border: none; background: none; padding: 0;">VER DETALLES →</button>
                </div>
            </div>
        </div>
    </div>
