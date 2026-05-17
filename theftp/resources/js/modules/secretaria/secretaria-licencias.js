// ============================================================
// secretaria-licencias.js
// Auditoría y Verificación de Licencias por el Tránsito
// ============================================================

window.allLicenciasAudit = [];
window.filteredLicenciasAudit = [];
window.currentPageLicencias = 1;
window.pageSizeLicencias = 10;
window.licenciaAuditIdActual = null;

/**
 * Carga inicial de licencias para auditoría
 */
window.loadLicenciasAudit = async function () {
    const container = document.getElementById('licencias-audit-table');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg class="w-12 h-12 mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <p>Sincronizando expedientes de conductores...</p>
        </div>
    `;

    try {
        // Cargar conductores con sus licencias y categorías asociadas
        const resp = await apiCall('/conductores-licencias?include=conductor.persona,licencia.categoria');
        const list = normalizeList(resp);

        // Mapeamos el modelo para facilitar el filtrado y visualización
        window.allLicenciasAudit = list.map(l => {
            const lic = l.licencia || {};
            const p = l.conductor?.persona || {};
            return {
                id: l.id,
                licencia_id: lic.id,
                conductor_id: l.conductor?.id,
                persona_id: l.conductor?.persona_id || l.conductor?.persona?.id,
                nombre: `${p.name || ''} ${p.last_name || ''}`.trim() || 'Desconocido',
                nui: p.nui || 'N/A',
                numero: lic.numero || 'N/A',
                categoria: lic.categoria,
                fecha_vencimiento: lic.fecha_vencimiento,
                organismo: lic.organismo_transito || 'N/A',
                verificado: lic.verificado_secretaria,
                estado_real: l.conductor?.estado, // Estado real del Conductor (Booleano)
                motivo: l.conductor?.motivo_estado // Motivo del Conductor (Donde se guarda el rechazo)
            };
        });

        window.filteredLicenciasAudit = [...window.allLicenciasAudit];
        window.currentPageLicencias = 1;
        renderLicenciasAuditTable();

    } catch (e) {
        console.error('Error loadLicenciasAudit:', e);
        container.innerHTML = `<div class="p-4 text-red-500 bg-red-50 rounded-lg">Error al cargar datos: ${e.message}</div>`;
    }
};

/**
 * Renderiza la tabla paginada de auditoría
 */
function renderLicenciasAuditTable() {
    const container = document.getElementById('licencias-audit-table');
    if (!container) return;

    if (window.filteredLicenciasAudit.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center text-gray-500 bg-white">
                <p class="text-lg font-medium">No se encontraron licencias coincidentes</p>
                <p class="text-sm">Ajusta los criterios de búsqueda o verifica los registros del panel empresarial.</p>
            </div>
        `;
        return;
    }

    // Paginación
    const start = (window.currentPageLicencias - 1) * window.pageSizeLicencias;
    const end = start + window.pageSizeLicencias;
    const pageItems = window.filteredLicenciasAudit.slice(start, end);
    const totalPages = Math.ceil(window.filteredLicenciasAudit.length / window.pageSizeLicencias);

    let html = `
        <table class="min-w-full divide-y divide-slate-100 bg-white">
            <thead class="bg-slate-50">
                <tr>
                    <th class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conductor</th>
                    <th class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nro. Licencia</th>
                    <th class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                    <th class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                    <th class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit. Secretaría</th>
                    <th class="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
    `;

    pageItems.forEach(l => {
        // Mapeo Visual de Categoría (B -> C1 / C2 según requerimiento)
        const catDisplay = formatCategoriaAudit(l.categoria);

        // Semaforización de Vencimiento
        let vencColor = 'text-slate-600';
        let vencLabel = l.fecha_vencimiento || 'N/A';
        if (l.fecha_vencimiento) {
            const diff = Math.ceil((new Date(l.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                vencColor = 'text-red-600 font-bold';
                vencLabel += ' (Vencida)';
            } else if (diff <= 30) {
                vencColor = 'text-amber-600 font-bold';
                vencLabel += ` (En ${diff}d)`;
            }
        }

        // Estado de Verificación Secretaría (3 Estados: Pendiente, Verificada, Rechazada)
        // Estado de Verificación Secretaría (Rediseño Minimalista)
        let auditBadge = '';
        if (l.verificado === true || l.verificado === 1) {
            auditBadge = `<span class="audit-badge verified">Verificada</span>`;
        } else if (l.estado_real === false && (l.motivo || '').toUpperCase().includes('AUDITORÍA')) {
            auditBadge = `<span class="audit-badge rejected">Rechazada</span>`;
        } else {
            auditBadge = `<span class="audit-badge pending">Pendiente</span>`;
        }

        html += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-slate-800 uppercase tracking-tight">${l.nombre}</div>
                    <div class="text-[10px] text-slate-400 capitalize">NUI: ${l.nui}</div>
                </td>
                <td class="px-6 py-4 text-sm font-mono text-slate-600">${l.numero}</td>
                <td class="px-6 py-4 text-sm">${catDisplay}</td>
                <td class="px-6 py-4 text-xs ${vencColor}">${vencLabel}</td>
                <td class="px-6 py-4">
                    ${auditBadge}
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openVerificacionLicenciaModal(${l.id})" 
                        class="px-4 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 text-[10px] font-bold rounded-lg transition-all active:scale-95 shadow-sm">
                        Auditar Registro
                    </button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;

    // Footer de Paginación
    html += `
        <div class="px-6 py-4 border-t border-slate-50 bg-white flex items-center justify-between">
            <div class="text-xs text-slate-500 font-medium">
                Página <span class="text-slate-800">${window.currentPageLicencias}</span> de <span class="text-slate-800">${totalPages}</span> 
                (${window.filteredLicenciasAudit.length} expedientes)
            </div>
            <div class="flex gap-2">
                <button onclick="changeLicenciasAuditPage(${window.currentPageLicencias - 1})" 
                    ${window.currentPageLicencias === 1 ? 'disabled style="opacity:0.5"' : ''}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button onclick="changeLicenciasAuditPage(${window.currentPageLicencias + 1})" 
                    ${window.currentPageLicencias === totalPages || totalPages === 0 ? 'disabled style="opacity:0.5"' : ''}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Cambio de página
 */
window.changeLicenciasAuditPage = function (page) {
    window.currentPageLicencias = page;
    renderLicenciasAuditTable();
    document.getElementById('view-licencias').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Filtro de búsqueda dinámico
 */
window.filterLicenciasAudit = function (query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        window.filteredLicenciasAudit = [...window.allLicenciasAudit];
    } else {
        window.filteredLicenciasAudit = window.allLicenciasAudit.filter(l => 
            l.nombre.toLowerCase().includes(q) || 
            l.numero.toLowerCase().includes(q) ||
            l.nui.toLowerCase().includes(q)
        );
    }
    window.currentPageLicencias = 1;
    renderLicenciasAuditTable();
};

/**
 * Abre el Modal de Verificación (Expediente de Auditoría)
 */
window.openVerificacionLicenciaModal = async function (id) {
    // Buscar el ítem en la lista cargada
    const item = window.allLicenciasAudit.find(i => i.id === id);
    if (!item) return;

    window.licenciaAuditIdActual = id;
    const modal = document.getElementById('modal-verificar-licencia');
    const detailContainer = document.getElementById('licencia-audit-details');
    const pdfViewer = document.getElementById('licencia-pdf-viewer');
    const downloadBtn = document.getElementById('btn-download-licencia');

    // Reset UI
    switchLicenciaTab('documento');
    toggleAuditRejection(false);
    document.getElementById('audit-rejection-reason').value = '';
    document.querySelector('input[name="audit-status"][value="aprobado"]').checked = true;

        // Determinar el Estado de Auditoría (Rol de Secretaría)
        let auditLabel = 'Pendiente Audit.';
        let auditClass = 'bg-amber-100 text-amber-700 border-amber-200';
        let auditDot = 'bg-amber-500';

        if (item.verificado) {
            auditLabel = 'Auditoría Verificada';
            auditClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
            auditDot = 'bg-emerald-500';
        } else if (!item.estado_real && (item.motivo || '').toUpperCase().includes('AUDITORÍA')) {
            auditLabel = 'Auditoría Rechazada';
            auditClass = 'bg-red-100 text-red-700 border-red-200';
            auditDot = 'bg-red-500 animate-pulse';
        }

        detailContainer.innerHTML = `
        <div class="flex items-center gap-3 pr-6 border-r border-slate-200">
            <div class="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                ${item.nombre.charAt(0)}
            </div>
            <div class="flex flex-col">
                <h4 class="font-bold text-slate-800 uppercase tracking-tight text-[11px] leading-none">${item.nombre}</h4>
                <div class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">NUI: ${item.nui}</div>
            </div>
        </div>

        <div class="flex items-center gap-8">
            <div class="flex flex-col">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Nro. Licencia</span>
                <span class="text-[11px] font-mono font-bold text-slate-700">${item.numero}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Categoría</span>
                <span class="text-[10px] font-bold text-slate-700">${formatCategoriaAudit(item.categoria)}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Vencimiento</span>
                <span class="text-[10px] font-bold text-indigo-600">${item.fecha_vencimiento || 'N/A'}</span>
            </div>
            <div class="flex flex-col max-w-[150px]">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organismo</span>
                <span class="text-[9px] font-bold text-slate-600 truncate" title="${item.organismo}">${item.organismo}</span>
            </div>
        </div>

        <div class="ml-auto flex flex-col items-end gap-1">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm leading-none ${auditClass}">
                <div class="w-2 h-2 rounded-full ${auditDot}"></div>
                <span class="text-[10px] font-black uppercase tracking-widest">${auditLabel}</span>
            </div>
            <div class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pr-2">
                Estado Operativo: <span class="${item.estado_real ? 'text-emerald-500' : 'text-red-500'}">${item.estado_real ? 'Activo' : 'Inactivo'}</span>
                ${!item.estado_real ? `<span class="italic font-normal"> - ${item.motivo || 'Sin motivo'}</span>` : ''}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    pdfViewer.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 text-sm">Cargando visor de seguridad RUNT...</div>';

    try {
        // 1. Obtener detalles extendidos de la licencia (incluyendo el documento_id actual)
        const licResp = await apiCall(`/conductores-licencias/${id}?include=licencia.documento`);
        const fullLic = licResp?.data?.licencia || {};
        window.lastFullLicenciaLoaded = fullLic; // Guardamos para re-enviar en el PUT y evitar 422
        let documentoId = fullLic.documento_id;

        // 2. Intentar cargar el PDF con el ID vinculado
        let response = null;
        if (documentoId) {
            response = await fetch(`/api/documentos/${documentoId}/file`, {
                method: 'GET', headers: window.getAuthHeaders ? window.getAuthHeaders() : { 'Accept': 'application/json' }
            });
        }

        // 3. Fallback: Si no hay ID o el archivo da 404, buscar por el número de licencia en observaciones
        if (!response || !response.ok) {
            console.log("Iniciando búsqueda de respaldo por número de licencia...");
            const latestDocId = await findLatestDocumentByLicencia(item.numero);
            if (latestDocId && latestDocId !== documentoId) {
                response = await fetch(`/api/documentos/${latestDocId}/file`, {
                    method: 'GET', headers: window.getAuthHeaders ? window.getAuthHeaders() : { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    documentoId = latestDocId;
                    if (window.lastFullLicenciaLoaded) window.lastFullLicenciaLoaded.documento_id = latestDocId;
                }
            }
        }

        if (response && response.ok) {
            const blob = await response.blob();
            const pdfBlobUrl = window.URL.createObjectURL(blob);
            // Optimización de visualización: Ocultar paneles laterales y ajustar al ancho
            const optimizedUrl = `${pdfBlobUrl}#navpanes=0&view=FitH&toolbar=1`;
            
            pdfViewer.innerHTML = `<iframe src="${optimizedUrl}" class="w-full h-full border-0"></iframe>`;
            downloadBtn.href = pdfBlobUrl; // El botón de descarga usa la URL limpia
            downloadBtn.style.display = 'flex';
            window.currentLicenciaPdfUrl = pdfBlobUrl;
        } else {
            pdfViewer.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center"><svg class="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg><p class="text-sm font-medium">No se encontró el documento en el servidor (Ruta no disponible).</p></div>';
            downloadBtn.style.display = 'none';
        }

        // Cargar historial de novedades (reportes de inactividad de la empresa)
        loadHistorialNovedadesAudit(item.conductor_id, item.licencia_id);

    } catch (e) {
        console.error('Error al cargar documento de licencia:', e);
        pdfViewer.innerHTML = `<p class="p-8 text-red-500">Error crítico al cargar documento: ${e.message}</p>`;
    }
};

/**
 * Busca específicamente en la tabla documentos por observaciones que contengan la licencia
 */
async function findLatestDocumentByLicencia(numero) {
    try {
        const query = encodeURIComponent(JSON.stringify([
            { "column": "observaciones", "operator": "like", "value": `%Licencia #${numero}%` }
        ]));
        // Buscamos el documento más reciente (ID más alto)
        const resp = await apiCall(`/documentos?filter=${query}&limit=5&sort=-id`);
        const docs = normalizeList(resp);
        
        if (docs.length > 0) {
            console.log("Documento de respaldo encontrado:", docs[0].id);
            return docs[0].id; // Retornamos el más reciente
        }
    } catch (e) {
        console.error("Error en búsqueda de respaldo:", e);
    }
    return null;
}

/**
 * Carga y muestra las novedades (inactividades) del conductor/licencia
 */
async function loadHistorialNovedadesAudit(conductorId, licenciaId) {
    const listContainer = document.getElementById('licencia-novedades-list');
    listContainer.innerHTML = '<p class="text-xs text-slate-400 py-4">Consultando historial de la empresa...</p>';

    try {
        // Consultamos novedades de la licencia y del conductor
        const [novLic, novCond] = await Promise.all([
            apiCall(`/novedades-licencias?licencia_id=${licenciaId}&limit=100`),
            apiCall(`/novedades-conductores?conductor_id=${conductorId}&limit=100`)
        ]);

        const allNov = [...normalizeList(novLic), ...normalizeList(novCond)];
        
        if (allNov.length === 0) {
            listContainer.innerHTML = `
                <div class="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p class="text-xs font-medium text-slate-500 italic">No existen reportes de inactividad históricos para este conductor.</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha (más reciente arriba)
        allNov.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        listContainer.innerHTML = allNov.map(n => {
            const isVigente = !n.deleted_at;
            const border = isVigente ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white opacity-70';
            return `
                <div class="p-3 border rounded-xl ${border} transition-all">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-[10px] font-bold uppercase tracking-tight text-slate-700">${n.tipo_novedad || 'Reporte de Inactividad'}</span>
                        <span class="text-[9px] font-mono text-slate-400">${n.created_at?.slice(0,10)}</span>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-tight">${n.observaciones || 'Sin detalles adicionales.'}</p>
                    ${isVigente ? '<div class="mt-2 text-[9px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Reporte Vigente</div>' : ''}
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Error loadHistorialNovedadesAudit:', e);
        listContainer.innerHTML = '<p class="text-xs text-red-500">No se pudo cargar el historial de novedades.</p>';
    }
}

/**
 * Toggle para mostrar/ocultar el cuadro de motivo de rechazo
 */
window.toggleAuditRejection = function (show) {
    document.getElementById('audit-rejection-box').style.display = show ? 'block' : 'none';
};

/**
 * Switch entre Visor de PDF e Historial
 */
window.switchLicenciaTab = function (tab) {
    const paneDoc = document.getElementById('licencia-pane-documento');
    const paneHist = document.getElementById('licencia-pane-historial');
    const tabDoc = document.getElementById('tab-doc');
    const tabHist = document.getElementById('tab-hist');

    if (tab === 'documento') {
        paneDoc.classList.remove('hidden');
        paneHist.classList.add('hidden');
        tabDoc.classList.add('border-indigo-600', 'text-indigo-600');
        tabDoc.classList.remove('border-transparent', 'text-slate-400');
        tabHist.classList.remove('border-indigo-600', 'text-indigo-600');
        tabHist.classList.add('border-transparent', 'text-slate-400');
    } else {
        paneDoc.classList.add('hidden');
        paneHist.classList.remove('hidden');
        tabHist.classList.add('border-indigo-600', 'text-indigo-600');
        tabHist.classList.remove('border-transparent', 'text-slate-400');
        tabDoc.classList.remove('border-indigo-600', 'text-indigo-600');
        tabDoc.classList.add('border-transparent', 'text-slate-400');
    }
};

window.closeModalVerificarLicencia = function () {
    document.getElementById('modal-verificar-licencia').style.display = 'none';
    window.licenciaAuditIdActual = null;
    // Detener el iframe del PDF para liberar memoria y limpiar URL del blob
    document.getElementById('licencia-pdf-viewer').innerHTML = '';
    
    if (window.currentLicenciaPdfUrl) {
        window.URL.revokeObjectURL(window.currentLicenciaPdfUrl);
        window.currentLicenciaPdfUrl = null;
    }
};

/**
 * Enviar veredicto final de auditoría
 */
window.submitVerificacionLicencia = async function () {
    const status = document.querySelector('input[name="audit-status"]:checked').value;
    const isAprobado = status === 'aprobado';
    const reason = document.getElementById('audit-rejection-reason').value.trim();

    if (!isAprobado && !reason) {
        showNotification('warning', 'Motivo requerido', 'Debes indicar el motivo del rechazo para inactivar al conductor.');
        return;
    }

    const btn = document.getElementById('btn-submit-verificacion');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Procesando Dictamen...';

    const item = window.allLicenciasAudit.find(i => i.id === window.licenciaAuditIdActual);

    try {
        // 1. Actualizar estado de verificación en la Licencia
        // Enviamos los campos obligatorios que pide el servidor (evitar 422)
        const currentLic = window.lastFullLicenciaLoaded || {};
        const updateData = {
            verificado_secretaria: isAprobado,
            estado: true, // Asegurar que la licencia siga ACTIVA tras la verificación
            // Campos requeridos por el validador del backend:
            categoria_lic_id: currentLic.categoria_lic_id || currentLic.categoria?.id,
            restriccion_lic_id: currentLic.restriccion_lic_id || 1,
            documento_id: currentLic.documento_id,
            numero: currentLic.numero,
            fecha_expedicion: currentLic.fecha_expedicion,
            fecha_vencimiento: currentLic.fecha_vencimiento,
            organismo_transito: currentLic.organismo_transito
        };

        await apiCall(`/licencias/${item.licencia_id}`, 'PUT', updateData);

        // 2. Si es RECHAZO, inactivar al conductor automáticamente (Cascada de negocio)
        if (!isAprobado) {
            await apiCall(`/conductores/${item.conductor_id}`, 'PUT', {
                persona_id: item.persona_id, // Campo obligatorio para el validador
                estado: false,
                motivo_estado: `AUDITORÍA TRÁNSITO RECHAZADA: ${reason}`
            });
            showNotification('info', 'Conductor Inactivado', 'El conductor ha sido bloqueado del sistema por dictamen de la auditoría.');
        } else {
            showNotification('success', 'Auditoría Exitosa', 'La licencia ha sido marcada como verificada oficialmente.');
        }

        closeModalVerificarLicencia();
        loadLicenciasAudit(); // Recargar tabla

    } catch (e) {
        console.error('Error submitVerificacionLicencia:', e);
        showNotification('error', 'Error en Auditoría', 'No se pudo completar el proceso: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
};

/**
 * Alternar Modo Enfoque (Maximizar visor de PDF)
 */
window.toggleAuditFocus = function() {
    const modal = document.getElementById('modal-verificar-licencia');
    const btn = document.getElementById('btn-focus-mode');
    
    modal.classList.toggle('audit-modal-focused');
    
    if (modal.classList.contains('audit-modal-focused')) {
        btn.classList.add('btn-focus-active');
        btn.innerHTML = `
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            MODO NORMAL
        `;
    } else {
        btn.classList.remove('btn-focus-active');
        btn.innerHTML = `
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            MODO ENFOQUE
        `;
    }
}
/**
 * Formatea visualmente la categoría de la licencia según estándares de servicio público
 */
function formatCategoriaAudit(catObj) {
    if (!catObj) return '—';
    const code = (catObj.codigo || '').toUpperCase();
    const desc = catObj.descripcion || '';
    
    // Si ya es C1 o C2, lo devolvemos con su descripción si existe
    if (code === 'C1' || code === 'C2') {
        return `<span class="text-indigo-600 font-bold">${code}</span> <span class="text-[9px] text-slate-400 font-normal">(${desc})</span>`;
    }
    
    return code || '—';
}
