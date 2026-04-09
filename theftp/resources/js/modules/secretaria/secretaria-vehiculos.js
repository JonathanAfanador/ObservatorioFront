// ============================================================
// secretaria-vehiculos.js
// Auditoría de Vehículos (Veredicto Único)
// ============================================================

let allVehiculosReview = []; // Cache local para búsqueda instantánea

/**
 * Carga inicial de la flota de vehículos para auditoría de la Secretaría
 */
window.loadVehiculosReview = async function () {
    const container = document.getElementById('vehiculos-review-table');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg class="w-12 h-12 mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <p class="animate-pulse">Sincronizando registros con la base de datos...</p>
        </div>
    `;

    try {
        // Usamos apiGet (estándar del proyecto) e incluimos documentos y relaciones
        const resp = await apiGet('/vehiculos?include=tipo,empresa,documentoSoat,documentoTecno');
        allVehiculosReview = normalizeList(resp);

        renderVehiculosTable(allVehiculosReview);
    } catch (e) {
        console.error('Error al cargar vehículos para revisión:', e);
        container.innerHTML = `
            <div class="p-6 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p><strong>Error de Conexión:</strong> No se pudo sincronizar la flota vehicular. (${e.message})</p>
            </div>
        `;
    }
};

/**
 * Renderiza la tabla de vehículos con filtrado y diseño premium
 */
function renderVehiculosTable(list) {
    const container = document.getElementById('vehiculos-review-table');
    if (list.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p class="text-lg font-medium">No se encontraron vehículos coincidentes</p>
                <p class="text-sm mt-1">Verifica la placa o el nombre de la empresa e intenta de nuevo.</p>
            </div>
        `;
        return;
    }

    const hoy = new Date();

    let html = `
        <table class="modern-table">
            <thead>
                <tr>
                    <th>VEHÍCULO (PLACA)</th>
                    <th>EMPRESA / TIPO</th>
                    <th class="text-center">SOAT</th>
                    <th class="text-center">TECNOMECÁNICA</th>
                    <th class="text-center">S. LEGAL</th>
                    <th class="text-right">AUDITORÍA</th>
                </tr>
            </thead>
            <tbody>
    `;

    list.forEach(v => {
        const empresa = v.empresa?.nombre || v.empresa?.name || '---';
        const tipo = v.tipo?.descripcion || '---';
        const placa = v.placa || 'N/A';

        // Lógica de Semáforo SOAT
        let soatBadge = '<span class="audit-badge badge-pending">Sin Fecha</span>';
        if (v.fecha_vencimiento_soat) {
            const venc = new Date(v.fecha_vencimiento_soat.split('T')[0]);
            const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
            if (diff <= 0) soatBadge = `<span class="audit-badge badge-error">Vencido (${v.fecha_vencimiento_soat.split('T')[0]})</span>`;
            else if (diff <= 30) soatBadge = `<span class="audit-badge badge-warning">Por Vencer (${v.fecha_vencimiento_soat.split('T')[0]})</span>`;
            else soatBadge = `<span class="audit-badge badge-success">Vigente (${v.fecha_vencimiento_soat.split('T')[0]})</span>`;
        }

        // Lógica de Semáforo Tecno
        let tecnoBadge = '<span class="audit-badge badge-pending">Sin Fecha</span>';
        if (v.fecha_vencimiento_tecno) {
            const venc = new Date(v.fecha_vencimiento_tecno.split('T')[0]);
            const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
            if (diff <= 0) tecnoBadge = `<span class="audit-badge badge-error">Vencido (${v.fecha_vencimiento_tecno.split('T')[0]})</span>`;
            else if (diff <= 30) tecnoBadge = `<span class="audit-badge badge-warning">Por Vencer (${v.fecha_vencimiento_tecno.split('T')[0]})</span>`;
            else tecnoBadge = `<span class="audit-badge badge-success">Vigente (${v.fecha_vencimiento_tecno.split('T')[0]})</span>`;
        }

        const enServicio = v.servicio === true || v.servicio === 1 || String(v.servicio) === '1';

        html += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                        </div>
                        <span class="font-bold text-slate-800 tracking-wider">${placa}</span>
                    </div>
                </td>
                <td class="text-[11px]">
                    <span class="font-bold text-slate-700 uppercase block">${empresa}</span>
                    <span class="text-slate-400">${tipo}</span>
                </td>
                <td class="text-center">${soatBadge}</td>
                <td class="text-center">${tecnoBadge}</td>
                <td class="text-center">
                    <span class="audit-badge ${enServicio ? 'badge-success' : 'badge-error'}">
                        ${enServicio ? 'HABILITADO' : 'INMOVILIZADO'}
                    </span>
                </td>
                <td class="text-right">
                    <button onclick="openAuditVehiculoModal(${v.id})" 
                        class="px-4 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm">
                        Auditar Registro
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Filtrado de vehículos en tiempo real por placa o nombre de empresa
 */
window.filterVehiculosReview = function (val) {
    const q = val.toLowerCase().trim();
    if (!q) {
        renderVehiculosTable(allVehiculosReview);
        return;
    }

    const filtered = allVehiculosReview.filter(v => {
        const placa = (v.placa || '').toLowerCase();
        const empresa = (v.empresa?.nombre || v.empresa?.name || '').toLowerCase();
        return placa.includes(q) || empresa.includes(q);
    });

    renderVehiculosTable(filtered);
};

/**
 * Abre el Centro de Auditoría Vehicular (Modal Pro) para un vehículo específico
 */
window.openAuditVehiculoModal = async function (id) {
    const v = allVehiculosReview.find(item => item.id == id);
    if (!v) return;

    // Reset Form y UI
    document.getElementById('vehiculo-id-audit').value = id;
    document.getElementById('placa-audit').textContent = v.placa || 'N/A';
    document.getElementById('veh-rejection-box').style.display = 'none';
    document.getElementById('veh-motivo-rechazo').value = '';
    document.getElementById('veh-detalle-rechazo').value = '';
    document.querySelector('input[name="veh-audit-status"][value="aprobado"]').checked = true;

    // Configurar Visores
    const docSoat = v.documento_soat || v.documentoSoat;
    const docTecno = v.documento_tecno || v.documentoTecno;

    setupDocumentViewer('soat', docSoat);
    setupDocumentViewer('tecno', docTecno);

    // Cargar Historial (Invisible inicialmente por tab)
    switchVehiculoTab('documentos');
    loadVehiculoAuditHistory(id);

    // Mostrar Modal
    document.getElementById('modal-auditoria-vehiculo').style.display = 'flex';
};

/**
 * Configura los visores de documentos dentro del modal
 */
function setupDocumentViewer(type, doc) {
    const actionContainer = document.getElementById(`${type}-actions`);
    const viewerContainer = document.getElementById(`${type}-viewer-container`);

    if (!doc || !doc.url) {
        actionContainer.innerHTML = `<span class="text-[9px] font-bold text-red-500 uppercase tracking-widest">Documento No Adjunto</span>`;
        viewerContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-red-50 border-2 border-dashed border-red-100 rounded-lg mx-4">
                <svg class="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <p class="font-bold text-red-300">INCUMPLIMIENTO EMPRESA</p>
                <p class="text-[10px] mt-1 uppercase tracking-wider">No se encontró respaldo digital para ${type.toUpperCase()}</p>
            </div>
        `;
        return;
    }

    // Botones de acción independientes (Estilo Licencias)
    actionContainer.innerHTML = `
        <button type="button" class="px-3 py-1 text-indigo-600 text-[9px] font-bold flex items-center gap-1.5 hover:bg-indigo-50 rounded-lg transition-colors uppercase tracking-widest" onclick="window.open('${doc.url}', '_blank')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            Original
        </button>
        <a href="${doc.url}" download class="px-3 py-1 text-indigo-600 text-[9px] font-bold flex items-center gap-1.5 hover:bg-indigo-50 rounded-lg transition-colors uppercase tracking-widest">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3"></path></svg>
            Descargar
        </a>
    `;

    // Visor Integrado
    const isImage = doc.url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    if (isImage) {
        viewerContainer.innerHTML = `
            <div class="h-full w-full overflow-auto bg-slate-200 p-4 flex items-center justify-center">
                <img src="${doc.url}" class="max-w-full shadow-2xl rounded-lg border border-white">
            </div>
        `;
    } else {
        viewerContainer.innerHTML = `
            <iframe src="${doc.url}" class="w-full h-full border-none" style="filter: contrast(1.1);"></iframe>
        `;
    }
}

/**
 * Control de pestañas del modal (Documentación vs Historial)
 */
window.switchVehiculoTab = function (tab) {
    const btnDoc = document.getElementById('tab-veh-doc');
    const btnHist = document.getElementById('tab-veh-hist');
    const paneDoc = document.getElementById('pane-veh-doc');
    const paneHist = document.getElementById('pane-veh-hist');

    if (tab === 'documentos') {
        btnDoc.classList.add('border-indigo-600', 'text-indigo-600');
        btnDoc.classList.remove('border-transparent', 'text-slate-400');
        btnHist.classList.remove('border-indigo-600', 'text-indigo-600');
        btnHist.classList.add('border-transparent', 'text-slate-400');
        paneDoc.classList.remove('hidden');
        paneHist.classList.add('hidden');
    } else {
        btnHist.classList.add('border-indigo-600', 'text-indigo-600');
        btnHist.classList.remove('border-transparent', 'text-slate-400');
        btnDoc.classList.remove('border-indigo-600', 'text-indigo-600');
        btnDoc.classList.add('border-transparent', 'text-slate-400');
        paneHist.classList.remove('hidden');
        paneDoc.classList.add('hidden');
    }
};

/**
 * Muestra/Oculta el cuadro de motivo de rechazo según la decisión del auditor
 */
window.toggleVehRejection = function (show) {
    const box = document.getElementById('veh-rejection-box');
    box.style.display = show ? 'block' : 'none';
};

/**
 * Procesa el envío oficial de la Auditoría Vehicular (Veredicto Único)
 */
document.getElementById('form-auditoria-vehiculo')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('vehiculo-id-audit').value;
    const status = document.querySelector('input[name="veh-audit-status"]:checked').value;
    const btnSubmit = document.getElementById('btn-submit-audit-veh');

    const isAprobado = status === 'aprobado';
    
    // Si es rechazo, validar campos
    let payload = { servicio: isAprobado };
    if (!isAprobado) {
        const motivo = document.getElementById('veh-motivo-rechazo').value;
        const detalle = document.getElementById('veh-detalle-rechazo').value;

        if (!motivo || !detalle) {
            showNotification('warning', 'Validación Requerida', 'Para inmovilizar defensivamente debe indicar el motivo técnico y el detalle.');
            return;
        }
        
        payload.estado = 'Inmovilizado';
        payload.motivo_estado = `[AUTORIDAD] ${motivo}: ${detalle}`;
    } else {
        payload.estado = 'Operativo';
        payload.motivo_estado = '[AUTORIDAD] Validado y habilitado por Secretaría de Tránsito.';
    }

    if (btnSubmit.disabled) return;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4V2m0 20v-2m8-8h2M2 12h2m15.364-7.364l1.414-1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" stroke-width="2" /></svg> Aplicando...`;

    try {
        const res = await apiPut(`/vehiculos/${id}`, payload);
        if (res) {
            showNotification('success', isAprobado ? 'Vehículo Habilitado' : 'Vehículo Inmovilizado', 'La decisión legal ha sido registrada con éxito.');
            document.getElementById('modal-auditoria-vehiculo').style.display = 'none';
            loadVehiculosReview(); // Recargar tabla
        }
    } catch (e) {
        showNotification('error', 'Error en Auditoría', e.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Aplicar Dictamen</span> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }
});

/**
 * Carga el historial de novedades/inmovilizaciones del vehículo (Panel de Historial)
 */
async function loadVehiculoAuditHistory(id) {
    const listDiv = document.getElementById('vehiculo-novedades-list');
    listDiv.innerHTML = '<div class="text-center p-8 text-slate-300">Auditando antecedentes históricos...</div>';

    try {
        const res = await apiGet(`/novedades-vehiculos?vehiculo_id=${id}`);
        const novedades = normalizeList(res);

        if (novedades.length === 0) {
            listDiv.innerHTML = `
                <div class="bg-indigo-50 rounded-2xl p-10 text-center border border-indigo-100">
                    <svg class="w-12 h-12 text-indigo-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p class="text-indigo-400 font-bold text-xs uppercase tracking-widest">Sin Antecedentes</p>
                    <p class="text-indigo-300 text-[10px] mt-1 uppercase">Este vehículo no presenta inmovilizaciones ni novedades previas en el sistema nacional.</p>
                </div>
            `;
            return;
        }

        let html = '';
        novedades.forEach(n => {
            const isHistorical = n.deleted_at != null;
            html += `
                <div class="${isHistorical ? 'bg-slate-50' : 'bg-white border-left-4 border-indigo-500 shadow-sm'} p-4 rounded-xl border border-slate-100 relative mb-2">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-black uppercase tracking-tighter ${isHistorical ? 'text-slate-400' : 'text-indigo-600'}">${n.tipo_novedad}</span>
                        <span class="text-[9px] text-slate-400 italic">${n.fecha_inicio} ${n.fecha_fin ? ' → ' + n.fecha_fin : ''}</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">${n.observaciones || '---'}</p>
                    ${!isHistorical ? '<span class="absolute top-2 right-2 flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>' : ''}
                </div>
            `;
        });
        listDiv.innerHTML = html;
    } catch (e) {
        listDiv.innerHTML = `<p class="text-red-500 text-xs">Error al cargar historial: ${e.message}</p>`;
    }
}
