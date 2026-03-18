// ==========================
//  GESTIÓN DE RESOLUCIONES (NUEVO MÓDULO)
// ==========================
async function loadResoluciones() {
  const container = document.getElementById('resoluciones-table');
  container.innerHTML = '<div class="loading-state" style="padding:2rem; text-align:center; color:#666;"><p>Buscando resoluciones...</p></div>';

  let endpoint = '/documentos?include=tipo_documento';
  let filtros = [];

  // Filtro 1: Que sea tipo "Resolución" (por palabra clave en observaciones, similar a secretaría)
  filtros.push({
    "column": "observaciones"
    , "operator": "like"
    , "value": "%Resolución%"
  });
  // FILTRO AUTOMÁTICO: Si tengo empresa ID, solo traigo las mías
  if (myEmpresaId) {
    const filtro = encodeURIComponent(JSON.stringify([{
      "column": "empresa_id"
      , "operator": "="
      , "value": myEmpresaId
    }]));
    endpoint += `&filter=${filtro}`;
  }
  // Filtro 2: Que sea para MI empresa
  if (myEmpresaId) {
    filtros.push({
      "column": "empresa_id"
      , "operator": "="
      , "value": myEmpresaId
    });
  }

  const filtroJson = encodeURIComponent(JSON.stringify(filtros));
  endpoint += `&filter=${filtroJson}`;

  const res = await apiGet(endpoint);
  const docs = normalizeList(res);

  if (docs.length === 0) {
    container.innerHTML = '<div style="padding:3rem; text-align:center; background:#f9fafb; border-radius:8px; color:#6b7280;"><p>No tienes resoluciones asignadas actualmente.</p></div>';
    return;
  }

  let html = `<table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
        <thead style="background:#f3f4f6; border-bottom:2px solid #e5e7eb;">
            <tr>
                <th style="padding:1rem; text-align:left;">ID</th>
                <th style="padding:1rem; text-align:left;">Asunto / Detalle</th>
                <th style="padding:1rem; text-align:left;">Fecha</th>
                <th style="padding:1rem; text-align:left;">Archivo</th>
            </tr>
        </thead>
        <tbody>`;

  docs.forEach(d => {
    const fecha = d.created_at ? new Date(d.created_at).toLocaleDateString() : '-';

    html += `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:1rem;">#${d.id}</td>
            <td style="padding:1rem; font-weight:500;">${d.observaciones || 'Sin asunto'}</td>
            <td style="padding:1rem;">${fecha}</td>
            <td style="padding:1rem;">
                <button onclick="downloadDocumento(${d.id})" style="color:#2563eb; background:none; border:none; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:5px;">
                    <svg style="width:18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar PDF
                </button>
            </td>
        </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Función para descargar PDF (Resoluciones)
window.downloadDocumento = async function (id) {
  showNotification('info', 'Descargando', 'Obteniendo documento...');
  const token = getToken();
  try {
    const response = await fetch(`/api/documentos/${id}/file`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Archivo no disponible");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (e) {
    showNotification('error', 'Error', 'No se pudo descargar el documento.');
  }
};

// Exponer al scope global
window.loadResoluciones = loadResoluciones;