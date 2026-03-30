// ==========================================================
// GESTIÓN INTELIGENTE DE FLOTA - MOTOR DE ANALÍTICA OPERATIVA
// ==========================================================

let chartsInstances = {}; // Para destruir gráficos previos al recargar

/**
 * Función principal: Orquestación del Dashboard Enterprise
 */
async function loadDashboard() {
  const kpiContainer = document.getElementById('empresa-cards');
  const analysisContainer = document.getElementById('dashboard-analytics-container');
  
  if (!kpiContainer) return;

  try {
    // 1. Carga masiva de datos (Deep Fetch)
    const [
      conductoresResp,
      licenciasResp,
      vehiculosResp,
      rutasResp,
      empresaResp
    ] = await Promise.all([
      apiGet('/conductores'),
      apiGet('/conductores-licencias?include=licencia.categoria'),
      apiGet('/vehiculos?include=tipo'),
      apiGet('/rutas'),
      apiGet(`/empresas/${window.myEmpresaId}`)
    ]);

    const rawData = {
      conductores: normalizeList(conductoresResp),
      licencias: normalizeList(licenciasResp),
      vehiculos: normalizeList(vehiculosResp),
      rutas: normalizeList(rutasResp),
      empresa: empresaResp?.data || empresaResp || {}
    };

    // 2. Personalización de Identidad
    const companyNameEl = document.getElementById('dashboard-company-name');
    if (companyNameEl) {
      companyNameEl.textContent = rawData.empresa.nombre || rawData.empresa.name || 'Gestión de Flota';
    }

    // 3. Procesamiento de Datos (Análisis Operativo)
    const analysis = runOperationalAnalysis(rawData);

    // 4. Renderizado de Componentes Corporativos
    renderKPIs(analysis);
    renderHealthScore(analysis.healthScore);
    renderCharts(analysis);
    renderOperationalInsights(analysis);
    renderAlertsTimeline(analysis.alerts);

    // Mostrar con transición sobria
    if (analysisContainer) {
      analysisContainer.style.display = 'grid';
      analysisContainer.style.opacity = '0';
      setTimeout(() => {
        analysisContainer.style.transition = 'opacity 0.5s ease-out';
        analysisContainer.style.opacity = '1';
      }, 50);
    }

  } catch (error) {
    console.error('Error Crítico Dashboard:', error);
    kpiContainer.innerHTML = `<div class="error-state">Error al inicializar el panel de gestión.</div>`;
  }
}

/**
 * Motor de Análisis de Datos Operativos
 */
function runOperationalAnalysis(data) {
  const now = new Date();
  const next6Months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    let monthName = d.toLocaleString('es-ES', { month: 'long' });
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1); // Capitalizar
    
    next6Months.push({
      label: monthName,
      monthKey: `${d.getFullYear()}-${d.getMonth()}`,
      count: 0
    });
  }

  const stats = {
    totalConductores: data.conductores.length,
    totalVehiculos: data.vehiculos.length,
    totalRutas: data.rutas.length,
    complianceData: [0, 0, 0], // [Vigente, Próximo, Vencido]
    projectionData: next6Months.map(() => 0),
    alerts: [],
    insights: [],
    riskLevel: 'Estable',
    healthScore: 0
  };

  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  // Análisis de Licencias
  data.licencias.forEach(l => {
    const lic = l.licencia || l;
    if (lic.fecha_vencimiento) {
      const venc = new Date(lic.fecha_vencimiento);
      processDateForStats(venc, stats, now, next30Days, next6Months, `Licencia: ${l.conductor?.persona?.name || 'Conductor'}`);
    }
  });

  // Análisis de Vehículos
  data.vehiculos.forEach(v => {
    processDateForStats(new Date(v.soat_vencimiento || v.soat), stats, now, next30Days, next6Months, `SOAT: ${v.placa}`, 'vehiculos');
    processDateForStats(new Date(v.tecnomecanica_vencimiento || v.tecnomecanica), stats, now, next30Days, next6Months, `RTM: ${v.placa}`, 'vehiculos');
  });

  // Cálculo de Salud y Riesgo
  const totalItems = stats.totalConductores + (stats.totalVehiculos * 2);
  const totalVencidos = stats.complianceData[2];
  stats.healthScore = totalItems > 0 ? Math.round(((totalItems - totalVencidos) / totalItems) * 100) : 100;
  
  if (stats.healthScore < 70 || stats.complianceData[2] > 3) stats.riskLevel = 'Crítico';
  else if (stats.healthScore < 90) stats.riskLevel = 'Atención';

  // Generar Insights Técnicos
  generateTechnicalInsights(stats, next6Months);

  return stats;
}

