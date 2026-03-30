// ==========================
//  GESTIÓN DE RESOLUCIONES (REFACTORIZADO)
// ==========================

window.resolucionesCurrentPage = 1;
window.resolucionesLastPage = 1;
window.resolucionesLimit = 10;

async function loadResoluciones(page = 1) {
  window.resolucionesCurrentPage = page;
  const container = document.getElementById('resoluciones-table');
  const paginationDiv = document.getElementById('resoluciones-pagination');
  
  container.innerHTML = '<div class="loading-state" style="padding:2rem; text-align:center; color:#666;"><p>Buscando documentos...</p></div>';

  let endpoint = `/documentos?include=tipo_documento&limit=${window.resolucionesLimit}&page=${page}`;
  
  // Construcción de Filtros
  let filtros = [];
  
  // 1. Siempre filtrar por tipo "Resolución" (basado en observaciones como palabra clave según lógica previa)
  filtros.push({
    "column": "observaciones",
    "operator": "like",
    "value": "%Resolución%"
  });

  // 2. Filtro por Empresa
  if (window.myEmpresaId) {
    filtros.push({
      "column": "empresa_id",
      "operator": "=",
      "value": window.myEmpresaId
    });
  }

  // 3. Filtros de búsqueda del usuario
  const searchText = document.getElementById('resolucion-search-text').value;
  const searchDate = document.getElementById('resolucion-search-date').value;

  if (searchText) {
    filtros.push({
      "column": "observaciones",
      "operator": "like",
      "value": `%${searchText}%`
    });
  }
  if (searchDate) {
    // Asumiendo que buscamos por created_at truncado a fecha
    filtros.push({
      "column": "created_at",
      "operator": ">=",
      "value": searchDate + ' 00:00:00'
    });
    filtros.push({
      "column": "created_at",
      "operator": "<=",
      "value": searchDate + ' 23:59:59'
    });
  }

  const filtroJson = encodeURIComponent(JSON.stringify(filtros));
  endpoint += `&filter=${filtroJson}&orderBy=created_at&orderDirection=desc`;

  try {
    const res = await apiGet(endpoint);
    // El backend retorna { status, data: { data: [], meta: {} }, total } o { status, data: [], total }
    const docs = normalizeList(res);
    
    // Extraer metadatos de paginación (Laravel paginator o meta de Resource)
    const meta = res.data?.meta || res.data || {};
    window.resolucionesLastPage = meta.last_page || Math.ceil((res.total || 0) / window.resolucionesLimit) || 1;

    if (docs.length === 0) {
      container.innerHTML = '<div style="padding:3rem; text-align:center; background:#f9fafb; border-radius:8px; color:#6b7280;"><p>No se encontraron resoluciones con los filtros aplicados.</p></div>';
      paginationDiv.style.display = 'none';
      return;
    }

    // Renderizar Tabla
    let html = `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <thead style="background:#f3f4f6; border-bottom:2px solid #e5e7eb;">
              <tr>
                  <th style="padding:1rem; text-align:center; color:#374151; font-weight:600; width:50px;">#</th>
                  <th style="padding:1rem; text-align:left; color:#374151; font-weight:600;">Asunto / Detalle</th>
                  <th style="padding:1rem; text-align:left; color:#374151; font-weight:600;">Fecha de Emisión</th>
                  <th style="padding:1rem; text-align:center; color:#374151; font-weight:600;">Acciones</th>
              </tr>
          </thead>
          <tbody>`;

    docs.forEach((d, index) => {
      const rowNum = ((page - 1) * window.resolucionesLimit) + index + 1;
      const fecha = d.created_at ? new Date(d.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

      html += `<tr style="border-bottom:1px solid #f3f4f6; transition: background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='transparent'">
              <td style="padding:1rem; text-align:center; color:#6b7280; font-weight:500;">${rowNum}</td>
              <td style="padding:1rem;">
                <div style="font-weight:600; color:#111827;">${d.observaciones || 'Documento Oficial'}</div>
              </td>
              <td style="padding:1rem; color:#4b5563;">${fecha}</td>
              <td style="padding:1rem;">
                  <div style="display:flex; gap:0.5rem; justify-content:center;">
                    <button class="btn-primary btn-sm" onclick="previewResolucion(${d.id})" title="Ver Documento">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Ver
                    </button>
                    <button class="btn-secondary btn-sm" onclick="downloadDocumento(${d.id})" title="Descargar PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descargar
                    </button>
                  </div>
              </td>
          </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;

    // Actualizar Paginación UI
    paginationDiv.style.display = 'flex';
    const from = meta.from || ((page - 1) * window.resolucionesLimit + 1);
    const to = meta.to || (from + docs.length - 1);
    const total = res.total || meta.total || 0;
    document.getElementById('resol-pagi-info').textContent = `${from} - ${to} de ${total}`;
    document.getElementById('btn-resol-prev').disabled = (page <= 1);
    document.getElementById('btn-resol-next').disabled = (page >= window.resolucionesLastPage);

  } catch (error) {
    console.error("Error loading resolutions:", error);
    container.innerHTML = '<div class="text-center p-8 text-red-500">Error al conectar con el servidor.</div>';
  }
}

// Controladores de búsqueda
window.handleResolucionesSearch = () => {
  loadResoluciones(1);
};

window.clearResolucionesSearch = () => {
  document.getElementById('resolucion-search-text').value = '';
  document.getElementById('resolucion-search-date').value = '';
  loadResoluciones(1);
};

window.changeResolucionesPage = (dir) => {
  let nextPage = window.resolucionesCurrentPage;
  if (dir === 'next' && nextPage < window.resolucionesLastPage) nextPage++;
  if (dir === 'prev' && nextPage > 1) nextPage--;
  loadResoluciones(nextPage);
};

// --- PREVISUALIZACIÓN PDF ---

window.previewResolucion = async function(id) {
  const modal = document.getElementById('modal-preview-pdf');
  const container = document.getElementById('preview-pdf-container');
  const spinner = document.getElementById('pdf-loading-spinner');
  
  // Abrir modal inmediatamente con el spinner mostrado
  modal.style.display = 'flex';
  if (spinner) spinner.style.display = 'block';
  
  // Limpiar iframe previo si existiera
  const oldIframe = container.querySelector('iframe');
  if (oldIframe) oldIframe.remove();

  try {
    const response = await fetch(`/api/documentos/${id}/file`, {
      method: 'GET',
      credentials: 'same-origin'
    });
    
    if (!response.ok) throw new Error("No se pudo obtener el archivo del servidor.");
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Ocultar spinner y mostrar iframe
    if (spinner) spinner.style.display = 'none';
    
    container.innerHTML += `<iframe src="${url}#toolbar=0" style="width:100%; height:100%; border:none; position:absolute; top:0; left:0;"></iframe>`;
    
    // Guardar URL para limpiar al cerrar
    window.currentPreviewUrl = url;
  } catch (e) {
    console.error("Preview error:", e);
    if (spinner) spinner.style.display = 'none';
    container.innerHTML += `<div style="text-align:center; color:#fff; padding:2rem;">
        <svg style="width:48px; height:48px; margin:0 auto 1rem; color:#f87171;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <p style="font-weight:600;">Error al previsualizar</p>
        <p style="font-size:0.85rem; opacity:0.8;">${e.message}</p>
    </div>`;
  }
};

window.closePdfPreview = () => {
  document.getElementById('modal-preview-pdf').style.display = 'none';
  const container = document.getElementById('preview-pdf-container');
  container.innerHTML = '';
  
  // Limpiar memoria
  if (window.currentPreviewUrl) {
    URL.revokeObjectURL(window.currentPreviewUrl);
    window.currentPreviewUrl = null;
  }
};

// Función para descargar PDF (Mantener compatibilidad)
window.downloadDocumento = async function (id) {
  showNotification('info', 'Descargando', 'Obteniendo documento...');
  try {
    const response = await fetch(`/api/documentos/${id}/file`, {
      method: 'GET',
      credentials: 'same-origin'
    });
    if (!response.ok) throw new Error("Archivo no disponible");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Forzar descarga con nombre si es posible, o abrir en nueva pestaña
    const link = document.createElement('a');
    link.href = url;
    link.download = `Documento_Ref_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (e) {
    showNotification('error', 'Error', 'No se pudo descargar el documento.');
  }
};

// Exponer al scope global
window.loadResoluciones = loadResoluciones;