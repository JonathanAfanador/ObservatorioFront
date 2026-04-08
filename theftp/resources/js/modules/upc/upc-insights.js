// ============================================================
// upc-insights.js
// Motor de Auditoría Inteligente y Análisis de Riesgo
// ============================================================

window.runAuditoriaInteligente = async function () {
    const container = document.getElementById('upc-insights-container');
    if (!container) return;

    try {
        // 1. Asegurar que tenemos datos detallados para el análisis
        // Si no existen en el store, los cargamos silenciosamente
        if (!dashboardDataStore.conductores || dashboardDataStore.conductores.length === 0) {
            const res = await apiGet('conductores');
            dashboardDataStore.conductores = res.data || [];
        }
        if (!dashboardDataStore.vehiculos || dashboardDataStore.vehiculos.length === 0) {
            const res = await apiGet('vehiculos');
            dashboardDataStore.vehiculos = res.data || [];
        }

        const hallazgos = [];
        const hoy = new Date();

        // --- Análisis de Riesgo Legal (Conductores) ---
        const porVencer = dashboardDataStore.conductores.filter(c => {
            if (c.licencias && c.licencias.length > 0) {
                const fv = c.licencias[0].fecha_vencimiento;
                if (!fv) return false;
                const diff = Math.ceil((new Date(fv) - hoy) / (1000 * 60 * 60 * 24));
                return diff > 0 && diff <= 30;
            }
            return false;
        }).length;

        const vencidas = dashboardDataStore.conductores.filter(c => {
            if (c.licencias && c.licencias.length > 0) {
                const fv = c.licencias[0].fecha_vencimiento;
                if (!fv) return false;
                return (new Date(fv) - hoy) <= 0;
            }
            return false;
        }).length;

        if (vencidas > 0) {
            hallazgos.push({
                type: 'critical',
                title: 'Inconsistencia Legal Crítica',
                desc: `Identificados <strong>${vencidas} registros</strong> con licencias de conducción fuera de vigencia.`,
                action: 'Ver Registro',
                tab: 'conductores'
            });
        }

        if (porVencer > 0) {
            hallazgos.push({
                type: 'warning',
                title: 'Hallazgo Preventivo',
                desc: `Se detectaron <strong>${porVencer} registros</strong> con documentos próximos a perder vigencia legal (30 días).`,
                action: 'Ver Registro',
                tab: 'conductores'
            });
        }

        // --- Análisis de Integridad de Datos ---
        const sinVerificar = dashboardDataStore.vehiculos.filter(v => v.estado === "Inactivo" || v.estado === false).length;
        if (sinVerificar > 0) {
            hallazgos.push({
                type: 'info',
                title: 'Observación de Flota',
                desc: `<strong>${sinVerificar} unidades</strong> con estado inactivo o sin validación de Secretaría vigente.`,
                action: 'Ver Registro',
                tab: 'vehiculos'
            });
        }

        // --- Cálculo de Índice de Salud Operativa con Explicabilidad ---
        const totalCond = dashboardDataStore.conductores.length;
        const totalVeh = dashboardDataStore.vehiculos.length;
        const totalItems = totalCond + totalVeh;
        
        const condOk = totalCond - vencidas;
        const vehOk = totalVeh - sinVerificar;
        const totalOk = condOk + vehOk;
        
        const healthScore = totalItems > 0 ? Math.round((totalOk / totalItems) * 100) : 100;

        const explanation = {
            conductores: { total: totalCond, ok: condOk, fail: vencidas, label: 'Licencias Vigentes' },
            vehiculos: { total: totalVeh, ok: vehOk, fail: sinVerificar, label: 'Flota Verificada' }
        };

        // Guardar hallazgos para exportación
        dashboardDataStore.lastAudit = { hallazgos, score: healthScore, explanation };

        renderInsights(hallazgos, healthScore, explanation);
    } catch (e) {
        console.error("Error en auditoría inteligente:", e);
    }
};

function renderInsights(hallazgos, score, exp) {
    const container = document.getElementById('upc-insights-container');
    if (!container) return;

    container.style.display = 'block';
    
    let html = `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <!-- Encabezado con detalles técnicos de cumplimiento -->
            <div style="padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
                    <h3 style="font-size: 0.85rem; font-weight: 800; color: #334155; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Hallazgos de Inteligencia Operativa</h3>
                </div>
                
                <div style="display: flex; gap: 1.5rem; align-items: center;">
                    <div style="display: flex; gap: 1rem; border-right: 1px solid #e2e8f0; padding-right: 1.5rem;">
                        <div style="text-align: right;">
                            <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">${exp.conductores.label}</div>
                            <div style="font-size: 0.85rem; font-weight: 800; color: #1e293b;">${exp.conductores.ok} / ${exp.conductores.total}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">${exp.vehiculos.label}</div>
                            <div style="font-size: 0.85rem; font-weight: 800; color: #1e293b;">${exp.vehiculos.ok} / ${exp.vehiculos.total}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Salud:</span>
                        <div style="width: 80px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${score}%; height: 100%; background: ${score > 90 ? '#10b981' : (score > 60 ? '#f59e0b' : '#ef4444')}; transition: width 1s;"></div>
                        </div>
                        <span style="font-size: 0.9rem; font-weight: 900; color: #0f172a;">${score}%</span>
                    </div>
                </div>
            </div>`;

    if (hallazgos.length > 0) {
        html += `<div style="padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.25rem;">`;
        hallazgos.forEach(h => {
            // Colores profesionales: Amber profundo para advertencias, Crimson para críticos
            const borderColor = h.type === 'critical' ? '#fca5a5' : (h.type === 'warning' ? '#fcd34d' : '#bae6fd');
            const accentColor = h.type === 'critical' ? '#b91c1c' : (h.type === 'warning' ? '#b45309' : '#0369a1');
            const bgColor = h.type === 'critical' ? '#fff1f2' : (h.type === 'warning' ? '#fffbeb' : '#f0f9ff');

            html += `
                <div style="padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid ${accentColor}; background: white; display: flex; gap: 1.25rem; align-items: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div style="padding: 0.5rem; color: ${accentColor}; background: #f8fafc; border-radius: 6px;">
                        <svg style="width: 1.5rem; height: 1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                            ${h.type === 'critical' ? '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>' : 
                             (h.type === 'warning' ? '<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' : '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>')}
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem 0; text-transform: uppercase; letter-spacing: 0.025em;">${h.title}</h4>
                        <p style="font-size: 0.875rem; color: #475569; margin: 0 0 1rem 0; line-height: 1.5;">${h.desc}</p>
                        <button onclick="document.querySelector('[data-view=${h.tab}]').click()" 
                                style="padding: 0.4rem 0.8rem; background: transparent; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #334155; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s;">
                            ${h.action}
                        </button>
                    </div>
                </div>`;
        });
        html += `</div>`;
    } else {
        // Estado de Cumplimiento Total (Cuando todo está al 100%)
        html += `
            <div style="padding: 2.5rem; text-align: center;">
                <div style="width: 48px; height: 48px; background: #f0fdf4; color: #166534; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <svg style="width: 24px; height: 24px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h4 style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">Cumplimiento Operativo Total Detectado</h4>
                <p style="font-size: 0.875rem; color: #64748b; max-width: 450px; margin: 0 auto;">No se han encontrado riesgos críticos ni preventivos. El sistema se encuentra operando bajo los parámetros de vigencia y verificación establecidos.</p>
            </div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}