/**
 * Helper para procesar fechas y acumular estadísticas
 */
function processDateForStats(venc, stats, now, next30Days, next6Months, name, module = 'licencias') {
  if (isNaN(venc.getTime())) return;

  // 1. Compliance (Doughnut)
  if (venc < now) {
    stats.complianceData[2]++;
    stats.alerts.push({ type: 'danger', title: 'Vencido', text: name, module });
  } else if (venc < next30Days) {
    stats.complianceData[1]++;
    stats.alerts.push({ type: 'warning', title: 'Crítico', text: name, module });
  } else {
    stats.complianceData[0]++;
  }

  // 2. Proyección (Bar Chart)
  next6Months.forEach((m, idx) => {
    const targetMonth = (now.getMonth() + idx) % 12;
    const targetYear = now.getFullYear() + Math.floor((now.getMonth() + idx) / 12);
    if (venc.getFullYear() === targetYear && venc.getMonth() === targetMonth) {
      stats.projectionData[idx]++;
    }
  });
}

/**
 * Generador de Hallazgos Técnicos (Inferencia de Datos)
 */
function generateTechnicalInsights(s, months) {
  const peakMonthIdx = s.projectionData.indexOf(Math.max(...s.projectionData));
  const peakMonth = months[peakMonthIdx].label;
  const totalFleet = s.totalVehiculos + s.totalConductores;
  
  if (s.complianceData[2] > 0) {
    s.insights.push({
      title: 'BRECHA DE CUMPLIMIENTO IDENTIFICADA',
      text: `Se detectaron **${s.complianceData[2]}** documentos fuera de vigencia. Esto representa una vulnerabilidad operativa que requiere atención inmediata para regularizar la operación.`
    });
  }

  if (s.projectionData[peakMonthIdx] > 0) {
    s.insights.push({
      title: 'ANÁLISIS DE CARGA ADMINISTRATIVA',
      text: `El mes de **${peakMonth}** presenta el volumen más alto de vencimientos proyectados (**${s.projectionData[peakMonthIdx]}** trámites). Se aconseja iniciar la recolección de documentos 15 días antes.`
    });
  }

  if (s.complianceData[1] > 0) {
    s.insights.push({
      title: 'RENOVACIONES PREVENTIVAS',
      text: `Hay **${s.complianceData[1]}** documentos próximos a expirar en los siguientes 30 días. Programar estas renovaciones ahora evitará ceses operativos no planificados.`
    });
  }

  if (s.insights.length === 1) {
    s.insights.push({
      title: 'RESUMEN DE FLOTA',
      text: `Se analizaron exitosamente **${s.totalVehiculos} vehículos** y **${s.totalConductores} conductores**. El sistema de alerta está monitoreando todas las vigencias actuales.`
    });
  }
}

/**
 * Renderizado de Gráficos (Paleta Enterprise)
 */
function renderCharts(s) {
  Object.values(chartsInstances).forEach(c => c.destroy());

  const ctxCompliance = document.getElementById('chart-compliance')?.getContext('2d');
  const ctxProjection = document.getElementById('chart-projection')?.getContext('2d');

  if (ctxCompliance) {
    chartsInstances.compliance = new Chart(ctxCompliance, {
      type: 'doughnut',
      data: {
        labels: ['Vigentes', 'Por Vencer', 'Vencidos'],
        datasets: [{
          data: s.complianceData,
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '80%'
      }
    });

    const legendEl = document.getElementById('compliance-legend');
    if (legendEl) {
      legendEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;background:#10b981;border-radius:2px"></div> Vigentes (${s.complianceData[0]})</div>
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;background:#f59e0b;border-radius:2px"></div> Por Vencer (${s.complianceData[1]})</div>
        <div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;background:#ef4444;border-radius:2px"></div> Vencidos (${s.complianceData[2]})</div>
      `;
    }
  }

  if (ctxProjection) {
    chartsInstances.projection = new Chart(ctxProjection, {
      type: 'bar',
      data: {
        labels: s.projectionData.map((_, i) => ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][(new Date().getMonth() + i) % 12]),
        datasets: [{
          label: 'Renovaciones',
          data: s.projectionData,
          backgroundColor: '#6366f1',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

/**
 * Renderizado de KPIs (Estilo Sobrio)
 */
function renderKPIs(s) {
  const container = document.getElementById('empresa-cards');
  const cards = [
    { title: 'Personal', val: s.totalConductores, color: '#1e293b', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { title: 'Vehículos', val: s.totalVehiculos, color: '#1e293b', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M5 8h14l-1.5 7H6.5L5 8z' },
    { title: 'Riesgo', val: s.riskLevel, color: s.riskLevel === 'Crítico' ? '#e11d48' : '#0f172a', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { title: 'Rutas', val: s.totalRutas, color: '#1e293b', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  container.innerHTML = cards.map(c => `
    <div class="enterprise-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">${c.title}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${c.color}" stroke-width="2"><path d="${c.icon}"/></svg>
      </div>
      <div style="font-size: 1.75rem; font-weight: 800; color: #0f172a;">${c.val}</div>
    </div>
  `).join('');
}

/**
 * Gauge de Salud Operativa
 */
function renderHealthScore(score) {
  const container = document.getElementById('dashboard-health-score');
  const color = score > 85 ? '#0f172a' : (score > 70 ? '#f59e0b' : '#e11d48');
  
  container.innerHTML = `
    <div class="enterprise-card" style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; border-radius: 12px;">
      <div style="position: relative; width: 44px; height: 44px;">
        <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" stroke-width="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${score}, 100" />
        </svg>
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; color: ${color};">${score}%</div>
      </div>
      <div style="text-align: left;">
        <div style="font-size: 0.6rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Salud Operativa</div>
        <div style="font-size: 0.85rem; font-weight: 800; color: #0f172a;">${score > 90 ? 'Excelente' : (score > 75 ? 'Óptima' : 'Baja')}</div>
      </div>
    </div>
  `;
}

/**
 * Análisis de Datos e Hallazgos
 */
function renderOperationalInsights(analysis) {
  const container = document.getElementById('dashboard-ai-insights');
  if (!container) return;

  container.innerHTML = analysis.insights.map(ins => `
    <div class="analysis-insight-item" style="border-left-color: #1e293b;">
      <div style="font-size: 0.65rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; letter-spacing: 0.05em;">${ins.title}</div>
      <div style="font-size: 0.875rem; color: #475569; line-height: 1.5;">${ins.text}</div>
    </div>
  `).join('');
}

/**
 * Tabla de Alertas Prioritarias (Refinada)
 */
function renderAlertsTimeline(alerts) {
  const container = document.getElementById('dashboard-alerts');
  const footer = document.getElementById('dashboard-alerts-footer');
  if (!container) return;

  if (alerts.length === 0) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.6; padding-top: 2rem;">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#64748b" stroke-width="1.5" style="margin-bottom: 1rem;"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Operación al día.</p>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  container.innerHTML = alerts.slice(0, 5).map(a => `
    <div style="display: flex; gap: 0.75rem; align-items: start; padding-bottom: 0.85rem; border-bottom: 1px solid #f8fafc;">
      <div style="width: 8px; height: 8px; border-radius: 2px; background: ${a.type === 'danger' ? '#ef4444' : '#f59e0b'}; margin-top: 5px;"></div>
      <div style="flex: 1;">
        <div style="font-size: 0.8rem; font-weight: 800; color: #1e293b;">${a.text}</div>
        <div style="font-size: 0.7rem; color: #64748b; margin-top: 1px;">Documento: <span style="font-weight: 700;">${a.title}</span></div>
      </div>
      <div style="font-size: 0.65rem; font-weight: 900; color: ${a.type === 'danger' ? '#ef4444' : '#f59e0b'}; text-transform: uppercase;">${a.type === 'danger' ? 'Prioridad 1' : 'Prioridad 2'}</div>
    </div>
  `).join('');

  if (footer) footer.style.display = 'flex';
}

window.loadDashboard = loadDashboard;
